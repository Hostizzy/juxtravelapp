import {
  Controller, Post, Body, UseGuards
} from '@nestjs/common';
import { MatchesService } from './matches.service';
import { FindMatchesDto } from './dto/find-matches.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('matches')
@UseGuards(JwtAuthGuard)
export class MatchesController {
  constructor(
    private matchesService: MatchesService
  ) {}

  @Post('find')
  async findMatches(
    @Body() dto: FindMatchesDto,
  ) {
    return this.matchesService.findMatches(dto);
  }
}
