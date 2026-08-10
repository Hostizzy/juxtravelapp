import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';

const ALLOWED_IMAGE_MIME = ['image/jpeg', 'image/png', 'image/webp'];

@Controller('properties')
export class PropertiesController {
  constructor(
    private propertiesService: PropertiesService
  ) {}

  @Post('upload-photo')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('photo', {
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  }))
  async uploadPhoto(
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    if (!ALLOWED_IMAGE_MIME.includes(file.mimetype)) {
      throw new BadRequestException(`File type must be one of: ${ALLOWED_IMAGE_MIME.join(', ')}`);
    }
    return this.propertiesService.uploadPhoto(file);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @CurrentUser() payload: JwtPayload,
    @Body() dto: CreatePropertyDto,
  ) {
    return this.propertiesService.create(
      payload.sub,
      dto
    );
  }

  @Get('active')
  async getActiveProperties() {
    return this.propertiesService.findActive();
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  async getMyProperties(
    @CurrentUser() payload: JwtPayload,
  ) {
    return this.propertiesService.findByHostId(payload.sub);
  }

  @Get('slug/:slug')
  async getBySlug(
    @Param('slug') slug: string,
  ) {
    return this.propertiesService.findBySlug(slug);
  }

  @Get(':id/stats')
  @UseGuards(JwtAuthGuard)
  async getPropertyStats(
    @CurrentUser() payload: JwtPayload,
    @Param('id') id: string,
  ) {
    return this.propertiesService.getPropertyStats(
      id, payload.sub
    );
  }

  // Stays unauthenticated on purpose — anonymous guests browse properties
  // without logging in and views should still count. Requiring auth here would
  // break that; a Throttle limit is the appropriate control against trivial
  // inflation instead (doesn't fully stop it, but bounds the abuse rate).
  @Post(':id/view')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async trackView(
    @Param('id') id: string,
  ) {
    return this.propertiesService.trackView(id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getProperty(
    @CurrentUser() payload: JwtPayload,
    @Param('id') id: string,
  ) {
    return this.propertiesService.findById(id, payload?.sub);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async updateProperty(
    @CurrentUser() payload: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdatePropertyDto,
  ) {
    return this.propertiesService.update(
      id,
      payload.sub,
      dto
    );
  }
}
