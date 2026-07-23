import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SupabaseModule } from '../../supabase/supabase.module';
import { AIController } from './ai.controller';
import { OpenAIService } from './openai.service';
import { EmbeddingsService } from './embeddings.service';
import { RAGService } from './rag.service';
import { InsightsService } from './insights.service';

@Module({
  imports: [ConfigModule, SupabaseModule],
  controllers: [AIController],
  providers: [OpenAIService, EmbeddingsService, RAGService, InsightsService],
  exports: [OpenAIService, EmbeddingsService, RAGService, InsightsService],
})
export class AIModule {}
