import { Injectable, Logger } from '@nestjs/common';
import { 
  ScoringBreakdown,
  PriceBreakdown,
  MatchResult 
} from './interfaces/match-result.interface';
import { FindMatchesDto } from './dto/find-matches.dto';

@Injectable()
export class MatchEngine {
  private readonly logger = new Logger(MatchEngine.name);

  // ── PRICE CALCULATOR ──────────────────
  calculatePrice(
    property: Record<string, unknown>,
    checkIn: string,
    checkOut: string
  ): PriceBreakdown {
    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);
    
    const nights = Math.ceil(
      (endDate.getTime() - startDate.getTime()) 
      / (1000 * 60 * 60 * 24)
    );

    const pricePerNight = (property.price_per_night as number) ?? 0;
    const weekendPrice = (property.weekend_price as number) ?? pricePerNight * 1.2;

    let weekdayNights = 0;
    let weekendNights = 0;
    let weekdayTotal = 0;
    let weekendTotal = 0;

    // Calculate day by day
    for (let i = 0; i < nights; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const day = date.getDay();
      
      // Friday(5) Saturday(6) = weekend
      if (day === 5 || day === 6) {
        weekendNights++;
        weekendTotal += weekendPrice;
      } else {
        weekdayNights++;
        weekdayTotal += pricePerNight;
      }
    }

    const subtotal = weekdayTotal + weekendTotal;
    const serviceFee = Math.round(subtotal * 0.1);
    const grandTotal = subtotal + serviceFee;

