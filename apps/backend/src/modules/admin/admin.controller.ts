import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  Param,
  Patch,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AdminService } from './admin.service';
import { AdminAuthGuard } from '../../common/guards/admin-auth.guard';
import { Request } from 'express';

@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async login(@Body() body: { email: string; password: string }) {
    return this.adminService.login(body.email, body.password);
  }

  @Get('me')
  @UseGuards(AdminAuthGuard)
  async getMe(@Req() req: Request) {
    return (req as any).admin;
  }

  @Get('list')
  @UseGuards(AdminAuthGuard)
  async listAdmins() {
    return this.adminService.listAdmins();
  }

  @Post('create')
  @UseGuards(AdminAuthGuard)
  async createAdmin(
    @Req() req: Request,
    @Body()
    body: { email: string; password: string; name: string; role?: string },
  ) {
    const admin = (req as any).admin;
    return this.adminService.createAdmin(admin.role, body, admin.sub);
  }

  @Patch(':id/toggle')
  @UseGuards(AdminAuthGuard)
  async toggleAdmin(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() body: { isActive: boolean },
  ) {
    const admin = (req as any).admin;
    return this.adminService.toggleAdmin(admin.role, id, body.isActive);
  }
}
