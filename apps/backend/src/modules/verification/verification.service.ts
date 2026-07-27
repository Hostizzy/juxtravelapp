import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { CreateVerificationDto } from './dto/create-verification.dto';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class VerificationService {
  private readonly logger = new Logger(VerificationService.name);

  constructor(
    private supabaseService: SupabaseService,
    private configService: ConfigService,
    private httpService: HttpService,
  ) {}

  async createVerification(
    userId: string,
    dto: CreateVerificationDto
  ) {
    // Check if user already verified
    const { data: existing } = await this.supabaseService.admin
      .from('guest_verifications')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'verified')
      .maybeSingle();

    if (existing) {
      this.logger.log(`User ${userId} already verified - returning existing`);
      return {
        success: true,
        verified: true,
        status: 'verified',
        verificationId: existing.id,
        verification: existing,
      };
    }

    // Check if user has PENDING verification
    const { data: pending } = await this.supabaseService.admin
      .from('guest_verifications')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .maybeSingle();

    if (pending) {
      // UPDATE existing pending, don't create new
      const { data: updated, error: updateError } = await this.supabaseService.admin
        .from('guest_verifications')
        .update({
          full_name: dto.fullName,
          email: dto.email,
          age: dto.age,
          id_type: dto.idType,
          id_number: dto.idNumber,
          id_photo_url: dto.idPhotoUrl,
          selfie_url: dto.selfieUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', pending.id)
        .select()
        .single();

      if (!updateError && updated) {
        await this.tryVerifyWithSurepass(dto, updated.id);
        return {
          success: true,
          verificationId: updated.id,
          status: updated.status ?? 'pending',
          verification: updated,
        };
      }
    }

    // Create new verification
    const { data, error } = await this.supabaseService.admin
      .from('guest_verifications')
      .insert({
        user_id: userId,
        full_name: dto.fullName,
        email: dto.email,
        age: dto.age,
        id_type: dto.idType,
        id_number: dto.idNumber,
        id_photo_url: dto.idPhotoUrl,
        selfie_url: dto.selfieUrl,
        status: 'pending',
      })
      .select()
      .single();

    if (error || !data) {
      this.logger.error('Verification save failed', error);
      throw new Error('Failed to save verification');
    }

    this.logger.log(`Verification submitted: ${data.id}`);

    // Try Surepass verification (when API key available)
    await this.tryVerifyWithSurepass(dto, data.id);

    return { 
      success: true,
      verificationId: data.id,
      status: 'pending',
      verification: data,
    };
  }

  // Surepass API integration
  // Enable when API key available
  private async tryVerifyWithSurepass(
    dto: CreateVerificationDto,
    verificationId: string
  ): Promise<void> {
    const surepassKey = this.configService.get<string>('surepass.apiKey');

    // Skip if no API key
    if (!surepassKey) {
      this.logger.log('Surepass API key not configured - manual review');
      return;
    }

    try {
      // Aadhaar verification endpoint
      if (dto.idType === 'Aadhaar') {
        const response = await firstValueFrom(
          this.httpService.post(
            'https://kyc-api.surepass.io/api/v1/aadhaar-v2/generate-otp',
            { id_number: dto.idNumber },
            {
              headers: {
                'Authorization': `Bearer ${surepassKey}`,
                'Content-Type': 'application/json',
              }
            }
          )
        );

        this.logger.log('Surepass Aadhaar response:', response.data);
      }

      // PAN verification endpoint
      if (dto.idType === 'PAN') {
        const response = await firstValueFrom(
          this.httpService.post(
            'https://kyc-api.surepass.io/api/v1/pan/pan',
            { id_number: dto.idNumber },
            {
              headers: {
                'Authorization': `Bearer ${surepassKey}`,
                'Content-Type': 'application/json',
              }
            }
          )
        );

        // Auto verify if PAN valid
        if (response.data?.success) {
          await this.supabaseService.admin
            .from('guest_verifications')
            .update({ 
              status: 'verified',
              verified_at: new Date().toISOString()
            })
            .eq('id', verificationId);

          this.logger.log(`Auto-verified via Surepass PAN`);
        }
      }

    } catch (error) {
      // Surepass failed — fall to manual
      this.logger.error('Surepass verification failed:', error);
    }
  }

  async getVerificationStatus(userId: string): Promise<{
    isVerified: boolean;
    status: string | null;
    verification: any;
  }> {
    const { data } = await this.supabaseService.admin
      .from('guest_verifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    return {
      isVerified: data?.status === 'verified',
      status: data?.status ?? null,
      verification: data ?? null,
    };
  }

  async getUserVerificationStatus(userId: string) {
    const { data } = await this.supabaseService.admin
      .from('guest_verifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    return data;
  }

  async uploadVerificationDoc(
    file: Express.Multer.File,
    userId: string,
    docType: string
  ): Promise<{ url: string }> {
    const fileName = `${userId}/${docType}_${Date.now()}.jpg`;

    const { data, error } = await this.supabaseService.admin
      .storage
      .from('verification-docs')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (error) {
      this.logger.error('Verification doc upload failed', error);
      throw new Error('Upload failed');
    }

    const { data: urlData } = this.supabaseService.admin
      .storage
      .from('verification-docs')
      .getPublicUrl(data.path);

    return { url: urlData.publicUrl };
  }
}