    return {
      nights,
      weekdayNights,
      weekendNights,
      weekdayTotal,
      weekendTotal,
      subtotal,
      serviceFee,
      grandTotal,
      pricePerNight,
    };
  }

  // ── LOCATION SCORING ──────────────────
  private scoreLocation(
    property: Record<string, unknown>,
    destination: string
  ): number {
    const dest = destination.toLowerCase().trim();
    const location = property.location as Record<string, string> ?? {};

    const city = (location.city ?? '').toLowerCase();
    const state = (location.state ?? '').toLowerCase();
    const address = (location.address ?? '').toLowerCase();

    // Exact city match
    if (city === dest || city.includes(dest) || dest.includes(city)) {
      return 25;
    }

    // Partial city match
    const destWords = dest.split(/\s+/);
    const cityWords = city.split(/\s+/);
    const cityWordMatch = destWords.some(w => 
      cityWords.some(cw => 
        cw.includes(w) || w.includes(cw)
      )
    );
    if (cityWordMatch) return 20;

    // State match
    if (state.includes(dest) || dest.includes(state)) {
      return 10;
    }

    // State word match
    const stateWordMatch = destWords.some(w => state.includes(w));
    if (stateWordMatch) return 8;

    // Address match
    if (address.includes(dest)) return 5;

    // Known location synonyms
    const synonyms: Record<string, string[]> = {
      'gurgaon': ['gurugram', 'manesar', 
        'faridabad', 'panchkula'],
      'gurugram': ['gurgaon', 'manesar',
        'faridabad'],
      'manesar': ['gurgaon', 'gurugram'],
      'delhi': ['ncr', 'vasant kunj', 
        'gurgaon', 'noida'],
      'ncr': ['gurgaon', 'gurugram', 'delhi',
        'noida', 'faridabad'],
      'bombay': ['mumbai'],
      'bangalore': ['bengaluru'],
      'nainital': ['bhimtal', 'mukteshwar',
        'ranikhet'],
      'uttarakhand': ['nainital', 'mussoorie',
        'mukteshwar', 'ranikhet', 'bhimtal',
        'dehradun'],
      'himachal': ['shimla', 'kasauli',
        'manali', 'dharamshala', 'barog'],
      'himachal pradesh': ['shimla', 'kasauli',
        'manali', 'barog'],
      'rajasthan': ['jaipur', 'jaisalmer',
        'udaipur', 'jawai', 'neemrana', 
        'ajmer', 'jodhpur'],
      'hills': ['shimla', 'kasauli', 'manali',
        'nainital', 'mukteshwar', 'mussoorie',
        'ranikhet', 'bhimtal'],
      'mountains': ['shimla', 'kasauli', 
        'manali', 'mukteshwar', 'mussoorie'],
    };

    for (const [key, values] of Object.entries(synonyms)) {
      if (dest.includes(key) || key.includes(dest)) {
        if (values.some(v => city.includes(v) || v.includes(city))) {
          return 18;
        }
      }
      if (values.some(v => dest.includes(v) || v.includes(dest))) {
        if (city.includes(key) || values.some(v2 => city.includes(v2))) {
          return 15;
        }
      }
    }

    return 0;
  }

  // ── CAPACITY SCORING ──────────────────
  private scoreCapacity(
    property: Record<string, unknown>,
    guests: number
  ): number {
    const capacity = property.capacity as Record<string, number> ?? {};
    const maxGuests = capacity.maxGuests ?? 0;
    const comfortableGuests = capacity.comfortableGuests ?? maxGuests;

    // Can't accommodate — disqualify
    if (guests > maxGuests) return -50;

    // Perfect comfortable fit
    if (guests <= comfortableGuests) {
      const utilization = guests / comfortableGuests;
      // 70-100% utilization is perfect
      if (utilization >= 0.7) return 20;
      if (utilization >= 0.5) return 15;
      if (utilization >= 0.3) return 10;
      return 5; // Too big for group
    }

    // Between comfortable and max
    return 12;
  }

  // ── BEDROOM SCORING ──────────────────
  private scoreBedrooms(
    property: Record<string, unknown>,
    bedrooms: number
  ): number {
    const capacity = property.capacity as Record<string, number> ?? {};
    const rooms = capacity.rooms ?? 0;

    // Can't fit — disqualify
    if (rooms < bedrooms) return -30;

    // Exact match
    if (rooms === bedrooms) return 15;

    // 1 extra room — great
    if (rooms === bedrooms + 1) return 12;

    // 2 extra rooms — ok
    if (rooms === bedrooms + 2) return 8;

    // Too many rooms
    return 5;
  }

  // ── BUDGET SCORING ──────────────────
  private scoreBudget(
    property: Record<string, unknown>,
    budget: number,
    priceBreakdown: PriceBreakdown
  ): number {
    if (!budget || budget <= 0) return 10;

    const totalCost = priceBreakdown.grandTotal;
    const ratio = totalCost / budget;

    if (ratio <= 0.7) return 15;    // Great deal
    if (ratio <= 0.85) return 13;   // Good value
    if (ratio <= 1.0) return 10;    // Within budget
    if (ratio <= 1.1) return 6;     // Slightly over
    if (ratio <= 1.2) return 3;     // 20% over
    return 0;                        // Too expensive
  }

  // ── VIBE SCORING ──────────────────────
  private scoreVibe(
    property: Record<string, unknown>,
    groupType: string,
    moods: string[]
  ): number {
    let score = 0;
    const amenities = (property.amenities as string[]) ?? [];
    const propType = (property.type as string ?? '').toLowerCase();
    const amenitiesLower = amenities.map(a => a.toLowerCase());

    // Group type matching
    const groupMatches: Record<string, string[]> = {
      'family': ['kitchen', 'pool', 'garden', 'tv', 'parking', 'lawn', 'swings'],
      'couple': ['pool', 'jacuzzi', 'garden', 'bonfire', 'mountain views', 'valley views', 'private'],
      'friends': ['pool', 'cricket', 'badminton', 'football', 'bonfire', 'lawn', 'party', 'games'],
      'corporate': ['wifi', 'workspace', 'kitchen', 'tv', 'parking'],
      'solo': ['wifi', 'kitchen', 'garden', 'mountain views'],
    };

    const groupLower = groupType?.toLowerCase() ?? '';
    for (const [type, keywords] of Object.entries(groupMatches)) {
      if (groupLower.includes(type)) {
        const matches = keywords.filter(k =>
          amenitiesLower.some(a => a.includes(k))
        ).length;
        score += Math.min(7, matches * 1.5);
        break;
      }
    }

    // Mood matching
    const moodMatches: Record<string, string[]> = {
      'adventure': ['trekking', 'hiking', 'wildlife', 'safari', 'nature walks', 'horse riding', 'outdoor'],
      'relaxation': ['pool', 'jacuzzi', 'spa', 'garden', 'peaceful', 'bonfire'],
      'culture': ['heritage', 'local', 'organic farm', 'vrindavan', 'temple'],
      'nature': ['mountain views', 'valley views', 'forest', 'organic farm', 'garden', 'pond', 'stargazing'],
      'luxury': ['pool', 'jacuzzi', 'villa', 'premium', 'luxury'],
      'budget': [], // handled in budget score
    };

    for (const mood of moods) {
      const moodLower = mood.toLowerCase();
      for (const [key, keywords] of Object.entries(moodMatches)) {
        if (moodLower.includes(key) || key.includes(moodLower)) {
          const matches = keywords.filter(k =>
            amenitiesLower.some(a => a.includes(k)) || propType.includes(k)
          ).length;
          score += Math.min(3, matches);
          break;
        }
      }
    }

    // Property type bonus
    if (moods.some(m => 
      m.toLowerCase().includes('nature') || m.toLowerCase().includes('farm')
    )) {
      if (propType.includes('farmstay')) {
        score += 3;
      }
    }

    return Math.min(15, score);
  }

  // ── TRUST SCORING ──────────────────────
  private scoreTrust(
    property: Record<string, unknown>
  ): number {
    const rating = (property.rating as number) ?? 0;
    const reviews = (property.total_reviews as number) ?? 0;

    let score = 0;

    // Rating score (0-7 pts)
    if (rating >= 4.8) score += 7;
    else if (rating >= 4.5) score += 5;
    else if (rating >= 4.0) score += 3;
    else if (rating >= 3.5) score += 1;

    // Review count score (0-3 pts)
    if (reviews >= 100) score += 3;
    else if (reviews >= 50) score += 2;
    else if (reviews >= 20) score += 1;

    return Math.min(10, score);
  }

  // ── MATCH REASONS ──────────────────────
  private generateMatchReasons(
    property: Record<string, unknown>,
    dto: FindMatchesDto,
    breakdown: ScoringBreakdown,
    price: PriceBreakdown
  ): string[] {
    const reasons: string[] = [];
    const location = property.location as Record<string, string> ?? {};
    const capacity = property.capacity as Record<string, number> ?? {};

    if (breakdown.location >= 20) {
      reasons.push(`📍 Perfect location in ${location.city}`);
    } else if (breakdown.location >= 10) {
      reasons.push(`📍 Great base in ${location.state}`);
    }

    if (breakdown.capacity >= 18) {
      reasons.push(`👥 Perfect size for ${dto.guests} guests`);
    }

    if (breakdown.bedrooms >= 12) {
      reasons.push(`🛏 ${capacity.rooms} bedrooms — just right`);
    }

    if (breakdown.budget >= 13) {
      reasons.push(`💰 Great value at ₹${price.pricePerNight.toLocaleString('en-IN')}/night`);
    }

    const rating = property.rating as number;
    if (rating >= 4.7) {
      reasons.push(`⭐ Highly rated ${rating}/5`);
    }

    const amenities = property.amenities as string[] ?? [];
    if (amenities.includes('Pool')) {
      reasons.push('🏊 Private pool included');
    }
    if (amenities.includes('Jacuzzi')) {
      reasons.push('🛁 Jacuzzi available');
    }

    return reasons.slice(0, 3);
  }

  // ── MAIN SCORING FUNCTION ──────────────
  scoreProperty(
    property: Record<string, unknown>,
    dto: FindMatchesDto
  ): MatchResult {
    const guests = dto.guests ?? 1;
    const bedrooms = dto.bedrooms ?? 1;
    const budget = dto.budget ?? 0;
    const groupType = dto.groupType ?? '';
    const moods = dto.moods ?? [];
    const checkIn = dto.checkIn ?? 
      new Date().toISOString();
    const checkOut = dto.checkOut ?? 
      new Date(
        Date.now() + 2 * 24 * 60 * 60 * 1000
      ).toISOString();

    const priceBreakdown = this.calculatePrice(
      property,
      checkIn,
      checkOut
    );

    const locationScore = this.scoreLocation(property, dto.destination);
    const capacityScore = this.scoreCapacity(property, guests);
    const bedroomScore = this.scoreBedrooms(property, bedrooms);
    const budgetScore = this.scoreBudget(property, budget, priceBreakdown);
    const vibeScore = this.scoreVibe(property, groupType, moods);
    const trustScore = this.scoreTrust(property);

    const breakdown: ScoringBreakdown = {
      location: Math.max(0, locationScore),
      capacity: Math.max(0, capacityScore),
      bedrooms: Math.max(0, bedroomScore),
      budget: Math.max(0, budgetScore),
      vibe: Math.max(0, vibeScore),
      trust: Math.max(0, trustScore),
      total: 0,
    };

    // Raw total (can be negative due to penalties)
    const rawTotal = locationScore + capacityScore + bedroomScore + budgetScore + vibeScore + trustScore;

    // Normalize to 0-100
    breakdown.total = Math.min(100, Math.max(0, rawTotal));

    const matchReasons = this.generateMatchReasons(
      property,
      {
        ...dto,
        guests,
        bedrooms,
        budget,
        groupType,
        moods,
        checkIn,
        checkOut,
      },
      breakdown,
      priceBreakdown
    );

    return {
      property,
      score: breakdown.total,
      scorePercentage: breakdown.total,
      breakdown,
      priceBreakdown,
      matchReasons,
    };
  }
}
