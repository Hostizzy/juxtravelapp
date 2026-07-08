import { useMutation } from '@tanstack/react-query';
import { apiPost } from '../lib/api';
import { Property } from './useProperties';

export interface MatchResult {
  property: Property;
  score: number;
  scorePercentage: number;
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
    subtotal: number;
    serviceFee: number;
    grandTotal: number;
    pricePerNight: number;
  };
  matchReasons: string[];
}

export function useFindMatches() {
  return useMutation({
    mutationFn: (params: {
      destination: string;
      checkIn?: string;
      checkOut?: string;
      guests?: number;
      bedrooms?: number;
      groupType?: string;
      moods?: string[];
      budget?: number;
    }) => apiPost<MatchResult[]>('/matches/find', params),
  });
}
