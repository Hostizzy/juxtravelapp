import {
  Controller, Post, Get,
  Body, UseGuards, UseInterceptors,
  UploadedFile, BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { VerificationService } from './verification.service';
import { CreateVerificationDto } from './dto/create-verification.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';

const ALLOWED_DOC_TYPES = ['id_photo', 'selfie'];

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
    // Was: console.log('Verification DTO received:', dto) — dumped Aadhaar/PAN
    // numbers + full name + email to plaintext logs. Removed, no replacement needed.
    return this.verificationService.createVerification(
      payload.sub, dto
    );
  }

  @Get('status')
  async getStatus(
    @CurrentUser() payload: JwtPayload,
  ) {
    const status = await this.verificationService.getVerificationStatus(payload.sub);
    return status;
  }

  @Post('upload-doc')
  @UseInterceptors(FileInterceptor('doc'))
  async uploadDoc(
    @CurrentUser() payload: JwtPayload,
    @UploadedFile() file: Express.Multer.File,
    @Body('docType') docType: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    if (!docType || !ALLOWED_DOC_TYPES.includes(docType)) {
      throw new BadRequestException(`docType must be one of: ${ALLOWED_DOC_TYPES.join(', ')}`);
    }
    return this.verificationService.uploadVerificationDoc(
      file, payload.sub, docType
    );
  }
}
