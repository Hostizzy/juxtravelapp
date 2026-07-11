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
    try {
      this.logger.log('💳 [RAZORPAY] 1️⃣ CREATE-ORDER received');
      this.logger.log(`[RAZORPAY] - userId: ${payload.sub}`);
      this.logger.log(`[RAZORPAY] - bookingId: ${body.bookingId}`);
      this.logger.log(`[RAZORPAY] - amount: ${body.amount} (rupees)`);
      this.logger.log(`[RAZORPAY] - propertyName: ${body.propertyName}`);

      // Validate inputs
      if (!body.amount || body.amount <= 0) {
        this.logger.error('[RAZORPAY] ❌ Invalid amount:', body.amount);
        throw new BadRequestException('Amount must be greater than 0');
      }

      if (!body.bookingId) {
        this.logger.error('[RAZORPAY] ❌ Missing bookingId');
        throw new BadRequestException('bookingId is required');
      }

      this.logger.log('[RAZORPAY] 2️⃣ Calling paymentsService.createOrder()');
      
      const order = await this.paymentsService.createOrder({
        amount: body.amount,
        bookingId: body.bookingId,
        guestId: payload.sub,
        propertyName: body.propertyName,
      });

      this.logger.log('[RAZORPAY] 3️⃣ Order created successfully');
      this.logger.log(`[RAZORPAY] - orderId: ${order.orderId}`);
      this.logger.log(`[RAZORPAY] - amount: ${order.amount}`);

      return order;

    } catch (error: any) {
      this.logger.error('[RAZORPAY] ❌ createOrder failed:', error);
      this.logger.error(`[RAZORPAY] - Error message: ${error?.message}`);
      this.logger.error(`[RAZORPAY] - Error stack: ${error?.stack}`);
      throw error;
    }
  }

  // Webhook (NO auth — Razorpay calls this)
  @Post('webhook')
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-razorpay-signature') signature: string | undefined,
    @Body() body: { event?: string; payload?: Record<string, unknown> },
  ) {
    try {
      this.logger.log('[RAZORPAY_WEBHOOK] 1️⃣ Webhook received');
      this.logger.log(`[RAZORPAY_WEBHOOK] - Event: ${body?.event}`);
      this.logger.log(`[RAZORPAY_WEBHOOK] - Signature received: ${signature ? 'x-signature exists' : '❌ NO'}`);

      if (!signature) {
        this.logger.error('[RAZORPAY_WEBHOOK] ❌ Webhook request missing x-razorpay-signature header');
        throw new BadRequestException('Missing signature');
      }

      // Verify signature first
      this.logger.log('[RAZORPAY_WEBHOOK] 2️⃣ Verifying signature');
      const rawBody = req.rawBody?.toString() ?? JSON.stringify(body);
      const isValid = this.paymentsService.verifyWebhookSignature(rawBody, signature);
      this.logger.log(`[RAZORPAY_WEBHOOK] - Signature valid: ${isValid ? '✅ YES' : '❌ NO'}`);

      if (!isValid) {
        this.logger.error('[RAZORPAY_WEBHOOK] ❌ Invalid signature');
        throw new BadRequestException('Invalid signature');
      }

      const event = body.event;
      const payload = body.payload;

      if (!event || !payload) {
        this.logger.error('[RAZORPAY_WEBHOOK] ❌ Webhook payload is missing event or payload fields');
        throw new BadRequestException('Invalid payload structure');
      }

      // Handle event
      if (event === 'payment.captured') {
        const payment = payload.payment as Record<string, any> | undefined;
        const entity = payment?.entity as Record<string, any> | undefined;
        this.logger.log('[RAZORPAY_WEBHOOK] 3️⃣ Payment captured event detected');
        this.logger.log(`[RAZORPAY_WEBHOOK] - paymentId: ${entity?.id}`);
        this.logger.log(`[RAZORPAY_WEBHOOK] - orderId: ${entity?.order_id}`);
      }

      await this.paymentsService.handleWebhook(event, payload);

      this.logger.log('[RAZORPAY_WEBHOOK] ✅ Webhook processed successfully');
      return { received: true };

    } catch (error: any) {
      this.logger.error('[RAZORPAY_WEBHOOK] ❌ Webhook handling failed:', error);
      throw error;
    }
  }
}
