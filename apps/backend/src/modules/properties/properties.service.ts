import { 
  Injectable, 
  Logger,
  NotFoundException,
  UnauthorizedException,
  BadRequestException
} from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { EmbeddingsService } from '../ai/embeddings.service';

@Injectable()
export class PropertiesService {
  private readonly logger = new Logger(PropertiesService.name);

  constructor(
    private supabaseService: SupabaseService,
    private embeddingsService: EmbeddingsService,
  ) {}

  async uploadPhoto(
    file: Express.Multer.File
  ): Promise<{ url: string }> {
    if (!file) {
      this.logger.error('No file uploaded in request');
      throw new BadRequestException('No file uploaded');
    }

    // extension matches the validated mimetype (see properties.controller.ts allowlist),
    // not a hardcoded .jpg regardless of actual content.
    const ext = file.mimetype === 'image/png' ? 'png' : file.mimetype === 'image/webp' ? 'webp' : 'jpg';
    const fileName = `${Date.now()}_${Math.random()
      .toString(36).substring(7)}.${ext}`;

    const { data, error } = await this.supabaseService.admin
        .storage
        .from('property-photos')
        .upload(
          fileName,
          file.buffer,
          {
            contentType: file.mimetype,
            upsert: false,
          }
        );

    if (error) {
      this.logger.error('Upload failed', error);
      throw new Error('Upload failed');
    }

    const { data: urlData } = this.supabaseService.admin
        .storage
        .from('property-photos')
        .getPublicUrl(data.path);

    this.logger.log(`Photo uploaded: ${urlData.publicUrl}`);

    return { url: urlData.publicUrl };
  }

  private generateSlug(name: string, id: string): string {
    const base = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    // Full UUID suffix, not a truncated 6-char prefix — id is already unique
    // (it's the row's own primary key), so appending it whole makes collisions
    // structurally impossible instead of just unlikely.
    return `${base}-${id}`;
  }

  async create(
    hostId: string,
    dto: CreatePropertyDto
  ) {
    // Gate 3: Host-verified gate before property listing
    const { data: hostProfile } = await this.supabaseService.admin
      .from('host_profiles')
      .select('verified, verification_status')
      .eq('user_id', hostId)
      .maybeSingle();

    const isHostVerified =
      hostProfile?.verified === true || hostProfile?.verification_status === 'verified';

    if (!isHostVerified) {
      throw new BadRequestException('Host verification required before listing a property');
    }

    const { data, error } = await this.supabaseService.admin
        .from('properties')
        .insert({
          host_id: hostId,
          name: dto.name,
          tagline: dto.tagline,
          type: dto.type.toLowerCase()
            .replace(/ /g, '_')
            .replace(/-/g, '_'),
          location: dto.location,
          capacity: dto.capacity,
          price_per_night: dto.pricePerNight,
          weekend_price: dto.weekendPrice ?? 0,
          amenities: dto.amenities ?? [],
          activities: dto.activities ?? [],
          honest_notes: dto.honestNotes,
          host_story: dto.hostStory,
          photos: dto.photos ?? [],
          status: 'under_review',
          minimum_stay: dto.minimumStay ?? 1,
          cancellation_policy: dto.cancellationPolicy ?? 'flexible',
        })
        .select()
        .single();

    if (error) {
      this.logger.error('Create property failed', error);
      throw new Error('Failed to create property');
    }

    // Update slug
    const slug = this.generateSlug(data.name, data.id);
    await this.supabaseService.admin
      .from('properties')
      .update({ slug })
      .eq('id', data.id);

    this.logger.log(`Property created: ${data.id} by host: ${hostId}`);

    // Auto-generate embedding (fire and forget - don't block response)
    this.embeddingsService.embedProperty(data.id).catch(err => {
      this.logger.warn(`[EMBED] Auto-embed failed: ${err?.message}`);
    });

    return { ...data, slug };
  }

  async findBySlug(slug: string) {
    const { data, error } = await this.supabaseService.admin
        .from('properties')
        .select('*')
        .eq('slug', slug)
        .single();

    if (error) {
      throw new NotFoundException('Property not found');
    }
    return data;
  }


  async findByHostId(hostId: string) {
    const { data, error } = await this.supabaseService.admin
        .from('properties')
        .select('*')
        .eq('host_id', hostId)
        .order('created_at', { ascending: false });

    if (error) {
      throw new Error('Failed to fetch properties');
    }

    return data;
  }

  async findById(id: string, callerId?: string) {
    const { data: property, error } = await this.supabaseService.admin
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !property) {
      throw new NotFoundException('Property not found');
    }

    // Fetch host with profile fields
    const { data: host } = await this.supabaseService.admin
        .from('users')
        .select('id, name, phone, bio, profile_pic, response_time_hours, created_at')
        .eq('id', property.host_id)
        .single();

