import { Injectable, Logger } from '@nestjs/common';
import { OpenAIService } from './openai.service';
import { EmbeddingsService } from './embeddings.service';
import { FindMatchesDto } from '../matches/dto/find-matches.dto';

export interface RAGMatch {
  property: any;
  similarity: number;
  aiScore: number;
  aiReasoning: string;
}

@Injectable()
export class RAGService {
  private readonly logger = new Logger(RAGService.name);

  constructor(
    private openaiService: OpenAIService,
    private embeddingsService: EmbeddingsService,
  ) {}

  // Build semantic query from user input
  buildQuery(dto: FindMatchesDto): string {
    const parts: string[] = [];
    
    if (dto.destination) parts.push(`Destination: ${dto.destination}`);
    if (dto.groupType) parts.push(`Group type: ${dto.groupType}`);
    if (dto.moods && dto.moods.length > 0) {
      parts.push(`Vibe: ${dto.moods.join(', ')}`);
    }
    if (dto.guests) parts.push(`For ${dto.guests} guests`);
    if (dto.bedrooms) parts.push(`${dto.bedrooms} bedrooms needed`);
    if (dto.budget) parts.push(`Budget: ₹${dto.budget}`);
    
    return parts.join('. ');
  }

  // Apply hard constraints (capacity, budget)
  applyConstraints(properties: any[], dto: FindMatchesDto): any[] {
    return properties.filter(p => {
      const cap = p.capacity ?? {};
      const maxGuests = cap.maxGuests ?? 999;
      const rooms = cap.rooms ?? 999;
      
      if (dto.guests && dto.guests > maxGuests) return false;
      if (dto.bedrooms && dto.bedrooms > rooms) return false;
      
      if (dto.budget && dto.budget > 0) {
        const price = p.price_per_night ?? 0;
        if (price > dto.budget * 1.3) return false;
      }
      
      return true;
    });
  }

  // Use LLM to rank and generate reasoning
  async rankWithLLM(candidates: any[], dto: FindMatchesDto): Promise<RAGMatch[]> {
    if (candidates.length === 0) return [];

    const systemPrompt = `You are a travel expert helping match properties to user preferences.
Analyze each property and score it 0-100 based on how well it matches the user's needs.
Return ONLY valid JSON array with format: [{"index": 0, "score": 85, "reasoning": "why it matches"}]
Be concise. Reasoning should be 1-2 short sentences.`;

    const propertiesList = candidates.map((p, idx) => ({
      index: idx,
      name: p.name,
      tagline: p.tagline,
      type: p.type,
      location: p.location,
      amenities: p.amenities?.slice(0, 8),
      price: p.price_per_night,
      capacity: p.capacity,
      rating: p.rating,
    }));

    const userPrompt = `User is looking for:
- Destination: ${dto.destination}
- Group: ${dto.groupType ?? 'anyone'}
- Vibes: ${dto.moods?.join(', ') ?? 'any'}
- Guests: ${dto.guests ?? 'any'}
- Budget: ₹${dto.budget ?? 'flexible'}

Properties to rank:
${JSON.stringify(propertiesList, null, 2)}

Return JSON array ranking by best match. Top match first.`;

    try {
      const response = await this.openaiService.generateCompletion(
        systemPrompt,
        userPrompt,
        0.3,
      );

      // Parse JSON from response
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        this.logger.warn('[RAG] No JSON in LLM response');
        return this.fallbackRanking(candidates);
      }

      const rankings = JSON.parse(jsonMatch[0]) as Array<{
        index: number;
        score: number;
        reasoning: string;
      }>;

      return rankings
        .filter(r => r.index >= 0 && r.index < candidates.length)
        .map(r => ({
          property: candidates[r.index],
          similarity: candidates[r.index].similarity ?? 0,
          aiScore: r.score,
          aiReasoning: r.reasoning,
        }));
    } catch (error: any) {
      this.logger.error(`[RAG] LLM ranking failed: ${error?.message}`);
      return this.fallbackRanking(candidates);
    }
  }

  // Fallback: use vector similarity as score
  private fallbackRanking(candidates: any[]): RAGMatch[] {
    return candidates.map(p => ({
      property: p,
      similarity: p.similarity ?? 0,
      aiScore: Math.round((p.similarity ?? 0) * 100),
      aiReasoning: `Matches your search based on location and preferences`,
    }));
  }

  // Main RAG matching flow
  async findMatchesWithRAG(dto: FindMatchesDto, topK: number = 3): Promise<RAGMatch[]> {
    try {
      this.logger.log(`[RAG] Query: ${dto.destination}`);

      const query = this.buildQuery(dto);
      const candidates = await this.embeddingsService.searchSimilar(query, 20, 0.3);
      
      if (candidates.length === 0) {
        this.logger.log('[RAG] No semantic matches found');
        return [];
      }

      const filtered = this.applyConstraints(candidates, dto);
      this.logger.log(`[RAG] After constraints: ${filtered.length} candidates`);

      if (filtered.length === 0) {
        // Return top candidates without constraints as nearby suggestions
        const ranked = await this.rankWithLLM(candidates.slice(0, 10), dto);
        return ranked.slice(0, topK);
      }

      const ranked = await this.rankWithLLM(filtered.slice(0, 10), dto);
      
      // Diversity: max 1 per host
      const hostSeen = new Set<string>();
      const diverse = ranked.filter(r => {
        const hostId = r.property.host_id;
        if (hostSeen.has(hostId)) return false;
        hostSeen.add(hostId);
        return true;
      });

      return diverse.slice(0, topK);
    } catch (error: any) {
      this.logger.error(`[RAG] Failed: ${error?.message}`);
      return [];
    }
  }
}
