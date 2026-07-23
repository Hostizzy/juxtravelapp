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
  rating?: number;
}

export type Property = MatchedProperty;

export interface MatchResult {
  property: Property;
  score: number;
  scorePercentage: number;
  aiReasoning?: string;
  similarity?: number;
  isFromRAG?: boolean;
  breakdown: {
    location: number;
    capacity: number;
    bedrooms: number;
    budget: number;
    vibe: number;
    trust: number;
    total: number;
  };
  priceBreakdown: {
    nights: number;
    weekdayNights?: number;
    weekendNights?: number;
    subtotal: number;
    serviceFee: number;
    grandTotal: number;
    pricePerNight: number;
  };
  matchReasons: string[];
}

export const getMatches = async (
  destination: string,
  checkIn: string,
  checkOut: string,
  guests: number,
  bedrooms: number,
  groupType: string,
  moods: string[],
  budget: number,
): Promise<MatchResult[]> => {
  try {
    const token = await SecureStore.getItemAsync('access_token');
    
    if (!token) return [];

    const results = await apiService.post<MatchResult[]>(
      '/matches/find-rag',
      {
        destination,
        checkIn,
        checkOut,
        guests,
        bedrooms,
        groupType,
        moods,
        budget,
      },
      token
    );

    return results;

  } catch (error) {
    console.error('Match failed:', error);
    return [];
  }
};
