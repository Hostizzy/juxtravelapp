import {
  Controller, Get, Post,
  Query, Body, UseGuards,
  Param,
} from '@nestjs/common';
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

  // OAuth callback (no auth - Instagram redirects here)
  @Get('callback')
  async handleCallback(
    @Query('code') code: string,
    @Query('state') state: string,
  ) {
    const { hostId, propertyId } = JSON.parse(
      Buffer.from(state, 'base64').toString()
    );
    
    await this.instagramService.exchangeCodeForToken(code, hostId, propertyId);

    // Redirect to app deep link
    return { 
      success: true,
      message: 'Instagram connected! Return to app.'
    };
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
