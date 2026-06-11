import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { SupabaseService } from '../../supabase/supabase.service';
import { firstValueFrom } from 'rxjs';

export interface InstagramReel {
  id: string;
  media_type: string;
  media_url: string;
  thumbnail_url?: string;
  caption?: string;
  timestamp: string;
  permalink: string;
}

@Injectable()
export class InstagramService {
  private readonly logger = new Logger(InstagramService.name);

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
    private supabaseService: SupabaseService,
  ) {}

  // Step 1: Get OAuth URL for Instagram
  getOAuthUrl(hostId: string): string {
    const appId = this.configService.get<string>('instagram.appId');
    const redirectUri = this.configService.get<string>('instagram.redirectUri');

    const scope = ['user_profile', 'user_media'].join(',');

    const state = Buffer.from(JSON.stringify({ hostId })).toString('base64');

    return `https://api.instagram.com/oauth/authorize?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri ?? '')}&scope=${scope}&response_type=code&state=${state}`;
  }

  // Step 2: Exchange code for access token
  async exchangeCodeForToken(
    code: string,
    hostId: string
  ): Promise<{ success: boolean }> {
    const appId = this.configService.get<string>('instagram.appId');
    const appSecret = this.configService.get<string>('instagram.appSecret');
    const redirectUri = this.configService.get<string>('instagram.redirectUri');

    try {
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
            }
          }
        )
      );

      const shortToken = tokenResponse.data.access_token;
      const igUserId = tokenResponse.data.user_id;

      // Exchange for long-lived token (60 days)
      const longTokenResponse = await firstValueFrom(
        this.httpService.get(
          `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${appSecret}&access_token=${shortToken}`
        )
      );

      const longToken = longTokenResponse.data.access_token;
      const expiresIn = longTokenResponse.data.expires_in;

      // Save token to host_profiles
      await this.supabaseService.admin
        .from('host_profiles')
        .update({
          instagram_access_token: longToken,
          instagram_user_id: igUserId.toString(),
          instagram_token_expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
          instagram_connected: true,
        })
        .eq('user_id', hostId);

      this.logger.log(`Instagram connected for host: ${hostId}`);

      return { success: true };

    } catch (error) {
      this.logger.error('Instagram token exchange failed', error);
      throw new Error('Failed to connect Instagram');
    }
  }

  // Step 3: Fetch reels from Instagram
  async fetchHostReels(hostId: string): Promise<InstagramReel[]> {
    // Get host instagram token
    const { data: hostProfile } = await this.supabaseService.admin
        .from('host_profiles')
        .select('instagram_access_token, instagram_user_id, instagram_connected')
        .eq('user_id', hostId)
        .single();

    if (!hostProfile?.instagram_connected || !hostProfile?.instagram_access_token) {
      return [];
    }

    try {
      const token = hostProfile.instagram_access_token;
      const userId = hostProfile.instagram_user_id;

      // Fetch media from Instagram
      const response = await firstValueFrom(
        this.httpService.get(
          `https://graph.instagram.com/${userId}/media?fields=id,media_type,media_url,thumbnail_url,caption,timestamp,permalink&access_token=${token}`
        )
      );

      // Filter only videos/reels
      const reels = response.data.data.filter(
        (item: InstagramReel) => 
          item.media_type === 'VIDEO' || 
          item.media_type === 'REEL'
      );

      return reels.slice(0, 20); // Max 20 reels

    } catch (error) {
      this.logger.error('Failed to fetch Instagram reels', error);
      return [];
    }
  }

  // Step 4: Save selected reels to property
  async saveReelsToProperty(
    propertyId: string,
    hostId: string,
    reelUrls: string[]
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

  // Get instagram connection status
  async getConnectionStatus(
    hostId: string
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

  // Disconnect Instagram
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
}
