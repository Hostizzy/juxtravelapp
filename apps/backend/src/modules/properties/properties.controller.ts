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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';

@Controller('properties')
export class PropertiesController {
  constructor(
    private propertiesService: PropertiesService
  ) {}

  @Post('upload-photo')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('photo'))
  async uploadPhoto(
    @UploadedFile() file: Express.Multer.File,
  ) {
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

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getProperty(
    @Param('id') id: string,
  ) {
    return this.propertiesService.findById(id);
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
