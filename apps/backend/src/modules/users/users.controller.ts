import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import { BecomeHostDto } from './dto/become-host.dto';
import { SavePropertyDto } from './dto/save-property.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  async getMe(@CurrentUser() payload: JwtPayload) {
    return this.usersService.findById(payload.sub);
  }

  @Patch('me')
  async updateMe(
    @CurrentUser() payload: JwtPayload,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.updateUser(payload.sub, dto);
  }

  @Post('become-host')
  async becomeHost(
    @CurrentUser() payload: JwtPayload,
    @Body() dto: BecomeHostDto,
  ) {
    return this.usersService.becomeHost(payload.sub, dto);
  }

  @Post('save-property')
  async saveProperty(
    @CurrentUser() payload: JwtPayload,
    @Body() dto: SavePropertyDto,
  ) {
    return this.usersService.saveProperty(payload.sub, dto.propertyId);
  }

  @Get('saved-properties')
  async getSavedProperties(@CurrentUser() payload: JwtPayload) {
    return this.usersService.getSavedProperties(payload.sub);
  }

  @Get('my-trips')
  async getMyTrips(@CurrentUser() payload: JwtPayload) {
    return this.usersService.getMyTrips(payload.sub);
  }
}
