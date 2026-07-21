import {
  Controller,
  Get,
  Post,
  Body,
  Headers,
  Req,
  Query,
  Res,
  Logger,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { Request, Response } from 'express';
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

  // Web Checkout (Opens Razorpay Checkout.js in WebBrowser / WebView)
  @Get('checkout')
  async serveCheckout(
    @Query('orderId') orderId: string,
    @Query('keyId') keyId: string,
    @Query('amount') amount: string,
    @Query('currency') currency: string,
    @Query('bookingId') bookingId: string,
    @Query('name') name: string,
    @Query('email') email: string,
    @Query('contact') contact: string,
    @Query('propertyName') propertyName: string,
    @Res() res: Response,
  ) {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>JuxTravel Payment</title>
  <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
  <style>
    body {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      background: #FAF8F4;
    }
    .loader {
      text-align: center;
    }
    .spinner {
      border: 4px solid #E8E2D9;
      border-top: 4px solid #1A6B5A;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    h2 { color: #1A1F1E; margin-bottom: 8px; }
    p { color: #6B7370; font-size: 14px; }
  </style>
</head>
<body>
  <div class="loader">
    <div class="spinner"></div>
    <h2>Opening Payment...</h2>
    <p>Please wait</p>
  </div>
  <script>
    const options = {
      key: '${keyId}',
      amount: '${amount}',
      currency: '${currency}',
      order_id: '${orderId}',
      name: 'JuxTravel',
      description: 'Booking for ${propertyName}',
      image: 'https://juxtravel.com/logo.png',
      prefill: {
        name: '${name}',
        email: '${email}',
        contact: '${contact}'
      },
      theme: {
        color: '#1A6B5A'
      },
      handler: function(response) {
        // Payment successful
        document.body.innerHTML = '<div class="loader"><h2 style="color:#1A6B5A;">✓ Payment Successful!</h2><p>Redirecting back to app...</p></div>';
        // Redirect to app via deep link
        setTimeout(function() {
          window.location.href = 'juxtravel://payment-success?bookingId=${bookingId}&paymentId=' + response.razorpay_payment_id;
        }, 2000);
      },
      modal: {
        ondismiss: function() {
          document.body.innerHTML = '<div class="loader"><h2>Payment Cancelled</h2><p>Returning to app...</p></div>';
          setTimeout(function() {
            window.location.href = 'juxtravel://payment-cancelled?bookingId=${bookingId}';
          }, 1000);
        }
      }
    };

    const rzp = new Razorpay(options);
    
    rzp.on('payment.failed', function(response) {
      document.body.innerHTML = '<div class="loader"><h2 style="color:#D4704A;">✗ Payment Failed</h2><p>' + response.error.description + '</p></div>';
      setTimeout(function() {
        window.location.href = 'juxtravel://payment-failed?bookingId=${bookingId}&error=' + encodeURIComponent(response.error.description);
      }, 3000);
    });

    // Auto-open on page load
    window.addEventListener('load', function() {
      setTimeout(function() {
        rzp.open();
      }, 500);
    });
  </script>
</body>
</html>
  `;

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
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

  // Webhook GET health check (for browser testing / monitoring tools)
  @Get('webhook')
  getWebhookHealth() {
    return {
      status: 'ok',
      message: 'Razorpay webhook endpoint is active. Webhook events must be sent via HTTP POST.',
    };
  }
}
