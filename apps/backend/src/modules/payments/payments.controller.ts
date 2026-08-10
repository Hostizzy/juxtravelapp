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
import type { Request, Response } from 'express';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';

import { CreateOrderDto } from './dto/create-order.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';

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
    @Body() dto: CreateOrderDto,
  ) {
    try {
      this.logger.log('💳 [RAZORPAY] 1️⃣ CREATE-ORDER received');
      this.logger.log(`[RAZORPAY] - userId: ${payload.sub}`);
      this.logger.log(`[RAZORPAY] - bookingId: ${dto.bookingId}`);
      this.logger.log(`[RAZORPAY] - amount: ${dto.amount} (rupees)`);
      this.logger.log(`[RAZORPAY] - propertyName: ${dto.propertyName}`);

      this.logger.log('[RAZORPAY] 2️⃣ Calling paymentsService.createOrder()');
      
      const order = await this.paymentsService.createOrder({
        amount: dto.amount,
        bookingId: dto.bookingId,
        guestId: payload.sub,
        propertyName: dto.propertyName,
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

  @Post('verify')
  @UseGuards(JwtAuthGuard)
  async verifyPayment(
    @CurrentUser() payload: JwtPayload,
    @Body() dto: VerifyPaymentDto,
  ) {
    return this.paymentsService.verifyPaymentSignature(dto, payload.sub);
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
    // orderId/bookingId flow into a juxtravel:// deep link — restrict to safe id chars.
    const idPattern = /^[a-zA-Z0-9_-]+$/;
    if (!orderId || !idPattern.test(orderId) || !bookingId || !idPattern.test(bookingId)) {
      throw new BadRequestException('Invalid orderId or bookingId');
    }

    // Every other value is untrusted user input rendered inside an inline <script>.
    // JSON.stringify produces a safe JS literal (escapes quotes, backslashes, </script>).
    const j = (v: unknown) => JSON.stringify(String(v ?? '')).replace(/</g, '\\u003c');
    const safeKeyId = j(keyId);
    const safeAmount = j(amount);
    const safeCurrency = j(currency);
    const safeOrderId = j(orderId);
    const safeBookingId = j(bookingId);
    const safeName = j(name);
    const safeEmail = j(email);
    const safeContact = j(contact);
    const safePropertyName = j(propertyName);

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
  <title>JuxTravel Payment</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      background: #FAF8F4;
      padding: 20px;
    }
    .container {
      text-align: center;
      max-width: 400px;
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
    h2 { color: #1A1F1E; margin-bottom: 8px; font-size: 18px; }
    p { color: #6B7370; font-size: 14px; line-height: 20px; }
    .error { color: #D4704A; }
    .success { color: #1A6B5A; }
    .debug {
      background: #F0F0F0;
      padding: 10px;
      margin-top: 20px;
      font-size: 11px;
      text-align: left;
      border-radius: 4px;
      max-height: 200px;
      overflow-y: auto;
      font-family: monospace;
    }
    button {
      background: #1A6B5A;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 16px;
      cursor: pointer;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="container" id="container">
    <div class="spinner" id="spinner"></div>
    <h2 id="title">Loading Razorpay...</h2>
    <p id="message">Please wait</p>
    <div class="debug" id="debug">Loading Razorpay SDK...</div>
  </div>

  <script>
    // Debug helper
    function log(msg) {
      var debug = document.getElementById('debug');
      var time = new Date().toLocaleTimeString();
      debug.innerHTML += '<br>[' + time + '] ' + msg;
      debug.scrollTop = debug.scrollHeight;
      console.log(msg);
    }

    function showStatus(title, message, isError) {
      document.getElementById('spinner').style.display = 'none';
      document.getElementById('title').innerText = title;
      document.getElementById('title').className = isError ? 'error' : 'success';
      document.getElementById('message').innerText = message;
    }

    log('Page loaded');
    log('Loading Razorpay Checkout.js...');

    // Load Razorpay script with error handling
    var script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = false;
    
    script.onload = function() {
      log('✅ Razorpay SDK loaded');
      
      if (typeof Razorpay === 'undefined') {
        log('❌ Razorpay object undefined');
        showStatus('Failed to Load', 'Razorpay SDK not available', true);
        return;
      }

      try {
        log('Building options...');
        
        var options = {
          key: ${safeKeyId},
          amount: parseInt(${safeAmount}, 10),
          currency: ${safeCurrency},
          order_id: ${safeOrderId},
          name: 'JuxTravel',
          description: 'Booking for ' + ${safePropertyName},
          prefill: {
            name: ${safeName},
            email: ${safeEmail},
            contact: ${safeContact}
          },
          theme: { color: '#1A6B5A' },
          handler: function(response) {
            log('✅ Payment Success: ' + response.razorpay_payment_id);
            showStatus('✓ Payment Successful!', 'Redirecting to app...', false);
            setTimeout(function() {
              window.location.href = 'juxtravel://payment-success?bookingId=' + encodeURIComponent(${safeBookingId}) + '&paymentId=' + encodeURIComponent(response.razorpay_payment_id);
            }, 2000);
          },
          modal: {
            ondismiss: function() {
              log('Modal dismissed by user');
              showStatus('Payment Cancelled', 'Returning to app...', true);
              setTimeout(function() {
                window.location.href = 'juxtravel://payment-cancelled?bookingId=' + encodeURIComponent(${safeBookingId});
              }, 1000);
            }
          }
        };

        log('Options ready');
        log('Creating Razorpay instance...');

        var rzp = new Razorpay(options);

        rzp.on('payment.failed', function(response) {
          log('❌ Payment failed: ' + response.error.description);
          showStatus('✗ Payment Failed', response.error.description, true);
          setTimeout(function() {
            window.location.href = 'juxtravel://payment-failed?bookingId=' + encodeURIComponent(${safeBookingId}) + '&error=' + encodeURIComponent(response.error.description);
          }, 3000);
        });

        log('Opening Razorpay checkout modal...');
        rzp.open();
        log('rzp.open() called successfully');
        
      } catch (err) {
        log('❌ Error: ' + err.message);
        showStatus('Error', err.message, true);
      }
    };
    
    script.onerror = function(e) {
      log('❌ Failed to load Razorpay SDK from CDN');
      showStatus('Network Error', 'Failed to load Razorpay. Check internet connection.', true);
    };
    
    document.head.appendChild(script);
    log('Script tag added, waiting for load...');
  </script>
</body>
</html>
`;

    // ponytail: script-src stays 'unsafe-inline' because the checkout logic is one inline
    // <script> block; values are now JSON-encoded so injection isn't possible. Upgrade path:
    // move to a nonce-based CSP if this page grows external script includes.
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' https://checkout.razorpay.com; frame-src 'self' https://api.razorpay.com https://checkout.razorpay.com; img-src 'self' data: https://*.razorpay.com; style-src 'self' 'unsafe-inline';"
    );
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
      if (!req.rawBody) {
        this.logger.error('[RAZORPAY_WEBHOOK] ❌ Raw body missing from request');
        throw new BadRequestException('Raw body is missing');
      }
      const rawBody = req.rawBody.toString();
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
