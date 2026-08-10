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

      // Stable pseudo-random order (hash of id, not Math.random) — Math.random
      // reshuffled "rest" on every call, so paging with offset/limit skipped or
      // duplicated items across pages since the order changed between requests.
      const hash = (s: string) => {
        let h = 0;
        for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
        return h;
      };
      const shuffled = [...rest].sort((a, b) => hash(a.id) - hash(b.id));

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
