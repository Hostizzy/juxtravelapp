/**
 * Batch Embedding Script
 * 
 * Embeds all properties in database that don't have embeddings yet.
 * Run: pnpm ts-node scripts/embed-all-properties.ts
 * Or: npx ts-node scripts/embed-all-properties.ts
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const SUPABASE_URL = process.env.SUPABASE_URL ?? '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? '';
const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL ?? 'https://openrouter.ai/api/v1';
const OPENAI_EMBEDDING_MODEL = process.env.OPENAI_EMBEDDING_MODEL ?? 'openai/text-embedding-3-small';

// Validation
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

if (!OPENAI_API_KEY) {
  console.error('❌ Missing OPENAI_API_KEY');
  process.exit(1);
}

console.log('🚀 Starting Batch Embedding Script');
console.log(`📍 Supabase: ${SUPABASE_URL}`);
console.log(`🤖 OpenAI Base: ${OPENAI_BASE_URL}`);
console.log(`🧠 Model: ${OPENAI_EMBEDDING_MODEL}`);
console.log('');

// Initialize clients
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  baseURL: OPENAI_BASE_URL,
  defaultHeaders: {
    'HTTP-Referer': 'https://juxtravel.com',
    'X-Title': 'JuxTravel',
  },
});

interface Property {
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
  embedding?: number[] | null;
}

// Build rich text for embedding
function buildEmbeddingText(property: Property): string {
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

// Generate embedding using OpenAI
async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: OPENAI_EMBEDDING_MODEL,
    input: text,
  });
  return response.data[0].embedding;
}

// Sleep helper for rate limiting
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Main function
async function main() {
  console.log('📊 Fetching properties without embeddings...');
  
  // Fetch properties that need embedding
  const { data: properties, error } = await supabase
    .from('properties')
    .select('*')
    .or('embedding.is.null,embedding_updated_at.is.null');

  if (error) {
    console.error('❌ Failed to fetch properties:', error.message);
    process.exit(1);
  }

  if (!properties || properties.length === 0) {
    console.log('✅ All properties already embedded! Nothing to do.');
    process.exit(0);
  }

  console.log(`📦 Found ${properties.length} properties to embed`);
  console.log('');

  let embedded = 0;
  let failed = 0;
  const errors: Array<{ id: string; name: string; error: string }> = [];

  for (let i = 0; i < properties.length; i++) {
    const prop = properties[i] as Property;
    const progress = `[${i + 1}/${properties.length}]`;
    
    try {
      console.log(`${progress} Embedding: ${prop.name ?? prop.id}`);
      
      // Build text
      const embeddingText = buildEmbeddingText(prop);
      
      if (!embeddingText.trim()) {
        console.log(`${progress} ⚠️  Skipping (no data): ${prop.id}`);
        failed++;
        continue;
      }
      
      // Generate embedding
      const embedding = await generateEmbedding(embeddingText);
      
      // Update database
      const { error: updateError } = await supabase
        .from('properties')
        .update({
          embedding,
          embedding_text: embeddingText,
          embedding_updated_at: new Date().toISOString(),
        })
        .eq('id', prop.id);

      if (updateError) {
        console.log(`${progress} ❌ DB update failed: ${updateError.message}`);
        errors.push({ id: prop.id, name: prop.name ?? 'Unknown', error: updateError.message });
        failed++;
        continue;
      }

      console.log(`${progress} ✅ Success: ${prop.name}`);
      embedded++;
      
      // Rate limit: 300ms between requests
      await sleep(300);
      
    } catch (err: any) {
      const errorMsg = err?.message ?? 'Unknown error';
      console.log(`${progress} ❌ Error: ${errorMsg}`);
      errors.push({ id: prop.id, name: prop.name ?? 'Unknown', error: errorMsg });
      failed++;
      
      // If rate limit error, wait longer
      if (errorMsg.includes('rate') || errorMsg.includes('429')) {
        console.log('⏸️  Rate limit hit, waiting 5 seconds...');
        await sleep(5000);
      }
    }
  }

  console.log('');
  console.log('=====================================');
  console.log('📊 BATCH EMBEDDING COMPLETE');
  console.log('=====================================');
  console.log(`Total:    ${properties.length}`);
  console.log(`✅ Embedded: ${embedded}`);
  console.log(`❌ Failed:   ${failed}`);
  console.log('');

  if (errors.length > 0) {
    console.log('❌ Errors:');
    errors.forEach(e => {
      console.log(`  - ${e.name} (${e.id}): ${e.error}`);
    });
  }

  console.log('');
  console.log('🎉 Done!');
  process.exit(0);
}

main().catch(err => {
  console.error('💥 Fatal error:', err);
  process.exit(1);
});
