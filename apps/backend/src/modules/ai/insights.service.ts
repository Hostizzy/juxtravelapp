import { Injectable, Logger } from '@nestjs/common';
import { OpenAIService } from './openai.service';

interface InsightRequest {
  step: number;
  destination?: string;
  groupType?: string;
  moods?: string[];
  budget?: number;
  guests?: number;
  bedrooms?: number;
}

@Injectable()
export class InsightsService {
  private readonly logger = new Logger(InsightsService.name);
  
  // In-memory cache (shared across all users)
  private cache = new Map<string, { text: string; expiresAt: number }>();
  private readonly CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

  constructor(private openaiService: OpenAIService) {}

  // Build cache key from inputs
  private buildCacheKey(req: InsightRequest): string {
    const parts = [
      `step:${req.step}`,
      req.destination ? `dest:${req.destination.toLowerCase().trim()}` : '',
      req.groupType ? `group:${req.groupType}` : '',
      req.moods?.length ? `moods:${req.moods.sort().join(',')}` : '',
      req.budget ? `budget:${Math.floor(req.budget / 10000) * 10000}` : '', // Round to 10k
      req.guests ? `guests:${req.guests}` : '',
      req.bedrooms ? `bedrooms:${req.bedrooms}` : '',
    ].filter(Boolean).join('|');
    return parts;
  }

  // Build prompt based on step
  private buildPrompt(req: InsightRequest): { system: string; user: string } {
    const system = `You are a travel expert giving concise, personalized insights.
Rules:
- Keep response 15-25 words MAX
- Be specific and actionable
- Use engaging language
- No emojis in output
- No markdown formatting
- Just a single sentence`;

    let user = '';

    switch (req.step) {
      case 1: // Destination
        user = `Give travel insight for someone planning to visit ${req.destination || 'India'}. Focus on best experiences or booking tips.`;
        break;
      
      case 2: // Guests + Group
        user = `Traveler visiting ${req.destination || 'India'} with ${req.guests || 'few'} guests as ${req.groupType || 'travelers'}. Give insight about stay type or booking tip for this group size.`;
        break;
      
      case 3: // Moods/Vibes
        const vibes = req.moods?.join(', ') || 'general';
        user = `Traveler visiting ${req.destination || 'India'} wants ${vibes} vibes. Give insight about matching properties or experiences.`;
        break;
      
      case 4: // Budget
        const budgetTier = (req.budget || 0) < 35000 ? 'budget' : (req.budget || 0) < 90000 ? 'mid-range' : 'luxury';
        user = `Traveler visiting ${req.destination || 'India'} with ${budgetTier} budget of ₹${req.budget}. Give insight about what this budget enables.`;
        break;
      
      default:
        user = `Give a travel insight for someone planning a trip to ${req.destination || 'India'}.`;
    }

    return { system, user };
  }

  // Get fallback text (matches existing hardcoded)
  getFallbackText(req: InsightRequest): string {
    const dest = req.destination || 'India';
    
    switch (req.step) {
      case 1:
        const destLower = dest.toLowerCase();
        if (destLower.includes('goa')) return 'Goa stays show high occupancy on weekends; booking 3 weeks ahead saves up to 25% on boutique villas.';
        if (destLower.includes('manali')) return 'Mountain properties with solar heating and fireplaces are currently seeing a 40% uptick in Manali reviews.';
        if (destLower.includes('kerala')) return 'Travelers visiting Kerala this season highly recommend heritage houseboats in Alappuzha over hotels.';
        return `Curated stays in ${dest} offer authentic experiences with local hosts.`;
      
      case 2:
        const group = req.groupType || 'travelers';
        return `${group.charAt(0).toUpperCase() + group.slice(1)}s in ${dest} love our private stays with local host experiences.`;
      
      case 3:
        return `Properties matching your vibes in ${dest} show high satisfaction ratings.`;
      
      case 4:
        return `Your budget in ${dest} unlocks premium stays with unique experiences.`;
      
      default:
        return `Discover curated stays in ${dest}.`;
    }
  }

  // Generate insight (main method)
  async generateInsight(req: InsightRequest): Promise<{ text: string; cached: boolean }> {
    const cacheKey = this.buildCacheKey(req);
    
    // Check cache
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      this.logger.log(`[INSIGHT] ✅ Cache hit: ${cacheKey}`);
      return { text: cached.text, cached: true };
    }

    // Generate via LLM
    try {
      const { system, user } = this.buildPrompt(req);
      this.logger.log(`[INSIGHT] Generating for step ${req.step}: ${req.destination}`);
      
      const text = await this.openaiService.generateCompletion(system, user, 0.7);
      
      if (!text || text.trim().length === 0) {
        throw new Error('Empty response from LLM');
      }
      
      // Clean up response
      const cleaned = text.trim()
        .replace(/^["']|["']$/g, '') // Remove quotes
        .replace(/\*+/g, '') // Remove markdown
        .replace(/\n+/g, ' '); // Single line
      
      // Cache it
      this.cache.set(cacheKey, {
        text: cleaned,
        expiresAt: Date.now() + this.CACHE_TTL_MS,
      });
      
      // Cleanup old cache entries (keep max 500)
      if (this.cache.size > 500) {
        const oldestKey = this.cache.keys().next().value;
        if (oldestKey) this.cache.delete(oldestKey);
      }
      
      this.logger.log(`[INSIGHT] ✅ Generated (${cleaned.length} chars)`);
      return { text: cleaned, cached: false };
      
    } catch (error: any) {
      this.logger.error(`[INSIGHT] Failed: ${error?.message}`);
      // Return fallback
      return { text: this.getFallbackText(req), cached: false };
    }
  }

  // Clear cache (utility)
  clearCache() {
    this.cache.clear();
    this.logger.log('[INSIGHT] Cache cleared');
  }
}
