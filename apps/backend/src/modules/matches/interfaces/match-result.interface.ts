export interface ScoringBreakdown {
  location: number;
  capacity: number;
  bedrooms: number;
  budget: number;
  vibe: number;
  trust: number;
  total: number;
}

export interface PriceBreakdown {
  nights: number;
  weekdayNights: number;
  weekendNights: number;
  weekdayTotal: number;
  weekendTotal: number;
  subtotal: number;
  serviceFee: number;
  grandTotal: number;
  pricePerNight: number;
}

export interface MatchResult {
  property: Record<string, unknown>;
  score: number;
  scorePercentage: number;
  breakdown: ScoringBreakdown;
  priceBreakdown: PriceBreakdown;
  matchReasons: string[];
  aiExplanation?: string;
}
