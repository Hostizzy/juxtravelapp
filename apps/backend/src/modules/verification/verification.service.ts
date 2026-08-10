import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { CreateVerificationDto } from './dto/create-verification.dto';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

// ponytail: Surepass's exact field name for the registered holder name isn't
// documented consistently across their API versions — this reads response.data.data.full_name.
// If Surepass changes/renames it, namesMatch silently becomes false (falls back to manual
// review, fails safe). Confirm the real field name against a live Surepass response before relying
// on this in production.
function normalizeName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

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

        this.logger.log(`Surepass Aadhaar OTP generated for verification ${verificationId}`);
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

        // Auto verify only if PAN exists AND the registered holder name matches
        // what the user submitted — otherwise anyone who knows a stranger's PAN
        // (leaked lists, etc.) could clear KYC under someone else's identity.
        const registeredName: string | undefined = response.data?.data?.full_name;
        const namesMatch = registeredName
          ? normalizeName(registeredName) === normalizeName(dto.fullName)
          : false;

        if (response.data?.success && namesMatch) {
          await this.supabaseService.admin
            .from('guest_verifications')
            .update({
              status: 'verified',
              verified_at: new Date().toISOString()
            })
            .eq('id', verificationId);

          this.logger.log(`Auto-verified via Surepass PAN for verification ${verificationId}`);
        } else if (response.data?.success && !namesMatch) {
          this.logger.warn(
            `Surepass PAN valid but name mismatch for verification ${verificationId} — leaving for manual review`,
          );
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

    const verification = data ? await this.withSignedDocUrls(data) : null;

    return {
      isVerified: data?.status === 'verified',
      status: data?.status ?? null,
      verification,
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

    return data ? await this.withSignedDocUrls(data) : null;
  }

  // Replaces stored KYC doc paths with fresh short-lived signed URLs before
  // the record leaves the backend, for any caller (guest self-view, admin).
  private async withSignedDocUrls<T extends { id_photo_url?: string | null; selfie_url?: string | null }>(
    record: T,
  ): Promise<T> {
    const [id_photo_url, selfie_url] = await Promise.all([
      this.getSignedDocUrl(record.id_photo_url ?? null),
      this.getSignedDocUrl(record.selfie_url ?? null),
    ]);
    return { ...record, id_photo_url, selfie_url };
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

    // KYC docs (ID photo, selfie) are PII — never expose a permanent public URL.
    // We persist the storage path (see below) and mint short-lived signed URLs
    // on every read instead. The "url" field name is kept so the mobile client's
    // upload -> POST /verification round trip doesn't need to change.
    return { url: data.path };
  }

  // Mints a short-lived signed URL for a stored KYC doc path. Safe to call
  // repeatedly; each call issues a fresh 1-hour link. Requires the
  // 'verification-docs' bucket to be PRIVATE — a signed URL is meaningless
  // if the bucket is also public (the plain getPublicUrl would still work).
  async getSignedDocUrl(pathOrUrl: string | null): Promise<string | null> {
    if (!pathOrUrl) return null;
    // Back-compat: old rows hold a full public URL, e.g.
    // https://<project>.supabase.co/storage/v1/object/public/verification-docs/<path>
    // Once the bucket goes private that public URL 404s, so extract the path
    // after the bucket name and sign it like any new row.
    const marker = '/verification-docs/';
    const path = pathOrUrl.includes(marker)
      ? pathOrUrl.slice(pathOrUrl.indexOf(marker) + marker.length)
      : pathOrUrl;

    const { data, error } = await this.supabaseService.admin
      .storage
      .from('verification-docs')
      .createSignedUrl(path, 60 * 60);
    if (error) {
      this.logger.error(`Failed to sign KYC doc url for ${path}`, error);
      return null;
    }
    return data.signedUrl;
  }
}
