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
  getOAuthUrl(hostId: string, propertyId?: string): string {
    const appId = this.configService.get<string>('INSTAGRAM_APP_ID') 
                  ?? this.configService.get<string>('instagram.appId');
    const redirectUri = this.configService.get<string>('INSTAGRAM_REDIRECT_URI') 
                       ?? this.configService.get<string>('instagram.redirectUri');

    console.log('[INSTAGRAM_OAUTH_URL] Generating OAuth URL');
    console.log(`[INSTAGRAM_OAUTH_URL] - appId: ${appId ? '✅ EXISTS' : '❌ MISSING'}`);
    console.log(`[INSTAGRAM_OAUTH_URL] - redirectUri: ${redirectUri}`);
    console.log(`[INSTAGRAM_OAUTH_URL] - hostId: ${hostId}`);
    console.log(`[INSTAGRAM_OAUTH_URL] - propertyId: ${propertyId || 'NOT PROVIDED'}`);

    const scope = ['user_profile', 'user_media'].join(',');
    const state = Buffer.from(JSON.stringify({ hostId, propertyId })).toString('base64');

    const url = `https://api.instagram.com/oauth/authorize?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri ?? '')}&scope=${scope}&response_type=code&state=${state}`;
    
    console.log(`[INSTAGRAM_OAUTH_URL] Generated URL (first 100 chars): ${url.substring(0, 100)}...`);
    
    return url;
  }

  async exchangeCodeForToken(
    code: string,
    hostId: string,
    propertyId?: string
  ): Promise<{ success: boolean }> {
    const appId = this.configService.get<string>('INSTAGRAM_APP_ID')
                  ?? this.configService.get<string>('instagram.appId');
    const appSecret = this.configService.get<string>('INSTAGRAM_APP_SECRET')
                      ?? this.configService.get<string>('instagram.appSecret');
    const redirectUri = this.configService.get<string>('INSTAGRAM_REDIRECT_URI')
                        ?? this.configService.get<string>('instagram.redirectUri');

    try {
      console.log('[INSTAGRAM] 1️⃣ START OAuth exchange');
      console.log(`[INSTAGRAM] - hostId: ${hostId}`);
      console.log(`[INSTAGRAM] - propertyId: ${propertyId || 'NOT PROVIDED'}`);
      console.log(`[INSTAGRAM] - appId: ${appId ? '✅ EXISTS' : '❌ MISSING'}`);
      console.log(`[INSTAGRAM] - appSecret: ${appSecret ? '✅ EXISTS' : '❌ MISSING'}`);
      console.log(`[INSTAGRAM] - redirectUri: ${redirectUri}`);

      // Exchange for short-lived token
      console.log('[INSTAGRAM] 2️⃣ Requesting short-lived token from Instagram API');
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
      
      console.log(`[INSTAGRAM] 3️⃣ Short-lived token received`);
      console.log(`[INSTAGRAM] - igUserId: ${igUserId}`);
      console.log(`[INSTAGRAM] - shortToken: ${shortToken ? '✅ VALID' : '❌ INVALID'}`);

      // Exchange for long-lived token (60 days)
      console.log('[INSTAGRAM] 4️⃣ Exchanging for long-lived token');
      const longTokenResponse = await firstValueFrom(
        this.httpService.get(
          `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${appSecret}&access_token=${shortToken}`
        )
      );

      const longToken = longTokenResponse.data.access_token;
      const expiresIn = longTokenResponse.data.expires_in;
      
      console.log(`[INSTAGRAM] 5️⃣ Long-lived token received`);
      console.log(`[INSTAGRAM] - expiresIn: ${expiresIn} seconds (~${Math.round(expiresIn / 86400)} days)`);

      // Save token to host_profiles
      console.log('[INSTAGRAM] 6️⃣ Saving token to database');
      const { error: updateError } = await this.supabaseService.admin
        .from('host_profiles')
        .update({
          instagram_access_token: longToken,
          instagram_user_id: igUserId.toString(),
          instagram_token_expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
          instagram_connected: true,
        })
        .eq('user_id', hostId);

      if (updateError) {
        console.log(`[INSTAGRAM] ❌ Database update failed: ${updateError.message}`);
        throw updateError;
      }

      console.log(`[INSTAGRAM] 7️⃣ Token saved successfully`);

      // AUTO-FETCH: Get 15 reels immediately
      console.log(`[INSTAGRAM] 8️⃣ Auto-fetching reels from Instagram`);
      const reels = await this.fetchHostReels(hostId);
      console.log(`[INSTAGRAM] - Found ${reels.length} reels`);

      const reelUrls = reels.slice(0, 15).map((r) => r.media_url || r.permalink);
      console.log(`[INSTAGRAM] - Extracted ${reelUrls.length} reel URLs`);
      if (reelUrls.length > 0) {
        console.log(`[INSTAGRAM] - Sample URL: ${reelUrls[0]}`);
      }

      // If propertyId provided, save to that property
      if (propertyId && reelUrls.length > 0) {
        console.log(`[INSTAGRAM] 9️⃣ Saving reels to property: ${propertyId}`);
        await this.saveReelsToProperty(propertyId, hostId, reelUrls);
        console.log(`[INSTAGRAM] ✅ Auto-saved ${reelUrls.length} reels to property`);
      } else if (!propertyId) {
        console.log(`[INSTAGRAM] ⚠️ No propertyId provided - skipping auto-save`);
      } else {
        console.log(`[INSTAGRAM] ⚠️ No reels found - nothing to save`);
      }

      console.log(`[INSTAGRAM] ✅ COMPLETE - All steps successful`);
      return { success: true };

    } catch (error) {
      console.log(`[INSTAGRAM] ❌ ERROR at step - Details:`, error);
      this.logger.error('Instagram token exchange failed', error);
      throw new Error('Failed to connect Instagram');
    }
  }

  async fetchHostReels(hostId: string): Promise<InstagramReel[]> {
    console.log(`[INSTAGRAM] fetchHostReels - hostId: ${hostId}`);
    
    // Get host instagram token
    const { data: hostProfile, error: selectError } = await this.supabaseService.admin
      .from('host_profiles')
      .select('instagram_access_token, instagram_user_id, instagram_connected')
      .eq('user_id', hostId)
      .single();

    if (selectError) {
      console.log(`[INSTAGRAM] ❌ Failed to get host profile: ${selectError.message}`);
      return [];
    }

    console.log(`[INSTAGRAM] - instagram_connected: ${hostProfile?.instagram_connected}`);
    console.log(`[INSTAGRAM] - instagram_user_id: ${hostProfile?.instagram_user_id}`);
    console.log(`[INSTAGRAM] - instagram_access_token: ${hostProfile?.instagram_access_token ? '✅ EXISTS' : '❌ MISSING'}`);

    if (!hostProfile?.instagram_connected || !hostProfile?.instagram_access_token) {
      console.log(`[INSTAGRAM] ❌ Instagram not connected or no token`);
      return [];
    }

    try {
      const token = hostProfile.instagram_access_token;
      const userId = hostProfile.instagram_user_id;

      console.log(`[INSTAGRAM] Fetching media from Graph API - userId: ${userId}`);
      
      // Fetch media from Instagram
      const response = await firstValueFrom(
        this.httpService.get(
          `https://graph.instagram.com/${userId}/media?fields=id,media_type,media_url,thumbnail_url,caption,timestamp,permalink&access_token=${token}`
        )
      );

      console.log(`[INSTAGRAM] - Total media from API: ${response.data.data?.length || 0}`);

      // Filter only videos/reels
      const reels = response.data.data.filter(
        (item: InstagramReel) => 
          item.media_type === 'VIDEO' || 
          item.media_type === 'REEL'
      );

      console.log(`[INSTAGRAM] - Filtered reels (VIDEO/REEL): ${reels.length}`);
      console.log(`[INSTAGRAM] - Returning first ${Math.min(20, reels.length)} reels`);

      return reels.slice(0, 20); // Max 20 reels

    } catch (error) {
      console.log(`[INSTAGRAM] ❌ Failed to fetch reels:`, error);
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

  // Get all reels from all properties, randomized with diversity
  async getRandomizedReels(limit: number = 20, offset: number = 0): Promise<{
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
      // Fetch all properties with status = active
      const { data: properties, error } = await this.supabaseService.admin
        .from('properties')
        .select('id, name, host_id, reel_urls, location, price_per_night')
        .eq('status', 'active');

      if (error || !properties) {
        this.logger.error('Failed to fetch properties with reels', error);
        return { reels: [], total: 0, hasMore: false };
      }

      // Filter properties with reels
      const propertiesWithReels = properties.filter(
        (prop: any) => prop.reel_urls && Array.isArray(prop.reel_urls) && prop.reel_urls.length > 0
      );

      // Flatten all reels with property metadata
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

      // Shuffle array (Fisher-Yates)
      const shuffled = [...allReels];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }

      // Diversity filter: no 2 consecutive reels from same property
      const diverse: typeof shuffled = [];
      const used = new Set<string>();

      for (const reel of shuffled) {
        if (used.has(reel.property_id)) {
          continue; // Skip if same property as last reel
        }
        diverse.push(reel);
        used.clear(); // Reset after adding to allow repeats further down
        used.add(reel.property_id);
      }

      // If diversity filter removed too many, add back some
      if (diverse.length < shuffled.length / 2) {
        for (const reel of shuffled) {
          if (!diverse.includes(reel) && diverse.length < shuffled.length) {
            diverse.push(reel);
          }
        }
      }

      // Paginate
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

  // Save reel to guest's saved_reels
  async saveReelToGuest(guestId: string, reelUrl: string): Promise<{ success: boolean }> {
    try {
      // Get current saved reels
      const { data: guest } = await this.supabaseService.admin
        .from('guest_profiles')
        .select('saved_reels')
        .eq('user_id', guestId)
        .single();

      const currentReels = guest?.saved_reels || [];

      // Add if not already saved
      if (!currentReels.includes(reelUrl)) {
        currentReels.push(reelUrl);
      }

      // Update
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
