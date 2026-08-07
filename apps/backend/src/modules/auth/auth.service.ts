import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { SupabaseService } from '../../supabase/supabase.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { UsersService } from '../users/users.service';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import * as crypto from 'crypto';

function maskPhone(phone: string): string {
  if (!phone || phone.length <= 4) return '****';
  return '*'.repeat(phone.length - 4) + phone.slice(-4);
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  // Test numbers only in development
  private readonly TEST_NUMBERS: Record<string, string> =
    process.env.NODE_ENV === 'development'
      ? { '+919999999999': '123456' }
      : {};

  constructor(
    private supabaseService: SupabaseService,
    private whatsappService: WhatsappService,
    private usersService: UsersService,
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {}

  private generateOTP(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  private normalizePhone(phone: string): string {
    phone = phone.replace(/\s/g, '');
    if (!phone.startsWith('+')) {
      phone = '+91' + phone;
    }
    return phone;
  }

  async sendWhatsAppOTP(dto: SendOtpDto): Promise<{ message: string }> {
    const normalizedPhone = this.normalizePhone(dto.phone);

    // Delete ALL old OTPs for this phone
    await this.supabaseService.admin
      .from('otp_verifications')
      .delete()
      .eq('phone', normalizedPhone);

    const isTestNumber = !!this.TEST_NUMBERS[normalizedPhone];

    const otp = isTestNumber
      ? this.TEST_NUMBERS[normalizedPhone]
      : this.generateOTP();

    const { error } = await this.supabaseService.admin
      .from('otp_verifications')
      .insert({
        phone: normalizedPhone,
        otp,
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        verified: false,
        attempts: 0,
      });

    if (error) {
      this.logger.error('OTP save failed', error);
      throw new BadRequestException('Failed to generate OTP');
    }

    if (!isTestNumber) {
      try {
        await this.whatsappService.sendOTP(normalizedPhone, otp);
      } catch (err) {
        this.logger.error('WhatsApp send failed', err);
        await this.supabaseService.admin
          .from('otp_verifications')
          .delete()
          .eq('phone', normalizedPhone);
        throw new BadRequestException(
          'Failed to send OTP via WhatsApp. Template may not be approved yet.',
        );
      }
    }

    this.logger.log(`OTP ${isTestNumber ? '(test)' : ''} sent to ${maskPhone(normalizedPhone)}`);

    return {
      message: isTestNumber
        ? 'Test OTP: use 123456'
        : 'OTP sent to your WhatsApp',
    };
  }

  async verifyOTPAndLogin(dto: VerifyOtpDto): Promise<{
    user: unknown;
    isNewUser: boolean;
    accessToken: string;
    userId: string;
  }> {
    const normalizedPhone = this.normalizePhone(dto.phone);

    this.logger.log(`Verifying OTP for phone: ${maskPhone(normalizedPhone)}`);

    // Fetch latest active unverified OTP for this phone number
    const { data: otpRecord, error: otpError } = await this.supabaseService.admin
      .from('otp_verifications')
      .select('*')
      .eq('phone', normalizedPhone)
      .eq('verified', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (otpError || !otpRecord) {
      this.logger.error(`Invalid or expired OTP for ${maskPhone(normalizedPhone)}`);
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    // Check existing failed attempt count (max 5 attempts)
    const currentAttempts = (otpRecord.attempts ?? 0) + 1;

    if (currentAttempts > 5) {
      // Invalidate OTP immediately
      await this.supabaseService.admin
        .from('otp_verifications')
        .delete()
        .eq('id', otpRecord.id);

      this.logger.warn(`Max OTP verification attempts reached for ${maskPhone(normalizedPhone)}`);
      throw new UnauthorizedException(
        'Maximum OTP verification attempts exceeded. Please request a new OTP.',
      );
    }

    // Check if OTP matches
    if (otpRecord.otp !== dto.otp) {
      // Update attempt count in DB
      await this.supabaseService.admin
        .from('otp_verifications')
        .update({ attempts: currentAttempts })
        .eq('id', otpRecord.id);

      if (currentAttempts >= 5) {
        // Invalidate on 5th failure
        await this.supabaseService.admin
          .from('otp_verifications')
          .delete()
          .eq('id', otpRecord.id);
        throw new UnauthorizedException(
          'Maximum OTP verification attempts exceeded. Please request a new OTP.',
        );
      }

      throw new UnauthorizedException('Invalid or expired OTP');
    }

    // Mark OTP as verified
    await this.supabaseService.admin
      .from('otp_verifications')
      .update({ verified: true })
      .eq('id', otpRecord.id);

    // Check if user exists
    const existingUser = await this.usersService.findByPhone(normalizedPhone);

    let userId: string;
    let isNewUser = false;

    if (!existingUser) {
      isNewUser = true;

      const { data: authData, error: authError } =
        await this.supabaseService.admin.auth.admin.createUser({
          phone: normalizedPhone,
          phone_confirm: true,
          user_metadata: { name: dto.name },
        });

      if (authError || !authData.user) {
        this.logger.error('Auth user create failed', authError);
        throw new BadRequestException('Failed to create user');
      }

      userId = authData.user.id;

      await this.usersService.createUser({
        id: userId,
        name: dto.name,
        phone: normalizedPhone,
      });

      this.logger.log(`New user created: ${userId}`);
    } else {
      userId = existingUser.id;
      // Do NOT overwrite existing user's name on login
      this.logger.log(`Existing user login: ${userId}`);
    }

    const userData = await this.usersService.findById(userId);

    try {
      const jwtToken = this.jwtService.sign({
        sub: userId,
        phone: normalizedPhone,
        role: (userData as any)?.role ?? 'guest',
      });

      return {
        user: userData,
        isNewUser,
        accessToken: jwtToken,
        userId,
      };
    } catch (jwtError) {
      this.logger.error('JWT sign error:', jwtError);
      throw new Error('Failed to generate token');
    }
  }

  async googleAuth(
    idToken: string,
    name: string,
  ): Promise<{
    user: unknown;
    isNewUser: boolean;
    accessToken: string;
    userId: string;
  }> {
    const { data, error } = await this.supabaseService.anon.auth.signInWithIdToken({
      provider: 'google',
      token: idToken,
    });

    if (error || !data.user) {
      throw new UnauthorizedException('Invalid Google token');
    }

    const supabaseUser = data.user;
    let isNewUser = false;

    const existingUser = await this.usersService.findById(supabaseUser.id);

    if (!existingUser) {
      isNewUser = true;
      await this.usersService.createUser({
        id: supabaseUser.id,
        name: name || supabaseUser.user_metadata?.full_name || 'User',
        email: supabaseUser.email,
        phone: supabaseUser.phone,
      });
    }

    const userData = await this.usersService.findById(supabaseUser.id);

    const jwtToken = this.jwtService.sign({
      sub: supabaseUser.id,
      email: supabaseUser.email,
      role: (userData as any)?.role ?? 'guest',
    });

    return {
      user: userData,
      isNewUser,
      accessToken: jwtToken,
      userId: supabaseUser.id,
    };
  }
}
