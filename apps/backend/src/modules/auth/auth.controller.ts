import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from 
  './dto/verify-otp.dto';
import { GoogleAuthDto } from 
  './dto/google-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService
  ) {}

  @Post('send-otp')
  @HttpCode(HttpStatus.OK)
  async sendOTP(@Body() dto: SendOtpDto) {
    return this.authService
      .sendWhatsAppOTP(dto);
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyOTP(@Body() dto: VerifyOtpDto) {
    return this.authService
      .verifyOTPAndLogin(dto);
  }

  @Post('google')
  @HttpCode(HttpStatus.OK)
  async googleAuth(
    @Body() dto: GoogleAuthDto
  ) {
    return this.authService.googleAuth(
      dto.accessToken,
      dto.name,
    );
  }
}
