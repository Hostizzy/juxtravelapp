import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { SupabaseService } from '../../supabase/supabase.service';
import { firstValueFrom } from 'rxjs';
import * as crypto from 'crypto';

export interface InstagramReel {
  id: string;
  media_type: string;
  media_url: string;
  thumbnail_url?: string;
  caption?: string;
  timestamp: string;
  permalink: string;
}

const ALGORITHM = 'aes-256-gcm';

function getEncryptionKey(configService: ConfigService): Buffer {
  // No fallback: a fallback here would silently defeat the point of encrypting
  // Instagram tokens at rest. Must be set explicitly in production env vars.
  const secret = configService.get<string>('INSTAGRAM_TOKEN_ENCRYPTION_KEY');
  if (!secret) {
    throw new Error(
      'INSTAGRAM_TOKEN_ENCRYPTION_KEY is not set. Required to encrypt/decrypt stored Instagram tokens.',
    );
  }
  return crypto.createHash('sha256').update(secret).digest();
}

function encryptToken(text: string, key: Buffer): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

function decryptToken(encryptedText: string, key: Buffer): string {
  if (!encryptedText || !encryptedText.includes(':')) {
    return encryptedText; // Legacy unencrypted token fallback
  }
  const [ivHex, authTagHex, encryptedData] = encryptedText.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

@Injectable()
export class InstagramService {
  private readonly logger = new Logger(InstagramService.name);
  private oauthStatesCache = new Map<string, { hostId: string; propertyId?: string; expiresAt: number }>();

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
    private supabaseService: SupabaseService,
  ) {}

  // Step 1: Get OAuth URL for Instagram with CSRF state nonce
  async getOAuthUrl(hostId: string, propertyId?: string): Promise<string> {
    const appId =
      this.configService.get<string>('INSTAGRAM_APP_ID') ??
      this.configService.get<string>('instagram.appId');
    const redirectUri =
      this.configService.get<string>('INSTAGRAM_REDIRECT_URI') ??
      this.configService.get<string>('instagram.redirectUri');

    const nonce = crypto.randomUUID();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes TTL

    // Attempt to persist state in Supabase instagram_oauth_states table
    const { error } = await this.supabaseService.admin
      .from('instagram_oauth_states')
      .insert({
        nonce,
        host_id: hostId,
        property_id: propertyId || null,
        expires_at: new Date(expiresAt).toISOString(),
      });

    if (error) {
      this.logger.warn(`Could not save OAuth state to instagram_oauth_states table: ${error.message}. Using in-memory state fallback.`);
    }

    // Always mirror state to in-memory fallback
    this.oauthStatesCache.set(nonce, { hostId, propertyId, expiresAt });

    const scope = ['instagram_business_basic'].join(',');
    const url = `https://www.instagram.com/oauth/authorize?client_id=${appId}&redirect_uri=${encodeURIComponent(
      redirectUri ?? '',
    )}&scope=${scope}&response_type=code&state=${nonce}`;

    this.logger.log(`[INSTAGRAM_OAUTH_URL] Generated state nonce: ${nonce} for hostId: ${hostId}`);

    return url;
  }

  // Verify CSRF state nonce and extract metadata
  async verifyAndConsumeOAuthState(stateNonce: string): Promise<{ hostId: string; propertyId?: string }> {
    const now = Date.now();

    // Check Supabase table
    const { data, error } = await this.supabaseService.admin
      .from('instagram_oauth_states')
      .select('host_id, property_id, expires_at')
      .eq('nonce', stateNonce)
      .single();

    let hostId: string | undefined;
    let propertyId: string | undefined;

    if (data && !error) {
      if (new Date(data.expires_at).getTime() < now) {
        await this.supabaseService.admin.from('instagram_oauth_states').delete().eq('nonce', stateNonce);
        throw new Error('OAuth state expired. Please restart authorization.');
      }
      hostId = data.host_id;
      propertyId = data.property_id ?? undefined;

      // Delete state to prevent replay attack
      await this.supabaseService.admin.from('instagram_oauth_states').delete().eq('nonce', stateNonce);
    } else {
      // In-memory fallback check
      const cached = this.oauthStatesCache.get(stateNonce);
      this.oauthStatesCache.delete(stateNonce);

      if (!cached || cached.expiresAt < now) {
        throw new Error('Invalid or expired OAuth state nonce.');
      }
      hostId = cached.hostId;
      propertyId = cached.propertyId;
    }

    if (!hostId) {
      throw new Error('Invalid OAuth state.');
    }

    return { hostId, propertyId };
  }

  async exchangeCodeForToken(
    code: string,
    hostId: string,
    propertyId?: string,
  ): Promise<{ success: boolean }> {
    const appId =
      this.configService.get<string>('INSTAGRAM_APP_ID') ??
      this.configService.get<string>('instagram.appId');
    const appSecret =
      this.configService.get<string>('INSTAGRAM_APP_SECRET') ??
      this.configService.get<string>('instagram.appSecret');
    const redirectUri =
      this.configService.get<string>('INSTAGRAM_REDIRECT_URI') ??
      this.configService.get<string>('instagram.redirectUri');

    try {
      this.logger.log(`[INSTAGRAM] 1️⃣ START OAuth exchange for hostId: ${hostId}`);

      // Exchange for short-lived token
      const tokenResponse = await firstValueFrom(
        this.httpService.post(
          'https://api.instagram.com/oauth/access_token',
          new URLSearchParams({
            client_id: appId ?? '',
            client_secret: appSecret ?? '',
            grant_type: 'authorization_code',
            redirect_uri: redirectUri ?? '',
            code,
          }),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
        ),
      );

      const shortToken = tokenResponse.data.access_token;
      const igUserId = tokenResponse.data.user_id;

      // Exchange for long-lived token (60 days)
      const longTokenResponse = await firstValueFrom(
        this.httpService.get(
          `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${appSecret}&access_token=${shortToken}`,
        ),
      );

      const longToken = longTokenResponse.data.access_token;
      const expiresIn = longTokenResponse.data.expires_in;

      // Encrypt token before saving to database (AES-256-GCM)
      const encryptionKey = getEncryptionKey(this.configService);
      const encryptedLongToken = encryptToken(longToken, encryptionKey);

      const { error: updateError } = await this.supabaseService.admin
        .from('host_profiles')
        .update({
          instagram_access_token: encryptedLongToken,
          instagram_user_id: igUserId.toString(),
          instagram_token_expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
          instagram_connected: true,
        })
        .eq('user_id', hostId);

      if (updateError) {
        this.logger.error(`[INSTAGRAM] Database update failed: ${updateError.message}`);
        throw updateError;
      }

      this.logger.log(`[INSTAGRAM] Token encrypted and saved successfully for hostId: ${hostId}`);

      // AUTO-FETCH: Get reels immediately
      const reels = await this.fetchHostReels(hostId);
      const reelUrls = reels.slice(0, 15).map((r) => r.media_url || r.permalink);

      if (propertyId && reelUrls.length > 0) {
        await this.saveReelsToProperty(propertyId, hostId, reelUrls);
      }

      return { success: true };
    } catch (error) {
      this.logger.error('Instagram token exchange failed', error);
      throw new Error('Failed to connect Instagram');
    }
  }

  async fetchHostReels(hostId: string): Promise<InstagramReel[]> {
    const { data: hostProfile, error: selectError } = await this.supabaseService.admin
      .from('host_profiles')
      .select('instagram_access_token, instagram_user_id, instagram_connected')
      .eq('user_id', hostId)
      .single();

    if (selectError || !hostProfile?.instagram_connected || !hostProfile?.instagram_access_token) {
      return [];
    }

    try {
      const encryptionKey = getEncryptionKey(this.configService);
      const token = decryptToken(hostProfile.instagram_access_token, encryptionKey);
      const userId = hostProfile.instagram_user_id;

      const response = await firstValueFrom(
        this.httpService.get(
          `https://graph.instagram.com/${userId}/media?fields=id,media_type,media_url,thumbnail_url,caption,timestamp,permalink&access_token=${token}`,
        ),
      );

      const reels = (response.data.data || []).filter(
        (item: InstagramReel) => item.media_type === 'VIDEO' || item.media_type === 'REEL',
      );

      return reels.slice(0, 20);
    } catch (error) {
      this.logger.error('Failed to fetch Instagram reels', error);
      return [];
    }
  }

  async saveReelsToProperty(
    propertyId: string,
    hostId: string,
    reelUrls: string[],
  ): Promise<{ success: boolean }> {
    const { error } = await this.supabaseService.admin
      .from('properties')
      .update({
        reel_urls: reelUrls,
        updated_at: new Date().toISOString(),
      })
      .eq('id', propertyId)
      .eq('host_id', hostId);

    if (error) {
      throw new Error('Failed to save reels');
    }

    return { success: true };
  }

  async getConnectionStatus(
    hostId: string,
  ): Promise<{
    connected: boolean;
    username?: string;
  }> {
    const { data } = await this.supabaseService.admin
      .from('host_profiles')
      .select('instagram_connected, instagram_user_id')
      .eq('user_id', hostId)
      .single();

    return {
      connected: data?.instagram_connected ?? false,
      username: data?.instagram_user_id,
    };
  }

  async disconnectInstagram(hostId: string): Promise<{ success: boolean }> {
    await this.supabaseService.admin
      .from('host_profiles')
      .update({
        instagram_access_token: null,
        instagram_user_id: null,
        instagram_token_expires_at: null,
        instagram_connected: false,
      })
      .eq('user_id', hostId);

    return { success: true };
  }

  async getRandomizedReels(
    limit: number = 20,
    offset: number = 0,
  ): Promise<{
    reels: Array<{
      id: string;
      url: string;
      property_id: string;
      property_name: string;
      location: { city: string; state: string };
      price_per_night: number;
      host_id: string;
    }>;
    total: number;
    hasMore: boolean;
  }> {
    try {
      const { data: properties, error } = await this.supabaseService.admin
        .from('properties')
        .select('id, name, host_id, reel_urls, location, price_per_night')
        .eq('status', 'active');

      if (error || !properties) {
        this.logger.error('Failed to fetch properties with reels', error);
        return { reels: [], total: 0, hasMore: false };
      }

      const propertiesWithReels = properties.filter(
        (prop: any) => prop.reel_urls && Array.isArray(prop.reel_urls) && prop.reel_urls.length > 0,
      );

      const allReels: Array<{
        id: string;
        url: string;
        property_id: string;
        property_name: string;
        location: { city: string; state: string };
        price_per_night: number;
        host_id: string;
      }> = [];

      propertiesWithReels.forEach((prop: any) => {
        if (prop.reel_urls && Array.isArray(prop.reel_urls)) {
          prop.reel_urls.forEach((url: string) => {
            allReels.push({
              id: `${prop.id}-${url}`.replace(/[^a-zA-Z0-9-]/g, '').slice(0, 36),
              url,
              property_id: prop.id,
              property_name: prop.name,
              location: prop.location || { city: '', state: '' },
              price_per_night: prop.price_per_night,
              host_id: prop.host_id,
            });
          });
        }
      });

      const shuffled = [...allReels];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }

      const diverse: typeof shuffled = [];
      const used = new Set<string>();

      for (const reel of shuffled) {
        if (used.has(reel.property_id)) {
          continue;
        }
        diverse.push(reel);
        used.clear();
        used.add(reel.property_id);
      }

      if (diverse.length < shuffled.length / 2) {
        for (const reel of shuffled) {
          if (!diverse.includes(reel) && diverse.length < shuffled.length) {
            diverse.push(reel);
          }
        }
      }

      const paginated = diverse.slice(offset, offset + limit);
      const total = diverse.length;
      const hasMore = offset + limit < total;

      return {
        reels: paginated,
        total,
        hasMore,
      };
    } catch (error) {
      this.logger.error('getRandomizedReels failed', error);
      return { reels: [], total: 0, hasMore: false };
    }
  }

  async saveReelToGuest(guestId: string, reelUrl: string): Promise<{ success: boolean }> {
    try {
      const { data: guest } = await this.supabaseService.admin
        .from('guest_profiles')
        .select('saved_reels')
        .eq('user_id', guestId)
        .single();

      const currentReels = guest?.saved_reels || [];

      if (!currentReels.includes(reelUrl)) {
        currentReels.push(reelUrl);
      }

      const { error } = await this.supabaseService.admin
        .from('guest_profiles')
        .update({ saved_reels: currentReels })
        .eq('user_id', guestId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      this.logger.error('Failed to save reel', error);
      throw error;
    }
  }
}
