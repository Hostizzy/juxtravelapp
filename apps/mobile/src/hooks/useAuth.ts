import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../lib/api';

export interface UserData {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  role: 'guest' | 'host' | 'both';
  avatar_url?: string;
  guest_profile?: unknown;
  host_profile?: unknown;
}

export const USER_QUERY_KEY = ['user', 'me'];

export function useCurrentUser() {
  return useQuery({
    queryKey: USER_QUERY_KEY,
    queryFn: () => apiGet<UserData>('/users/me'),
    staleTime: 10 * 60 * 1000, // User data rarely changes, cache longer
  });
}
