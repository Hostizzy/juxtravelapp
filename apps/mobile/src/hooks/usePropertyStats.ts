import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../lib/api';

export interface PropertyStats {
  views: number;
  bookings: number;
  rating: number;
  totalReviews: number;
  revenue: number;
  ranking: number;
}

export function usePropertyStats(
  propertyId: string,
  isOwner: boolean
) {
  return useQuery({
    queryKey: ['property', 'stats', propertyId],
    queryFn: () => 
      apiGet<PropertyStats>(
        `/properties/${propertyId}/stats`
      ),
    enabled: !!propertyId && isOwner,
    staleTime: 2 * 60 * 1000, // 2 min cache
    refetchInterval: 30 * 1000, // Refresh every 30s while screen is open
  });
}
