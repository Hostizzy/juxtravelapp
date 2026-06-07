import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';

@Controller('properties')
@UseGuards(JwtAuthGuard)
export class PropertiesController {
  constructor(
    private propertiesService: PropertiesService
  ) {}

  @Post('upload-photo')
  @UseInterceptors(FileInterceptor('photo'))
  async uploadPhoto(
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.propertiesService.uploadPhoto(file);
  }

  @Post()
  async create(
    @CurrentUser() payload: JwtPayload,
    @Body() dto: CreatePropertyDto,
  ) {
    return this.propertiesService.create(
      payload.sub,
      dto
    );
  }

  @Get('my')
  async getMyProperties(
    @CurrentUser() payload: JwtPayload,
  ) {
    return this.propertiesService.findByHostId(payload.sub);
  }

  @Get(':id')
  async getProperty(
    @Param('id') id: string,
  ) {
    return this.propertiesService.findById(id);
  }
}
