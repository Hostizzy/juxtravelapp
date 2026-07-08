import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPatch } from '../lib/api';

export interface Property {
  id: string;
  name: string;
  tagline?: string;
  type: string;
  location: { address: string; city: string; state: string };
  capacity: { rooms: number; maxGuests: number; comfortableGuests: number };
  price_per_night: number;
  weekend_price?: number;
  amenities: string[];
  photos: string[];
  reel_urls?: string[];
  reels?: string[];
  status: string;
  rating?: number;
  total_reviews?: number;
  host_id: string;
  host?: { id: string; name: string; phone?: string };
  slug?: string;
  created_at: string;
}

export const PROPERTIES_KEYS = {
  active: ['properties', 'active'] as const,
  myProperties: ['properties', 'my'] as const,
  detail: (id: string) => ['properties', 'detail', id] as const,
};

export function useActiveProperties() {
  return useQuery({
    queryKey: PROPERTIES_KEYS.active,
    queryFn: () => apiGet<Property[]>('/properties/active'),
    staleTime: 5 * 60 * 1000,
  });
}

export function useMyProperties() {
  return useQuery({
    queryKey: PROPERTIES_KEYS.myProperties,
    queryFn: () => apiGet<Property[]>('/properties/my'),
  });
}

export function usePropertyDetail(id: string) {
  return useQuery({
    queryKey: PROPERTIES_KEYS.detail(id),
    queryFn: () => apiGet<Property>(`/properties/${id}`),
    enabled: !!id,
  });
}

export function useUpdateProperty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Property> }) =>
      apiPatch<Property>(`/properties/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: PROPERTIES_KEYS.detail(id),
      });
      queryClient.invalidateQueries({
        queryKey: PROPERTIES_KEYS.myProperties,
      });
    },
  });
}
