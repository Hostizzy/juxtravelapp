import { useQuery } from '@tanstack/react-query';
import { apiGet, apiService } from '../lib/api';
import { useAuthStore } from '../stores/authStore';
import { queryClient } from '../lib/queryClient';
import * as SecureStore from 'expo-secure-store';

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

export function useAuth() {
  const setUser = useAuthStore((state) => state.setUser);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const sendOtp = async (phone: string) => {
    return await apiService.post('/auth/send-otp', { phone });
  };

  const getUser = async (): Promise<UserData | null> => {
    try {
      const token = await SecureStore.getItemAsync('access_token');
      if (!token) {
        return null;
      }

      const userData = await apiService.get<UserData>('/users/me', token);
      
      setUser({
        id: userData.id,
        name: userData.name,
        phone: userData.phone,
        email: userData.email,
        role: userData.role as 'guest' | 'host' | 'both',
        avatar_url: userData.avatar_url,
        guest_profile: userData.guest_profile,
        host_profile: userData.host_profile,
      });

      return userData;
    } catch (error) {
      console.log('Auto login failed in useAuth:', error);
      
      // Clear expired token and query cache
      queryClient.clear();
      await SecureStore.deleteItemAsync('access_token');
      await SecureStore.deleteItemAsync('user_id');
      clearAuth();
      
      return null;
    }
  };

  return {
    sendOtp,
    getUser,
  };
}
