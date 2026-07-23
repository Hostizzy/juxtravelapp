import { Injectable, Logger } from '@nestjs/common';
import { OpenAIService } from './openai.service';
import { SupabaseService } from '../../supabase/supabase.service';

interface PropertyForEmbedding {
  id: string;
  name?: string;
  tagline?: string;
  type?: string;
  description?: string;
  location?: { city?: string; state?: string; address?: string };
  amenities?: string[];
  capacity?: { maxGuests?: number; comfortableGuests?: number; rooms?: number };
  price_per_night?: number;
  weekend_price?: number;
  rating?: number;
}

@Injectable()
export class EmbeddingsService {
  private readonly logger = new Logger(EmbeddingsService.name);

  constructor(
    private openaiService: OpenAIService,
    private supabaseService: SupabaseService,
  ) {}

  // Build rich text from property data for embedding
  buildEmbeddingText(property: PropertyForEmbedding): string {
    const parts: string[] = [];
    
    if (property.name) parts.push(`Name: ${property.name}`);
    if (property.tagline) parts.push(`Tagline: ${property.tagline}`);
    if (property.type) parts.push(`Type: ${property.type}`);
    
    const loc = property.location ?? {};
    const locationStr = [loc.city, loc.state, loc.address]
      .filter(Boolean).join(', ');
    if (locationStr) parts.push(`Location: ${locationStr}`);
    
    if (property.amenities && property.amenities.length > 0) {
      parts.push(`Amenities: ${property.amenities.join(', ')}`);
    }
    
    const cap = property.capacity ?? {};
    if (cap.rooms) parts.push(`Rooms: ${cap.rooms} bedrooms`);
    if (cap.maxGuests) parts.push(`Max guests: ${cap.maxGuests}`);
    if (cap.comfortableGuests) parts.push(`Comfortable for: ${cap.comfortableGuests} guests`);
    
    if (property.price_per_night) {
      parts.push(`Price: ₹${property.price_per_night}/night`);
    }
    if (property.weekend_price) {
      parts.push(`Weekend price: ₹${property.weekend_price}/night`);
    }
    
    if (property.rating) parts.push(`Rating: ${property.rating}/5`);
    if (property.description) parts.push(`Description: ${property.description}`);
    
    return parts.join('\n');
  }

  // Embed a single property and save to DB
  async embedProperty(propertyId: string): Promise<boolean> {
    try {
      const { data: property, error } = await this.supabaseService.admin
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .single();

      if (error || !property) {
        this.logger.error(`[EMBED] Property not found: ${propertyId}`);
        return false;
      }

      const embeddingText = this.buildEmbeddingText(property);
      this.logger.log(`[EMBED] Generating embedding for property: ${property.name}`);
      
      const embedding = await this.openaiService.createEmbedding(embeddingText);
      
      const { error: updateError } = await this.supabaseService.admin
        .from('properties')
        .update({
          embedding,
          embedding_text: embeddingText,
          embedding_updated_at: new Date().toISOString(),
        })
        .eq('id', propertyId);

      if (updateError) {
        this.logger.error(`[EMBED] Update failed: ${updateError.message}`);
        return false;
      }

      this.logger.log(`[EMBED] ✅ Embedded: ${property.name}`);
      return true;
    } catch (error: any) {
      this.logger.error(`[EMBED] Error: ${error?.message}`);
      return false;
    }
  }

  // Batch embed all properties without embeddings
  async embedAllPending(): Promise<{ total: number; embedded: number; failed: number }> {
    this.logger.log('[EMBED] Starting batch embedding...');
    
    const { data: properties, error } = await this.supabaseService.admin
      .from('properties')
      .select('id, name')
      .or('embedding.is.null,embedding_updated_at.is.null');

    if (error || !properties) {
      this.logger.error('[EMBED] Failed to fetch properties');
      return { total: 0, embedded: 0, failed: 0 };
    }

    let embedded = 0;
    let failed = 0;

    for (const prop of properties) {
      const success = await this.embedProperty(prop.id);
      if (success) embedded++;
      else failed++;
      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    this.logger.log(`[EMBED] Batch complete: ${embedded}/${properties.length} embedded`);
    return { total: properties.length, embedded, failed };
  }

  // Search properties by semantic similarity
  async searchSimilar(
    query: string,
    matchCount: number = 20,
    minSimilarity: number = 0.3,
  ): Promise<any[]> {
    try {
      const queryEmbedding = await this.openaiService.createEmbedding(query);
      
      const { data, error } = await this.supabaseService.admin.rpc('match_properties', {
        query_embedding: queryEmbedding,
        match_count: matchCount,
        min_similarity: minSimilarity,
      });

      if (error) {
        this.logger.error(`[SEARCH] RPC failed: ${error.message}`);
        return [];
      }

      return data ?? [];
    } catch (error: any) {
      this.logger.error(`[SEARCH] Error: ${error?.message}`);
      return [];
    }
  }
}
