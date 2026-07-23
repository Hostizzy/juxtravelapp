import { Controller, Get, Query } from '@nestjs/common';
import { LocationsService } from './locations.service';

@Controller('locations')
export class LocationsController {
  constructor(private locationsService: LocationsService) {}

  @Get('search')
  async searchCities(
    @Query('q') query: string,
    @Query('limit') limit: string = '10',
  ) {
    const limitNum = Math.min(parseInt(limit) || 10, 50);
    const results = await this.locationsService.searchCities(query, limitNum);
    return { cities: results };
  }

  @Get('all')
  getAll() {
    return { cities: this.locationsService.getAllCities() };
  }
}
