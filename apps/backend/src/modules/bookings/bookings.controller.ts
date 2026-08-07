import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Param,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { CreateDirectBookingDto } from './dto/create-direct-booking.dto';

@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post('create-direct')
  async createDirect(
    @CurrentUser() payload: JwtPayload,
    @Body() dto: CreateDirectBookingDto,
  ) {
    return this.bookingsService.createDirect(payload.sub, dto);
  }

  @Get('my-bookings')
  async getMyBookings(@CurrentUser() payload: JwtPayload) {
    return this.bookingsService.getMyBookings(payload.sub);
  }

  @Get('host-bookings')
  async getHostBookings(@CurrentUser() payload: JwtPayload) {
    return this.bookingsService.getHostBookings(payload.sub);
  }

  @Get('earnings')
  async getEarnings(@CurrentUser() payload: JwtPayload) {
    return this.bookingsService.getHostEarnings(payload.sub);
  }

  @Get('host-stats')
  async getHostStats(@CurrentUser() payload: JwtPayload) {
    return this.bookingsService.getHostStats(payload.sub);
  }

  @Get('host-detailed-stats')
  async getHostDetailedStats(@CurrentUser() payload: JwtPayload) {
    return this.bookingsService.getHostDetailedStats(payload.sub);
  }

  @Get(':id')
  async getBookingById(
    @CurrentUser() payload: JwtPayload,
    @Param('id') id: string,
  ) {
    return this.bookingsService.getBookingById(id, payload.sub);
  }
}
