import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import * as adminAuth from 'firebase-admin/auth';
import { UpdateUserDto } from './dto/update-user.dto';
import { BecomeHostDto } from './dto/become-host.dto';

@Controller('users')
@UseGuards(FirebaseAuthGuard)
export class UsersController {
  constructor(
    private usersService: UsersService
  ) {}

  @Get('me')
  async getMe(@CurrentUser() user: adminAuth.DecodedIdToken) {
    return this.usersService.findById(user.uid);
  }

  @Patch('me')
  async updateMe(
    @CurrentUser() user: adminAuth.DecodedIdToken,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(user.uid, dto);
  }

  @Post('become-host')
  async becomeHost(
    @CurrentUser() user: adminAuth.DecodedIdToken,
    @Body() dto: BecomeHostDto,
  ) {
    return this.usersService.becomeHost(user.uid, dto.bio);
  }
}
