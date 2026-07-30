import { Controller, Get, Query } from '@nestjs/common';
import { DiscoverService } from './discover.service';

@Controller('discover')
export class DiscoverController {
  constructor(private discoverService: DiscoverService) {}

  @Get('posts')
  async getPosts(
    @Query('limit') limit: string = '20',
    @Query('offset') offset: string = '0',
  ) {
    const limitNum = Math.min(parseInt(limit) || 20, 50);
    const offsetNum = parseInt(offset) || 0;
    return this.discoverService.getPostsFeed(limitNum, offsetNum);
  }
}
