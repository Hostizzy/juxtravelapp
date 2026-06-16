import { Module } from '@nestjs/common';
import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';
import { MatchEngine } from './matches.engine';

@Module({
  controllers: [MatchesController],
  providers: [MatchesService, MatchEngine],
  exports: [MatchesService],
})
export class MatchesModule {}
