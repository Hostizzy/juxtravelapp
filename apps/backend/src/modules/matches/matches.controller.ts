import {
  Controller, Post, Body, UseGuards
} from '@nestjs/common';
import { MatchesService } from './matches.service';
import { FindMatchesDto } from './dto/find-matches.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';

@Controller('matches')
@UseGuards(JwtAuthGuard)
export class MatchesController {
  constructor(
    private matchesService: MatchesService
  ) {}

  @Post('find')
  async findMatches(
    @CurrentUser() payload: JwtPayload,
    @Body() dto: FindMatchesDto,
  ) {
    dto.userId = payload.sub;
    return this.matchesService.findMatches(dto);
  }
}
