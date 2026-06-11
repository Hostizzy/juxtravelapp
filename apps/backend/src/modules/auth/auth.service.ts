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

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  // Test numbers for development
  private readonly TEST_NUMBERS: Record<string, string> = {
    '+919999999999': '123456',
  };

  constructor(
    private supabaseService: SupabaseService,
    private whatsappService: WhatsappService,
    private usersService: UsersService,
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {}

  private generateOTP(): string {
    return crypto
      .randomInt(100000, 999999)
      .toString();
  }

  private normalizePhone(phone: string): string {
    // Remove all spaces
    phone = phone.replace(/\s/g, '');
    // Add +91 if not present
    if (!phone.startsWith('+')) {
      phone = '+91' + phone;
    }
    return phone;
  }

  async sendWhatsAppOTP(
    dto: SendOtpDto
  ): Promise<{ message: string }> {
    const normalizedPhone = this.normalizePhone(dto.phone);

    // Delete ALL old OTPs for this phone
    await this.supabaseService.admin
      .from('otp_verifications')
      .delete()
      .eq('phone', normalizedPhone);

    // Check if test number
    const isTestNumber = !!this.TEST_NUMBERS[normalizedPhone];
    
    const otp = isTestNumber 
      ? this.TEST_NUMBERS[normalizedPhone]
      : this.generateOTP();

    // Save new OTP
    const { error } = await this.supabaseService.admin
        .from('otp_verifications')
        .insert({
          phone: normalizedPhone,
          otp,
          expires_at: new Date(
            Date.now() + 30 * 60 * 1000
          ).toISOString(),
          verified: false,
        });

    if (error) {
      this.logger.error('OTP save failed', error);
      throw new BadRequestException('Failed to generate OTP');
    }

    // Send WhatsApp only for real numbers
    if (!isTestNumber) {
      try {
        await this.whatsappService.sendOTP(normalizedPhone, otp);
      } catch (err) {
        this.logger.error('WhatsApp send failed', err);
        // Delete OTP if WhatsApp fails
        await this.supabaseService.admin
          .from('otp_verifications')
          .delete()
          .eq('phone', normalizedPhone);
        throw new BadRequestException(
          'Failed to send OTP via WhatsApp. Template may not be approved yet.'
        );
      }
    }

    this.logger.log(
      `OTP ${isTestNumber ? '(test)' : ''} sent to ${normalizedPhone}`
    );

    return { 
      message: isTestNumber 
        ? 'Test OTP: use 123456'
        : 'OTP sent to your WhatsApp'
    };
  }

  async verifyOTPAndLogin(
    dto: VerifyOtpDto
  ): Promise<{
    user: unknown;
    isNewUser: boolean;
    accessToken: string;
    userId: string;
  }> {
    this.logger.log(
      `Verifying OTP - Phone: ${dto.phone}, OTP: ${dto.otp}`
    );

    const normalizedPhone = this.normalizePhone(dto.phone);

    this.logger.log(
      `Normalized phone: ${normalizedPhone}`
    );

    // Find valid OTP
    const { data: otpRecord, error: otpError } =
      await this.supabaseService.admin
        .from('otp_verifications')
        .select('*')
        .eq('phone', normalizedPhone)
        .eq('otp', dto.otp)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    this.logger.log(
      `OTP Record found: ${JSON.stringify(otpRecord)}`
    );
    this.logger.log(
      `OTP Error: ${JSON.stringify(otpError)}`
    );

    if (otpError || !otpRecord) {
      this.logger.error(`Invalid OTP for ${normalizedPhone}`);
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
      
      // Create Supabase Auth user
      const { data: authData, error: authError } =
        await this.supabaseService.admin
          .auth.admin.createUser({
            phone: normalizedPhone,
            phone_confirm: true,
            user_metadata: { name: dto.name },
          });

      if (authError || !authData.user) {
        this.logger.error('Auth user create failed', authError);
        throw new BadRequestException('Failed to create user');
      }

      userId = authData.user.id;

      // Create user in users table
      await this.usersService.createUser({
        id: userId,
        name: dto.name,
        phone: normalizedPhone,
      });

      this.logger.log(`New user created: ${userId}`);
    } else {
      userId = existingUser.id;
      
      // Update name
      await this.usersService.updateUser(userId, { name: dto.name });

      this.logger.log(`Existing user login: ${userId}`);
    }

    // Get complete user data
    const userData = await this.usersService.findById(userId);

    this.logger.log(
      `JWT Secret exists: ${!!this.configService.get('jwt.secret')}`
    );

    this.logger.log(
      `Signing JWT for user: ${userId}`
    );

    try {
      const jwtToken = this.jwtService.sign({
        sub: userId,
        phone: normalizedPhone,
        role: (userData as any)?.role ?? 'guest',
      });
      
      this.logger.log('JWT signed successfully');
      
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
    accessToken: string,
    name: string,
  ): Promise<{
    user: unknown;
    isNewUser: boolean;
  }> {
    const { data, error } = await this.supabaseService.anon.auth
        .signInWithIdToken({
          provider: 'google',
          token: accessToken,
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

    return {
      user: userData,
      isNewUser,
    };
  }
}
