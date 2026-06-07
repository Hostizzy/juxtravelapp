import { 
  Injectable, 
  Logger,
  NotFoundException 
} from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { CreatePropertyDto } from './dto/create-property.dto';

@Injectable()
export class PropertiesService {
  private readonly logger = new Logger(PropertiesService.name);

  constructor(
    private supabaseService: SupabaseService
  ) {}

  async uploadPhoto(
    file: Express.Multer.File
  ): Promise<{ url: string }> {
    const fileName = `${Date.now()}_${Math.random()
      .toString(36).substring(7)}.jpg`;

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

  async create(
    hostId: string,
    dto: CreatePropertyDto
  ) {
    const { data, error } = await this.supabaseService.admin
        .from('properties')
        .insert({
          host_id: hostId,
          name: dto.name,
          tagline: dto.tagline,
          type: dto.type.toLowerCase()
            .replace(' ', '_')
            .replace('-', '_'),
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

    this.logger.log(`Property created: ${data.id} by host: ${hostId}`);

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

  async findById(id: string) {
    const { data, error } = await this.supabaseService.admin
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
      throw new NotFoundException('Property not found');
    }

    return data;
  }
}
