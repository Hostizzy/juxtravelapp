import {
  Controller, Post, Get,
  Body, UseGuards, UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { VerificationService } from './verification.service';
import { CreateVerificationDto } from './dto/create-verification.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';

@Controller('verification')
@UseGuards(JwtAuthGuard)
export class VerificationController {
  constructor(
    private verificationService: VerificationService
  ) {}

  @Post()
  async createVerification(
    @CurrentUser() payload: JwtPayload,
    @Body() dto: CreateVerificationDto,
  ) {
    return this.verificationService.createVerification(payload.sub, dto);
  }

  @Get('status')
  async getStatus(
    @CurrentUser() payload: JwtPayload,
  ) {
    return this.verificationService.getUserVerificationStatus(payload.sub);
  }

  @Post('upload-doc')
  @UseInterceptors(FileInterceptor('doc'))
  async uploadDoc(
    @CurrentUser() payload: JwtPayload,
    @UploadedFile() file: Express.Multer.File,
    @Body('docType') docType: string,
  ) {
    return this.verificationService.uploadVerificationDoc(
      file, payload.sub, docType
    );
  }
}
