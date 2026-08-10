import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { InsightsService } from './insights.service';
import { EmbeddingsService } from './embeddings.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminAuthGuard } from '../../common/guards/admin-auth.guard';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { Throttle } from '@nestjs/throttler';

@Controller('ai')
export class AIController {
  constructor(
    private embeddingsService: EmbeddingsService,
    private insightsService: InsightsService,
  ) {}

  // Get AI insight for plan flow (rate limited)
  @Post('insight')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 20, ttl: 60000 } }) // 20 requests per minute
  async getInsight(
    @CurrentUser() payload: JwtPayload,
    @Body() body: {
      step: number;
      destination?: string;
      groupType?: string;
      moods?: string[];
      budget?: number;
      guests?: number;
      bedrooms?: number;
    },
  ) {
    return this.insightsService.generateInsight(body);
  }

  // Batch embed — admin-only. Was JwtAuthGuard (any logged-in guest/host could
  // trigger a full re-embed of every property, an expensive AI-cost operation).
  @Post('embed-all')
  @UseGuards(AdminAuthGuard)
  async embedAll() {
    return this.embeddingsService.embedAllPending();
  }
}
