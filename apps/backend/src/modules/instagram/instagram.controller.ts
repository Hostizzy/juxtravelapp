import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  UseGuards,
  Res,
  BadRequestException,
} from '@nestjs/common';
import type { Response } from 'express';
import { InstagramService } from './instagram.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { SaveReelDto } from './dto/save-reel.dto';
import { SaveReelsDto } from './dto/save-reels.dto';

@Controller('instagram')
export class InstagramController {
  constructor(private instagramService: InstagramService) {}

  // Get OAuth URL (protected)
  @Get('auth-url')
  @UseGuards(JwtAuthGuard)
  async getAuthUrl(
    @CurrentUser() payload: JwtPayload,
    @Query('propertyId') propertyId?: string,
  ) {
    const url = await this.instagramService.getOAuthUrl(payload.sub, propertyId);
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

    try {
      if (!state) {
        throw new BadRequestException('State nonce missing');
      }

      // Verify state nonce and get hostId & propertyId securely
      const { hostId, propertyId } =
        await this.instagramService.verifyAndConsumeOAuthState(state);

      console.log(`[INSTAGRAM_CALLBACK] 2️⃣ State verified nonce successfully`);

      // Exchange code for token
      await this.instagramService.exchangeCodeForToken(code, hostId, propertyId);

      return res.redirect(
        `juxtravel://instagram-callback?status=success&propertyId=${propertyId || ''}`,
      );
    } catch (error: any) {
      console.log(`[INSTAGRAM_CALLBACK] ❌ ERROR:`, error?.message);

      return res.redirect(
        `juxtravel://instagram-callback?status=error&message=${encodeURIComponent(
          error?.message ?? 'Unknown error',
        )}`,
      );
    }
  }

  // Get randomized reels for Discover
  @Get('reels/randomized')
  async getRandomizedReels(
    @Query('limit') limit: string = '20',
    @Query('offset') offset: string = '0',
  ) {
    const limitNum = Math.min(parseInt(limit) || 20, 100);
    const offsetNum = parseInt(offset) || 0;
    return this.instagramService.getRandomizedReels(limitNum, offsetNum);
  }

  // Save reel to guest profile
  @Post('save-reel')
  @UseGuards(JwtAuthGuard)
  async saveReel(
    @CurrentUser() payload: JwtPayload,
    @Body() dto: SaveReelDto,
  ) {
    return this.instagramService.saveReelToGuest(payload.sub, dto.reelUrl);
  }

  // Get host reels
  @Get('reels')
  @UseGuards(JwtAuthGuard)
  async getReels(@CurrentUser() payload: JwtPayload) {
    return this.instagramService.fetchHostReels(payload.sub);
  }

  // Get connection status
  @Get('status')
  @UseGuards(JwtAuthGuard)
  async getStatus(@CurrentUser() payload: JwtPayload) {
    return this.instagramService.getConnectionStatus(payload.sub);
  }

  // Save selected reels to property
  @Post('save-reels')
  @UseGuards(JwtAuthGuard)
  async saveReels(
    @CurrentUser() payload: JwtPayload,
    @Body() dto: SaveReelsDto,
  ) {
    return this.instagramService.saveReelsToProperty(
      dto.propertyId,
      payload.sub,
      dto.reelUrls,
    );
  }

  // Disconnect Instagram
  @Post('disconnect')
  @UseGuards(JwtAuthGuard)
  async disconnect(@CurrentUser() payload: JwtPayload) {
    return this.instagramService.disconnectInstagram(payload.sub);
  }
}
