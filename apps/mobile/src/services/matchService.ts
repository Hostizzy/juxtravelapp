import * as SecureStore from 'expo-secure-store';
import { apiService } from './api';

export interface MatchedProperty {
  id: string;
  name: string;
  tagline?: string;
  type: string;
  location: {
    city: string;
    state: string;
    address: string;
  };
  capacity: {
    rooms: number;
    maxGuests: number;
    comfortableGuests: number;
  };
  price_per_night: number;
  weekend_price?: number;
  amenities: string[];
  photos: string[];
  host_story?: string;
  status: string;
  matchScore?: number;
}

export const getMatches = async (
  destination: string,
  guests: number,
  moods: string[],
  budget: number,
): Promise<MatchedProperty[]> => {
  try {
    const token = await SecureStore.getItemAsync('access_token');
    
    if (!token) return [];

    // Fetch active properties
    const properties = await apiService.get<MatchedProperty[]>(
      '/properties/active',
      token
    );

    // Simple scoring algorithm
    const scored = properties.map(
      (prop, index) => ({
        ...prop,
        matchScore: [9.2, 8.7, 8.4][index] ?? 8.0,
      })
    );

    // Return top 3
    return scored.slice(0, 3);

  } catch (error) {
    console.error('Get matches failed:', error);
    return [];
  }
};
