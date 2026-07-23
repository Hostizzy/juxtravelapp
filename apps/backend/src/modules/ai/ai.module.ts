import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SupabaseModule } from '../../supabase/supabase.module';
import { OpenAIService } from './openai.service';
import { EmbeddingsService } from './embeddings.service';
import { RAGService } from './rag.service';

@Module({
  imports: [ConfigModule, SupabaseModule],
  providers: [OpenAIService, EmbeddingsService, RAGService],
  exports: [OpenAIService, EmbeddingsService, RAGService],
})
export class AIModule {}
