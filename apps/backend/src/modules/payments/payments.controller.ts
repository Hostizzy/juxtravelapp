import {
  Controller,
  Post,
  Body,
  Headers,
  Req,
  Logger,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';

@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(
    private readonly paymentsService: PaymentsService
  ) {}

  // Create order (authenticated)
  @Post('create-order')
  @UseGuards(JwtAuthGuard)
  async createOrder(
    @CurrentUser() payload: JwtPayload,
    @Body() body: {
      amount: number;
      bookingId: string;
      propertyName: string;
    },
  ) {
    return this.paymentsService.createOrder({
      amount: body.amount,
      bookingId: body.bookingId,
      guestId: payload.sub,
      propertyName: body.propertyName,
    });
  }

  // Webhook (NO auth — Razorpay calls this)
  @Post('webhook')
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-razorpay-signature') signature: string | undefined,
    @Body() body: { event?: string; payload?: Record<string, unknown> },
  ) {
    if (!signature) {
      this.logger.error('Webhook request missing x-razorpay-signature header');
      throw new BadRequestException('Missing signature');
    }

    // Verify signature first
    const rawBody = req.rawBody?.toString() ?? JSON.stringify(body);

    const isValid = this.paymentsService.verifyWebhookSignature(rawBody, signature);

    if (!isValid) {
      this.logger.error('Invalid webhook signature');
      throw new BadRequestException('Invalid signature');
    }

    const event = body.event;
    const payload = body.payload;

    if (!event || !payload) {
      this.logger.error('Webhook payload is missing event or payload fields');
      throw new BadRequestException('Invalid payload structure');
    }

    await this.paymentsService.handleWebhook(event, payload);

    return { received: true };
  }
}
