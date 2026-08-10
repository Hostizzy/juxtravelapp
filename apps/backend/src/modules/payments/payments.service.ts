import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../../supabase/supabase.service';
import { ConversationsService } from '../conversations/conversations.service';
import * as crypto from 'crypto';
import Razorpay from 'razorpay';

// Plain === on HMAC digests leaks timing info an attacker could use to guess
// the correct signature byte-by-byte. Both inputs are hex digests of the same
// expected length in normal operation; timingSafeEqual requires equal-length
// buffers, so length-check first (a length mismatch is safe to short-circuit —
// it doesn't leak content, only "wrong shape").
function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

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
    amount: number;
    bookingId: string;
    guestId: string;
    propertyName: string;
  }) {
    try {
      this.logger.log('[RAZORPAY] createOrder called');

      // ==== FIX 1: SERVER-SIDE PRICE VALIDATION ====
      // Fetch booking from DB to get REAL price
      const { data: booking, error: bookingErr } = await this.supabaseService.admin
        .from('bookings')
        .select('id, property_id, check_in, check_out, total_amount, guest_id, status')
        .eq('id', params.bookingId)
        .single();

      if (bookingErr || !booking) {
        this.logger.error(`[RAZORPAY] Booking not found: ${params.bookingId}`);
        throw new BadRequestException('Booking not found');
      }

      // Verify guestId matches
      if (booking.guest_id !== params.guestId) {
        this.logger.error(`[RAZORPAY] Guest ID mismatch`);
        throw new BadRequestException('Unauthorized booking access');
      }

      // Block re-ordering a booking that's already confirmed/completed — the update
      // below would otherwise demote it back to 'pending' and overwrite payment_id,
      // severing the link to the real payment.
      if (booking.status === 'confirmed' || booking.status === 'completed') {
        throw new BadRequestException('This booking is already paid');
      }

      // Fetch property to recompute price
      const { data: property } = await this.supabaseService.admin
        .from('properties')
        .select('price_per_night, weekend_price')
        .eq('id', booking.property_id)
        .single();

      if (!property) {
        throw new BadRequestException('Property not found');
      }

      // Recompute total from server data
      const checkIn = new Date(booking.check_in);
      const checkOut = new Date(booking.check_out);
      const nights = Math.max(
        1,
        Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)),
      );

      const pricePerNight = property.price_per_night ?? 0;
      const weekendPrice = property.weekend_price ?? pricePerNight;

      // 'YYYY-MM-DD' strings parse as UTC midnight (new Date(...)) — use the UTC
      // getters/setters throughout, not local ones, so a server not running in
      // UTC (or negative-UTC-offset users) can't shift which calendar day (and
      // therefore weekend/weekday) this lands on.
      let subtotal = 0;
      for (let i = 0; i < nights; i++) {
        const d = new Date(checkIn);
        d.setUTCDate(d.getUTCDate() + i);
        const day = d.getUTCDay();
        subtotal += day === 5 || day === 6 ? weekendPrice : pricePerNight;
      }

      const serviceFee = Math.round(subtotal * 0.1);
      const serverCalculatedTotal = subtotal + serviceFee;

      // Validate client amount (allow small tolerance for rounding)
      if (Math.abs(params.amount - serverCalculatedTotal) > 10) {
        this.logger.error(
          `[RAZORPAY] Price mismatch! Client: ${params.amount}, Server: ${serverCalculatedTotal}`,
        );
        throw new BadRequestException(
          `Invalid amount. Expected ₹${serverCalculatedTotal}, received ₹${params.amount}`,
        );
      }

      // Use SERVER calculated amount, not client amount
      const finalAmount = serverCalculatedTotal;
      this.logger.log(`[RAZORPAY] Server-verified amount: ₹${finalAmount}`);

      // ==== FIX 2: NO MOCK FALLBACK IN PRODUCTION ====
      const keyId =
        this.configService.get<string>('RAZORPAY_KEY_ID') ??
        this.configService.get<string>('razorpay.keyId') ??
        '';
      const keySecret =
        this.configService.get<string>('RAZORPAY_KEY_SECRET') ??
        this.configService.get<string>('razorpay.keySecret') ??
        '';

      if (!keyId || !keySecret || !this.razorpay) {
        if (process.env.NODE_ENV === 'production') {
          this.logger.error('[RAZORPAY] ❌ Credentials missing in PRODUCTION');
          throw new BadRequestException('Payment service unavailable');
        }

        // Development only - mock flow
        this.logger.warn('[RAZORPAY] Using mock flow (DEV ONLY)');
        return {
          orderId: 'MOCK_ORDER_' + Date.now(),
          amount: finalAmount * 100,
          currency: 'INR',
          keyId: '',
          isMock: true,
        };
      }

      // Convert to paise using SERVER calculated amount
      const amountInPaise = Math.round(finalAmount * 100);

      const orderPayload = {
        amount: amountInPaise,
        currency: 'INR',
        receipt: `bk_${params.bookingId.slice(0, 30)}`,
        notes: {
          bookingId: params.bookingId,
          guestId: params.guestId,
          propertyName: params.propertyName,
          serverAmount: String(finalAmount),
        },
      };

      this.logger.log('[RAZORPAY] Calling Razorpay API...');
      const order = await this.razorpay.orders.create(orderPayload);

      // Update booking with real total_amount (in case client sent wrong)
      await this.supabaseService.admin
        .from('bookings')
        .update({
          payment_id: order.id as string,
          total_amount: finalAmount,
          status: 'pending',
        })
        .eq('id', params.bookingId)
        .eq('guest_id', params.guestId);

      return {
        orderId: order.id as string,
        amount: order.amount as number,
        currency: order.currency as string,
        keyId,
        isMock: false,
      };
    } catch (error: any) {
      this.logger.error('[RAZORPAY] createOrder failed', error);
      throw error;
    }
  }

  async verifyPaymentSignature(
    params: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
      bookingId: string;
    },
    callerId: string,
  ): Promise<{ verified: boolean }> {
    // Ownership check: caller must be the guest who owns this booking
    const { data: booking } = await this.supabaseService.admin
      .from('bookings')
      .select('guest_id, host_id, property_id, status')
      .eq('id', params.bookingId)
      .maybeSingle();

    if (!booking || booking.guest_id !== callerId) {
      this.logger.warn(`[RAZORPAY] Verify rejected: booking ${params.bookingId} not owned by ${callerId}`);
      return { verified: false };
    }

    // Idempotency: already confirmed (e.g. webhook beat us to it) — nothing to do.
    if (booking.status === 'confirmed') {
      return { verified: true };
    }

    const keySecret =
      this.configService.get<string>('RAZORPAY_KEY_SECRET') ??
      this.configService.get<string>('razorpay.keySecret') ??
      '';

    if (!keySecret) {
      this.logger.error('[RAZORPAY] No secret for verification');
      return { verified: false };
    }

    const body = `${params.razorpay_order_id}|${params.razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(body)
      .digest('hex');

    const verified = safeCompare(expectedSignature, params.razorpay_signature);

    if (verified) {
      // Update booking to confirmed — only from pending, so a concurrent webhook
      // hit can't double-process (also guards against replaying this call).
      const { data: updated } = await this.supabaseService.admin
        .from('bookings')
        .update({
          status: 'confirmed',
          payment_id: params.razorpay_payment_id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', params.bookingId)
        .eq('status', 'pending')
        .select('id, property_id, host_id')
        .maybeSingle();

      this.logger.log(`[RAZORPAY] ✅ Signature verified for booking ${params.bookingId}`);

      if (updated) {
        const { data: property } = await this.supabaseService.admin
          .from('properties')
          .select('name')
          .eq('id', updated.property_id)
          .single();

        this.conversationsService
          .createForBooking(
            updated.id,
            callerId,
            updated.host_id,
            updated.property_id,
            property?.name ?? 'the property',
          )
          .catch((err: unknown) => {
            this.logger.error('[RAZORPAY] Failed to auto-create conversation', err);
          });
      }
    }

    return { verified };
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

    return safeCompare(expectedSignature, signature);
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

    // Update booking status to confirmed — only from pending, so a retried/duplicate
    // webhook delivery (or a race with client-side verifyPaymentSignature) is a no-op.
    const { data: booking, error } = await this.supabaseService.admin
      .from('bookings')
      .update({
        status: 'confirmed',
        payment_id: entity?.id as string,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId)
      .eq('status', 'pending')
      .select('*, property:properties(name)')
      .maybeSingle();

    if (error) {
      this.logger.error('[RAZORPAY_SERVICE] ❌ Failed to update booking status:', error.message);
      return;
    }

    if (!booking) {
      this.logger.log(`[RAZORPAY_SERVICE] Booking ${bookingId} already processed, skipping (idempotent)`);
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

    // Guard on status='pending' like handlePaymentCaptured does — Razorpay can
    // deliver payment.failed (from a retried card) after payment.captured already
    // confirmed the booking on a later attempt; without this an already-paid
    // booking could be cancelled by a stale failure event.
    const { data: updated } = await this.supabaseService.admin
      .from('bookings')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId)
      .eq('status', 'pending')
      .select('id')
      .maybeSingle();

    if (updated) {
      this.logger.log(`[RAZORPAY_SERVICE] Payment failed, booking cancelled: ${bookingId}`);
    } else {
      this.logger.log(`[RAZORPAY_SERVICE] Payment failed event for ${bookingId} ignored — not in pending state`);
    }
  }

  private async handleRefundCreated(
    payload: Record<string, unknown>
  ): Promise<void> {
    const refund = payload.refund as Record<string, unknown> | undefined;
    const entity = refund?.entity as Record<string, unknown> | undefined;
    const paymentId = entity?.payment_id as string | undefined;
    const refundAmountPaise = (entity?.amount as number | undefined) ?? 0;
    const refundAmountRupees = refundAmountPaise / 100;

    this.logger.log(`[RAZORPAY_SERVICE] handleRefundCreated - paymentId: ${paymentId}, amount: ₹${refundAmountRupees}`);

    if (!paymentId) return;

    const { data: booking } = await this.supabaseService.admin
      .from('bookings')
      .select('id, total_amount, status')
      .eq('payment_id', paymentId)
      .maybeSingle();

    if (!booking) {
      this.logger.warn(`[RAZORPAY_SERVICE] Refund event received for unknown paymentId: ${paymentId}`);
      return;
    }

    // Record refund details
    try {
      await this.supabaseService.admin
        .from('refunds')
        .insert({
          booking_id: booking.id,
          payment_id: paymentId,
          amount: refundAmountRupees,
          created_at: new Date().toISOString(),
        });
    } catch (err: any) {
      this.logger.warn(`[RAZORPAY_SERVICE] Notice: could not record into refunds table: ${err?.message}`);
    }

    // Only set status to cancelled if refund amount equals or exceeds full booking total amount
    const isFullRefund = refundAmountRupees >= (booking.total_amount ?? 0);

    if (isFullRefund) {
      await this.supabaseService.admin
        .from('bookings')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString(),
        })
        .eq('id', booking.id);

      this.logger.log(`[RAZORPAY_SERVICE] Full refund of ₹${refundAmountRupees} processed. Booking ${booking.id} set to cancelled.`);
    } else {
      this.logger.log(
        `[RAZORPAY_SERVICE] Partial refund of ₹${refundAmountRupees} (total: ₹${booking.total_amount}) recorded. Booking ${booking.id} status unchanged.`,
      );
    }
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
