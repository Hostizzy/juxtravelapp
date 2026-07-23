import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { MatchEngine } from './matches.engine';
import { FindMatchesDto } from './dto/find-matches.dto';
import { MatchResult } from './interfaces/match-result.interface';
import { RAGService } from '../ai/rag.service';

@Injectable()
export class MatchesService {
  private readonly logger = new Logger(MatchesService.name);

  constructor(
    private supabaseService: SupabaseService,
    private matchEngine: MatchEngine,
    private ragService: RAGService,
  ) { }

  // Hybrid RAG + rule-based
  async findMatchesHybrid(dto: FindMatchesDto): Promise<any[]> {
    this.logger.log(`[HYBRID] Finding matches for: ${dto.destination}`);

    try {
      // Try RAG first
      const ragResults = await this.ragService.findMatchesWithRAG(dto, 3);
      
      if (ragResults.length >= 3) {
        this.logger.log(`[HYBRID] RAG returned ${ragResults.length} matches`);
        return ragResults.map(r => ({
          property: r.property,
          score: r.aiScore,
          scorePercentage: r.aiScore,
          aiReasoning: r.aiReasoning,
          similarity: r.similarity,
          matchReasons: [], // AI reasoning shown separately, no duplicate
          breakdown: {
            location: Math.round(r.similarity * 30),
            capacity: Math.round(r.aiScore * 0.2),
            bedrooms: Math.round(r.aiScore * 0.15),
            budget: Math.round(r.aiScore * 0.15),
            vibe: Math.round(r.aiScore * 0.15),
            trust: Math.round(r.aiScore * 0.05),
            total: r.aiScore,
          },
          priceBreakdown: this.matchEngine.calculatePrice(
            r.property,
            dto.checkIn ?? new Date().toISOString(),
            dto.checkOut ?? new Date(Date.now() + 2 * 86400000).toISOString(),
          ),
          isFromRAG: true,
        }));
      }

      // Fallback to old rule-based matching
      this.logger.log('[HYBRID] Falling back to rule-based matching');
      return await this.findMatches(dto);
    } catch (error: any) {
      this.logger.error(`[HYBRID] Error, falling back: ${error?.message}`);
      return await this.findMatches(dto);
    }
  }

  async findMatches(
    dto: FindMatchesDto
  ): Promise<MatchResult[]> {
    this.logger.log(`Finding matches for: ${dto.destination}`);

    // Fetch all active properties
    const { data: properties, error } = await this.supabaseService.admin
      .from('properties')
      .select('*')
      .eq('status', 'active');

    if (error || !properties) {
      this.logger.error('Failed to fetch properties');
      return [];
    }

    // Score all properties
    const scored = properties.map(property =>
      this.matchEngine.scoreProperty(
        property as Record<string, unknown>,
        dto
      )
    );

    // Boost location score: Properties with 0 location score should not appear if better matches exist
    const withLocation = scored.filter(
      r => r.breakdown.location > 0
    );

    const withoutLocation = scored.filter(
      r => r.breakdown.location === 0
    );

    // Use location matches first
    // Only fallback to no-location if < 3
    const pool = withLocation.length >= 3
      ? withLocation
      : [...withLocation, ...withoutLocation];

    // Filter out disqualified properties (score > 0)
    const qualified = pool.filter(r => r.score > 0);

    // Sort by score descending
    qualified.sort((a, b) => b.score - a.score);

    // Diversity filter: Change max per host from 2 to 1 for better diversity
    const hostCount: Record<string, number> = {};
    const diverse = qualified.filter(result => {
      const hostId = result.property.host_id as string;
      hostCount[hostId] = (hostCount[hostId] ?? 0) + 1;
      return hostCount[hostId] <= 1; // ← 1 not 2
    });

    // Fallback: if less than 3 after diversity, relax to 2 per host
    if (diverse.length < 3) {
      const hostCount2: Record<string, number> = {};
      const relaxed = qualified.filter(result => {
        const hostId = result.property.host_id as string;
        hostCount2[hostId] = (hostCount2[hostId] ?? 0) + 1;
        return hostCount2[hostId] <= 2;
      });
      const topRelaxed = relaxed.slice(0, 3);
      this.logger.log(`Found ${topRelaxed.length} matches (relaxed) for ${dto.destination}`);
      return topRelaxed;
    }

    const top3 = diverse.slice(0, 3);
    this.logger.log(`Found ${top3.length} matches (diverse) for ${dto.destination}`);
    return top3;
  }
}
