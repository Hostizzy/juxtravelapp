import { 
  Controller, 
  Post, 
  Body,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { VerifyTokenDto } from './dto/verify-token.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService
  ) {}

  @Post('verify')
  async verify(@Body() dto: VerifyTokenDto) {
    return this.authService.verifyAndSync(dto);
  }
}