    let canViewPhone = false;
    if (callerId) {
      if (callerId === property.host_id) {
        canViewPhone = true;
      } else {
        const { data: confirmedBooking } = await this.supabaseService.admin
          .from('bookings')
          .select('id')
          .eq('property_id', id)
          .eq('guest_id', callerId)
          .in('status', ['confirmed', 'completed'])
          .limit(1)
          .maybeSingle();

        if (confirmedBooking) {
          canViewPhone = true;
        }
      }
    }

    const hostResult = host ? { ...host } : null;
    if (hostResult && !canViewPhone) {
      delete (hostResult as any).phone;
    }

    // Count host's total bookings for this host
    const { count: hostBookings } = await this.supabaseService.admin
        .from('bookings')
        .select('id', { count: 'exact', head: true })
        .eq('property_id', property.id);

    return {
      ...property,
      host: hostResult,
      total_bookings: hostBookings ?? 0,
    };
  }

  async update(
    id: string,
    hostId: string,
    dto: UpdatePropertyDto
  ) {
    // Verify ownership
    const existing = await this.findById(id);
    if (existing.host_id !== hostId) {
      throw new UnauthorizedException(
        'Not your property'
      );
    }

    const updatePayload: any = {
      updated_at: new Date().toISOString(),
    };

    if (dto.name !== undefined) updatePayload.name = dto.name;
    if (dto.tagline !== undefined) updatePayload.tagline = dto.tagline;
    if (dto.type !== undefined) {
      updatePayload.type = dto.type.toLowerCase().replace(/ /g, '_').replace(/-/g, '_');
    }
    if (dto.location !== undefined) updatePayload.location = dto.location;
    if (dto.capacity !== undefined) updatePayload.capacity = dto.capacity;
    if (dto.pricePerNight !== undefined) updatePayload.price_per_night = dto.pricePerNight;
    if (dto.weekendPrice !== undefined) updatePayload.weekend_price = dto.weekendPrice;
    if (dto.amenities !== undefined) updatePayload.amenities = dto.amenities;
    if (dto.activities !== undefined) updatePayload.activities = dto.activities;
    if (dto.honestNotes !== undefined) updatePayload.honest_notes = dto.honestNotes;
    if (dto.hostStory !== undefined) updatePayload.host_story = dto.hostStory;
    if (dto.photos !== undefined) updatePayload.photos = dto.photos;
    if (dto.minimumStay !== undefined) updatePayload.minimum_stay = dto.minimumStay;
    if (dto.cancellationPolicy !== undefined) updatePayload.cancellation_policy = dto.cancellationPolicy;
    // status is intentionally not host-settable (see create-property.dto.ts) — only
    // the admin panel (apps/admin/app/api/properties) may change listing status.

    const { data, error } = await this.supabaseService.admin
        .from('properties')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single();

    if (error) {
      this.logger.error('Update failed', error);
      throw new Error('Update failed');
    }

    // Auto-generate embedding (fire and forget - don't block response)
    this.embeddingsService.embedProperty(data.id).catch(err => {
      this.logger.warn(`[EMBED] Auto-embed failed: ${err?.message}`);
    });

    return data;
  }

  async findActive() {
    const { data, error } = await this.supabaseService.admin
      .from('properties')
      .select('*')
      .eq('status', 'active')
      .order('created_at', {
        ascending: false,
      });

    if (error) {
      throw new Error('Failed to fetch properties');
    }

    return data;
  }

  async getPropertyStats(
    propertyId: string,
    hostId: string
  ): Promise<{
    views: number;
    bookings: number;
    rating: number;
    totalReviews: number;
    revenue: number;
    ranking: number;
  }> {
    // Verify ownership
    const { data: property } = await this.supabaseService.admin
      .from('properties')
      .select('host_id, rating, total_reviews, view_count')
      .eq('id', propertyId)
      .single();

    if (!property || property.host_id !== hostId) {
      throw new UnauthorizedException(
        'Not your property'
      );
    }

    // Real bookings count + revenue for this property
    const { data: bookings } = await this.supabaseService.admin
      .from('bookings')
      .select('host_payout, status, created_at')
      .eq('property_id', propertyId)
      .in('status', ['confirmed', 'completed']);

    const bookingsCount = (bookings ?? []).length;
    const revenue = (bookings ?? []).reduce(
      (sum, b) => sum + (b.host_payout ?? 0), 0
    );

    // Property ranking among all active properties
    // (based on rating + bookings count)
    const { data: allProps } = await this.supabaseService.admin
      .from('properties')
      .select('id, rating, total_reviews')
      .eq('status', 'active')
      .order('rating', { ascending: false });

    const ranking = (allProps ?? []).findIndex(
      p => p.id === propertyId
    ) + 1;

    return {
      views: property.view_count ?? 0,
      bookings: bookingsCount,
      rating: property.rating ?? 0,
      totalReviews: property.total_reviews ?? 0,
      revenue,
      ranking: ranking || 0,
    };
  }

  async trackView(propertyId: string) {
    await this.supabaseService.admin.rpc(
      'increment_property_views',
      { property_id: propertyId }
    );
    return { success: true };
  }
}
