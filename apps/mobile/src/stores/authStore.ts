import { create } from 'zustand';
import { Session } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

export interface UserData {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  role: 'guest' | 'host' | 'both';
  guest_profile?: unknown;
  host_profile?: unknown;
  avatar_url?: string;
}

interface AuthState {
  user: UserData | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: UserData | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  clearAuth: () => void;
  getAccessToken: () => Promise<string | null>;
}

export const useAuthStore = create<AuthState>(
  (set) => ({
    user: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,
    setUser: (user) => set({
      user,
      isAuthenticated: !!user,
      isLoading: false,
    }),
    setSession: (session) => set({ session }),
    setLoading: (isLoading) => set({ isLoading }),
    clearAuth: () => set({
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: false,
    }),
    getAccessToken: async () => {
      const token = await SecureStore.getItemAsync('access_token');
      return token;
    },
  })
);
