import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../../supabase/supabase.service';
import { ConversationsService } from '../conversations/conversations.service';
import * as crypto from 'crypto';
import Razorpay from 'razorpay';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private razorpay: Razorpay | null = null;

  constructor(
    private configService: ConfigService,
    private supabaseService: SupabaseService,
    private conversationsService: ConversationsService,
  ) {
    const keyId = this.configService.get<string>('RAZORPAY_KEY_ID') ??
                  this.configService.get<string>('razorpay.keyId') ?? '';
    const keySecret = this.configService.get<string>('RAZORPAY_KEY_SECRET') ??
                      this.configService.get<string>('razorpay.keySecret') ?? '';

    if (keyId && keySecret) {
      this.razorpay = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });
      this.logger.log('[RAZORPAY_SERVICE] Razorpay instance initialized successfully.');
    } else {
      this.logger.warn('[RAZORPAY_SERVICE] Razorpay keys not configured. Falling back to Mock Payment Flow.');
    }
  }

  // Create Razorpay order (called before payment)
  async createOrder(params: {
    amount: number; // in rupees
    bookingId: string;
    guestId: string;
    propertyName: string;
  }) {
    try {
      this.logger.log('[RAZORPAY_SERVICE] 1️⃣ createOrder() called');
      this.logger.log(`[RAZORPAY_SERVICE] - guestId: ${params.guestId}`);
      this.logger.log(`[RAZORPAY_SERVICE] - bookingId: ${params.bookingId}`);
      this.logger.log(`[RAZORPAY_SERVICE] - amount: ${params.amount} rupees`);
      this.logger.log(`[RAZORPAY_SERVICE] - propertyName: ${params.propertyName}`);

      // Check Razorpay config
      const keyId = this.configService.get<string>('RAZORPAY_KEY_ID') ??
                    this.configService.get<string>('razorpay.keyId') ?? '';
      const keySecret = this.configService.get<string>('RAZORPAY_KEY_SECRET') ??
                        this.configService.get<string>('razorpay.keySecret') ?? '';

      this.logger.log('[RAZORPAY_SERVICE] 2️⃣ Checking Razorpay credentials');
      this.logger.log(`[RAZORPAY_SERVICE] - KEY_ID exists: ${keyId ? '✅ YES' : '❌ NO'}`);
      this.logger.log(`[RAZORPAY_SERVICE] - KEY_SECRET exists: ${keySecret ? '✅ YES' : '❌ NO'}`);

      // Fallback: If Razorpay keys are not configured, perform mock payment confirmation
      if (!keyId || !keySecret || !this.razorpay) {
        this.logger.warn('[RAZORPAY_SERVICE] ⚠️ Razorpay credentials not configured. Falling back to Mock Payment Flow.');
        this.logger.log(`[MOCK] Confirming booking direct fallback: ${params.bookingId}`);

        // Update booking status to confirmed directly
        const { data: booking, error } = await this.supabaseService.admin
          .from('bookings')
          .update({
            status: 'confirmed',
            payment_id: 'MOCK_PAYMENT_' + Date.now(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', params.bookingId)
          .select('*, property:properties(name)')
          .single();

        if (error) {
          this.logger.error('[MOCK] Failed to confirm booking', error);
        } else if (booking) {
          this.logger.log(`[MOCK] Booking confirmed: ${params.bookingId}`);
          // Create conversation
          try {
            const { data: property } = await this.supabaseService.admin
              .from('properties')
              .select('name, host_id')
              .eq('id', booking.property_id)
              .single();

            await this.conversationsService.createForBooking(
              params.bookingId,
              booking.guest_id,
              property?.host_id ?? '',
              booking.property_id,
              property?.name ?? 'the property',
            );
          } catch (convError) {
            this.logger.error('[MOCK] Failed to create conversation', convError);
          }
        }

        return {
          orderId: 'MOCK_ORDER_' + Date.now(),
          amount: params.amount * 100,
          currency: 'INR',
          keyId: '',
          isMock: true,
        };
      }

      // Convert to paise
      const amountInPaise = Math.round(params.amount * 100);
      this.logger.log(`[RAZORPAY_SERVICE] 3️⃣ Amount conversion: ${params.amount} rupees → ${amountInPaise} paise`);

      // Prepare order payload
      const orderPayload = {
        amount: amountInPaise,
        currency: 'INR',
        receipt: `bk_${params.bookingId.slice(0, 30)}`,
        notes: {
          bookingId: params.bookingId,
          guestId: params.guestId,
          propertyName: params.propertyName,
        },
      };

      this.logger.log('[RAZORPAY_SERVICE] 4️⃣ Order payload ready:');
      this.logger.log(JSON.stringify(orderPayload, null, 2));

      this.logger.log('[RAZORPAY_SERVICE] 5️⃣ Calling Razorpay API...');

      // Call Razorpay API
      const order = await this.razorpay.orders.create(orderPayload);

      this.logger.log('[RAZORPAY_SERVICE] ✅ Order created successfully');
      this.logger.log(`[RAZORPAY_SERVICE] - orderId: ${order.id}`);
      this.logger.log(`[RAZORPAY_SERVICE] - amount: ${order.amount}`);
      this.logger.log(`[RAZORPAY_SERVICE] - status: ${order.status}`);

      // Save order to database
      this.logger.log('[RAZORPAY_SERVICE] 6️⃣ Saving order to database');

      const { error: dbError } = await this.supabaseService.admin
        .from('bookings')
        .update({
          payment_id: order.id as string,
          status: 'pending',
        })
        .eq('id', params.bookingId)
        .eq('guest_id', params.guestId);

      if (dbError) {
        this.logger.error('[RAZORPAY_SERVICE] ❌ Database save failed:', dbError.message);
        throw dbError;
      }

      this.logger.log('[RAZORPAY_SERVICE] ✅ Order saved to database');

      return {
        orderId: order.id as string,
        amount: order.amount as number,
        currency: order.currency as string,
        keyId,
        isMock: false,
      };

    } catch (error: any) {
      this.logger.error('[RAZORPAY_SERVICE] ❌ createOrder() failed');
      this.logger.error(`[RAZORPAY_SERVICE] - Error type: ${error?.constructor?.name}`);
      this.logger.error(`[RAZORPAY_SERVICE] - Error message: ${error?.message}`);
      this.logger.error(`[RAZORPAY_SERVICE] - Error details:`, error);
      throw error;
    }
  }

  // Verify webhook signature
  verifyWebhookSignature(
    body: string,
    signature: string
  ): boolean {
    const webhookSecret = this.configService.get<string>('RAZORPAY_WEBHOOK_SECRET') ??
                          this.configService.get<string>('razorpay.webhookSecret') ?? '';

    this.logger.log('[RAZORPAY_SERVICE] Webhook signature verification started');
    this.logger.log(`[RAZORPAY_SERVICE] - WEBHOOK_SECRET exists: ${webhookSecret ? '✅ YES' : '❌ NO'}`);

    if (!webhookSecret) {
      this.logger.error('[RAZORPAY_SERVICE] RAZORPAY_WEBHOOK_SECRET is not set in environment.');
      return false;
    }

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(body)
      .digest('hex');

    return expectedSignature === signature;
  }

  // Handle webhook events
  async handleWebhook(
    event: string,
    payload: Record<string, unknown>
  ): Promise<void> {
    this.logger.log(`[RAZORPAY_SERVICE] handleWebhook: ${event}`);

    switch (event) {
      case 'payment.authorized':
        await this.handlePaymentAuthorized(payload);
        break;
      case 'payment.captured':
        await this.handlePaymentCaptured(payload);
        break;
      case 'payment.failed':
        await this.handlePaymentFailed(payload);
        break;
      case 'refund.created':
        await this.handleRefundCreated(payload);
        break;
      default:
        this.logger.log(`[RAZORPAY_SERVICE] Unhandled webhook event: ${event}`);
    }
  }

  private async handlePaymentCaptured(
    payload: Record<string, unknown>
  ): Promise<void> {
    const payment = payload.payment as Record<string, unknown> | undefined;
    const entity = payment?.entity as Record<string, unknown> | undefined;
    const notes = entity?.notes as Record<string, string> | undefined;
    const bookingId = notes?.bookingId;

    this.logger.log(`[RAZORPAY_SERVICE] handlePaymentCaptured - bookingId: ${bookingId}`);

    if (!bookingId) {
      this.logger.error('[RAZORPAY_SERVICE] ❌ No bookingId in payment notes');
      return;
    }

    // Update booking status to confirmed
    const { data: booking, error } = await this.supabaseService.admin
      .from('bookings')
      .update({
        status: 'confirmed',
        payment_id: entity?.id as string,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId)
      .select('*, property:properties(name)')
      .single();

    if (error) {
      this.logger.error('[RAZORPAY_SERVICE] ❌ Failed to update booking status:', error.message);
      return;
    }

    this.logger.log(`[RAZORPAY_SERVICE] ✅ Booking confirmed: ${bookingId}`);

    // Auto-create conversation with welcome message
    try {
      const { data: property } = await this.supabaseService.admin
        .from('properties')
        .select('name, host_id')
        .eq('id', booking.property_id)
        .single();

      this.logger.log(`[RAZORPAY_SERVICE] Creating chat room for booking: ${bookingId}`);
      await this.conversationsService.createForBooking(
        bookingId,
        booking.guest_id,
        property?.host_id ?? '',
        booking.property_id,
        property?.name ?? 'the property',
      );
      this.logger.log(`[RAZORPAY_SERVICE] ✅ Conversation space created successfully`);
    } catch (convError) {
      this.logger.error('[RAZORPAY_SERVICE] ❌ Failed to create conversation:', convError);
    }
  }

  private async handlePaymentFailed(
    payload: Record<string, unknown>
  ): Promise<void> {
    const payment = payload.payment as Record<string, unknown> | undefined;
    const entity = payment?.entity as Record<string, unknown> | undefined;
    const notes = entity?.notes as Record<string, string> | undefined;
    const bookingId = notes?.bookingId;

    this.logger.log(`[RAZORPAY_SERVICE] handlePaymentFailed - bookingId: ${bookingId}`);

    if (!bookingId) return;

    await this.supabaseService.admin
      .from('bookings')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId);

    this.logger.log(`[RAZORPAY_SERVICE] Payment failed, booking cancelled: ${bookingId}`);
  }

  private async handleRefundCreated(
    payload: Record<string, unknown>
  ): Promise<void> {
    const refund = payload.refund as Record<string, unknown> | undefined;
    const entity = refund?.entity as Record<string, unknown> | undefined;
    const paymentId = entity?.payment_id as string | undefined;

    this.logger.log(`[RAZORPAY_SERVICE] handleRefundCreated - paymentId: ${paymentId}`);

    if (!paymentId) return;

    await this.supabaseService.admin
      .from('bookings')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('payment_id', paymentId);

    this.logger.log(`[RAZORPAY_SERVICE] Refund created for payment: ${paymentId}`);
  }

  private async handlePaymentAuthorized(
    payload: Record<string, unknown>
  ): Promise<void> {
    const payment = payload.payment as Record<string, unknown> | undefined;
    const entity = payment?.entity as Record<string, unknown> | undefined;
    const notes = entity?.notes as Record<string, string> | undefined;
    const bookingId = notes?.bookingId;

    if (!bookingId) {
      this.logger.warn('[RAZORPAY_SERVICE] payment.authorized: No bookingId in notes');
      return;
    }

    this.logger.log(
      `[RAZORPAY_SERVICE] Payment authorized for booking: ${bookingId}, ` +
        `payment ID: ${entity?.id} — waiting for capture`
    );

    // If auto-capture is disabled/OFF, capture the payment manually
    const autoCaptureEnabled =
      this.configService.get<string>('RAZORPAY_AUTO_CAPTURE') !== 'false' &&
      this.configService.get<string>('razorpay.autoCapture') !== 'false';

    if (!autoCaptureEnabled) {
      this.logger.log(
        `[RAZORPAY_SERVICE] Auto-capture is disabled. Capturing payment manually for booking: ${bookingId}`
      );
      const paymentId = entity?.id as string | undefined;
      const amount = entity?.amount as number | undefined;
      if (paymentId && amount !== undefined) {
        await this.capturePayment(paymentId, amount / 100);
      } else {
        this.logger.error(
          '[RAZORPAY_SERVICE] payment.authorized: Cannot capture payment manually due to missing payment ID or amount'
        );
      }
    }
  }

  private async capturePayment(
    paymentId: string,
    amount: number
  ): Promise<void> {
    if (!this.razorpay) {
      this.logger.error('[RAZORPAY_SERVICE] Razorpay is not configured, cannot capture payment');
      return;
    }
    try {
      await this.razorpay.payments.capture(
        paymentId,
        amount * 100, // paise
        'INR'
      );
      this.logger.log(`[RAZORPAY_SERVICE] Payment captured manually: ${paymentId}`);
    } catch (error) {
      this.logger.error(
        `[RAZORPAY_SERVICE] Failed to capture payment: ${paymentId}`,
        error
      );
    }
  }
}
