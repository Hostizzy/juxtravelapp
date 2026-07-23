import { Module } from '@nestjs/common';
import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';
import { MatchEngine } from './matches.engine';
import { SupabaseModule } from '../../supabase/supabase.module';
import { AIModule } from '../ai/ai.module';

@Module({
  imports: [
    SupabaseModule,
    AIModule,
  ],
  controllers: [MatchesController],
  providers: [MatchesService, MatchEngine],
  exports: [MatchesService],
})
export class MatchesModule {}
