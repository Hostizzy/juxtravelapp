import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useIsFocused } from '@react-navigation/native';
import { apiGet, apiPost } from '../lib/api';

export interface Booking {
  id: string;
  guest_id: string;
  host_id: string;
  property_id: string;
  check_in: string;
  check_out: string;
  guests: number;
  total_amount: number;
  service_fee: number;
  host_payout: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  payment_id?: string;
  special_requests?: string;
  created_at: string;
  guest?: { id: string; name: string };
  host?: { id: string; name: string };
  property?: {
    id: string;
    name: string;
    photos: string[];
    location: Record<string, string>;
  };
}

export interface HostStats {
  allTimeBookings: number;
  checkInsThisMonth: number;
  earningsThisMonth: number;
  earningsAllTime: number;
}

export interface HostEarnings {
  totalEarnings: number;
  thisMonth: number;
  pendingPayout: number;
}

export interface HostDetailedStats {
  overview: {
    totalGrossRevenue: number;
    totalCommission: number;
    totalNetEarnings: number;
    commissionRate: number;
    totalBookings: number;
    totalGuests: number;
    totalProperties: number;
    avgBookingValue: number;
    availableBalance: number;
  };
  properties: Array<{
    id: string;
    name: string;
    totalBookings: number;
    grossRevenue: number;
    commission: number;
    netEarnings: number;
  }>;
}

export const BOOKING_KEYS = {
  myBookings: ['bookings', 'my'] as const,
  hostBookings: ['bookings', 'host'] as const,
  hostStats: ['bookings', 'host-stats'] as const,
  hostEarnings: ['bookings', 'host-earnings'] as const,
  hostDetailedStats: ['bookings', 'host-detailed-stats'] as const,
  detail: (id: string) => ['bookings', 'detail', id] as const,
};

export function useMyBookings() {
  return useQuery({
    queryKey: BOOKING_KEYS.myBookings,
    queryFn: () => apiGet<Booking[]>('/bookings/my-bookings'),
  });
}

export function useHostBookings() {
  const isFocused = useIsFocused();
  return useQuery({
    queryKey: BOOKING_KEYS.hostBookings,
    queryFn: () => apiGet<Booking[]>('/bookings/host-bookings'),
    refetchInterval: 30000,
    staleTime: 5000,
    enabled: isFocused,
  });
}

export function useHostStats() {
  const isFocused = useIsFocused();
  return useQuery({
    queryKey: BOOKING_KEYS.hostStats,
    queryFn: () => apiGet<HostStats>('/bookings/host-stats'),
    refetchInterval: 30000,
    staleTime: 5000,
    enabled: isFocused,
  });
}

export function useHostEarnings() {
  const isFocused = useIsFocused();
  return useQuery({
    queryKey: BOOKING_KEYS.hostEarnings,
    queryFn: () => apiGet<HostEarnings>('/bookings/earnings'),
    refetchInterval: 30000,
    staleTime: 5000,
    enabled: isFocused,
  });
}

export function useHostDetailedStats() {
  const isFocused = useIsFocused();
  return useQuery({
    queryKey: BOOKING_KEYS.hostDetailedStats,
    queryFn: () => apiGet<HostDetailedStats>('/bookings/host-detailed-stats'),
    refetchInterval: 30000,
    staleTime: 5000,
    enabled: isFocused,
  });
}

export function useBookingDetail(id: string) {
  return useQuery({
    queryKey: BOOKING_KEYS.detail(id),
    queryFn: () => apiGet<Booking>(`/bookings/${id}`),
    enabled: !!id,
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      propertyId: string;
      checkIn: string;
      checkOut: string;
      guests: number;
      totalAmount: number;
    }) => apiPost<Booking>('/bookings/create-direct', body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['bookings'],
      });
      queryClient.invalidateQueries({
        queryKey: BOOKING_KEYS.hostStats,
      });
      queryClient.invalidateQueries({
        queryKey: BOOKING_KEYS.hostEarnings,
      });
    },
  });
}
