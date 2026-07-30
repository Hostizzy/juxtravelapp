import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable()
export class DiscoverService {
  private readonly logger = new Logger(DiscoverService.name);

  constructor(private supabaseService: SupabaseService) {}

  async getPostsFeed(limit: number = 20, offset: number = 0): Promise<any[]> {
    try {
      // Fetch active properties with photos
      const { data: properties, error } = await this.supabaseService.admin
        .from('properties')
        .select('id, name, host_id, photos, location, price_per_night, capacity')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error || !properties) {
        this.logger.error('Failed to fetch properties', error);
        return [];
      }

      // Filter properties that have photos
      const withPhotos = properties.filter(
        p => p.photos && Array.isArray(p.photos) && p.photos.length > 0
      );

      // Get all unique host IDs
      const hostIds = [...new Set(withPhotos.map(p => p.host_id))];

      // Fetch host names
      const { data: hosts } = await this.supabaseService.admin
        .from('users')
        .select('id, name')
        .in('id', hostIds);

      const hostMap = new Map((hosts ?? []).map(h => [h.id, h]));

      // Split: latest 10 first, then random shuffle rest
      const latest = withPhotos.slice(0, 10);
      const rest = withPhotos.slice(10);

      // Fisher-Yates shuffle for random rest
      const shuffled = [...rest];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }

      const combined = [...latest, ...shuffled];

      // Paginate
      const paginated = combined.slice(offset, offset + limit);

      // Format posts
      const posts = paginated.map(prop => ({
        id: prop.id,
        propertyId: prop.id,
        propertyName: prop.name,
        hostId: prop.host_id,
        hostName: hostMap.get(prop.host_id)?.name ?? 'Host',
        photos: prop.photos ?? [],
        location: prop.location,
        pricePerNight: prop.price_per_night,
        capacity: prop.capacity,
      }));

      return posts;
    } catch (error: any) {
      this.logger.error('getPostsFeed failed:', error);
      return [];
    }
  }
}
