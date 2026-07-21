import {
  Controller, Get, Post,
  Query, Body, UseGuards,
  Param, Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { InstagramService } from './instagram.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';

@Controller('instagram')
export class InstagramController {
  constructor(
    private instagramService: InstagramService
  ) {}

  // Get OAuth URL (protected)
  @Get('auth-url')
  @UseGuards(JwtAuthGuard)
  async getAuthUrl(
    @CurrentUser() payload: JwtPayload,
    @Query('propertyId') propertyId?: string,
  ) {
    const url = this.instagramService.getOAuthUrl(payload.sub, propertyId);
    return { url };
  }

  // OAuth callback - REDIRECTS to mobile app
  @Get('callback')
  async handleCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: Response,
  ) {
    console.log('[INSTAGRAM_CALLBACK] 1️⃣ Callback received');
    console.log(`[INSTAGRAM_CALLBACK] - code: ${code ? '✅ EXISTS' : '❌ MISSING'}`);
    console.log(`[INSTAGRAM_CALLBACK] - state: ${state ? '✅ EXISTS' : '❌ MISSING'}`);

    try {
      // Parse state
      const decoded = JSON.parse(Buffer.from(state, 'base64').toString());
      const { hostId, propertyId } = decoded;
      
      console.log(`[INSTAGRAM_CALLBACK] 2️⃣ State parsed`);
      console.log(`[INSTAGRAM_CALLBACK] - hostId: ${hostId}`);
      console.log(`[INSTAGRAM_CALLBACK] - propertyId: ${propertyId || 'NOT PROVIDED'}`);

      // Exchange code for token
      console.log(`[INSTAGRAM_CALLBACK] 3️⃣ Exchanging code for token`);
      await this.instagramService.exchangeCodeForToken(code, hostId, propertyId);
      
      console.log(`[INSTAGRAM_CALLBACK] ✅ SUCCESS - Redirecting to app`);
      
      // Redirect back to mobile app with success
      return res.redirect(
        `juxtravel://instagram-callback?status=success&propertyId=${propertyId || ''}`
      );

    } catch (error: any) {
      console.log(`[INSTAGRAM_CALLBACK] ❌ ERROR:`, error?.message);
      
      // Redirect back to app with error
      return res.redirect(
        `juxtravel://instagram-callback?status=error&message=${encodeURIComponent(error?.message ?? 'Unknown error')}`
      );
    }
  }

  // Get randomized reels for Discover (no auth needed for public discovery)
  @Get('reels/randomized')
  async getRandomizedReels(
    @Query('limit') limit: string = '20',
    @Query('offset') offset: string = '0',
  ) {
    const limitNum = Math.min(parseInt(limit) || 20, 100); // Max 100 per request
    const offsetNum = parseInt(offset) || 0;
    return this.instagramService.getRandomizedReels(limitNum, offsetNum);
  }

  // Save reel to guest profile
  @Post('save-reel')
  @UseGuards(JwtAuthGuard)
  async saveReel(
    @CurrentUser() payload: JwtPayload,
    @Body() body: { reelUrl: string },
  ) {
    return this.instagramService.saveReelToGuest(payload.sub, body.reelUrl);
  }

  // Get host reels
  @Get('reels')
  @UseGuards(JwtAuthGuard)
  async getReels(
    @CurrentUser() payload: JwtPayload,
  ) {
    return this.instagramService.fetchHostReels(payload.sub);
  }

  // Get connection status
  @Get('status')
  @UseGuards(JwtAuthGuard)
  async getStatus(
    @CurrentUser() payload: JwtPayload,
  ) {
    return this.instagramService.getConnectionStatus(payload.sub);
  }

  // Save selected reels to property
  @Post('save-reels')
  @UseGuards(JwtAuthGuard)
  async saveReels(
    @CurrentUser() payload: JwtPayload,
    @Body() body: { 
      propertyId: string; 
      reelUrls: string[] 
    },
  ) {
    return this.instagramService.saveReelsToProperty(
      body.propertyId,
      payload.sub,
      body.reelUrls
    );
  }

  // Disconnect Instagram
  @Post('disconnect')
  @UseGuards(JwtAuthGuard)
  async disconnect(
    @CurrentUser() payload: JwtPayload,
  ) {
    return this.instagramService.disconnectInstagram(payload.sub);
  }
}
