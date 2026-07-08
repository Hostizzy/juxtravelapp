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
    const keyId = this.configService.get<string>('razorpay.keyId') ?? '';
    const keySecret = this.configService.get<string>('razorpay.keySecret') ?? '';

    if (keyId && keySecret) {
      this.razorpay = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });
    } else {
      this.logger.warn('Razorpay keys not configured. Falling back to Mock Payment Flow.');
    }
  }

  // Create Razorpay order (called before payment)
  async createOrder(params: {
    amount: number; // in rupees
    bookingId: string;
    guestId: string;
    propertyName: string;
  }) {
    const keyId = this.configService.get<string>('razorpay.keyId') ?? '';

    // Fallback: If Razorpay keys are not configured, perform mock payment confirmation
    if (!this.razorpay) {
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

    // Real Razorpay integration
    const order = await this.razorpay.orders.create({
      amount: params.amount * 100, // convert to paise
      currency: 'INR',
      receipt: `booking_${params.bookingId}`,
      notes: {
        bookingId: params.bookingId,
        guestId: params.guestId,
        propertyName: params.propertyName,
      },
    });

    this.logger.log(
      `Razorpay order created: ${order.id} for booking ${params.bookingId}`
    );

    return {
      orderId: order.id as string,
      amount: order.amount as number,
      currency: order.currency as string,
      keyId,
      isMock: false,
    };
  }

  // Verify webhook signature
  verifyWebhookSignature(
    body: string,
    signature: string
  ): boolean {
    const webhookSecret = this.configService.get<string>('razorpay.webhookSecret') ?? '';

    if (!webhookSecret) {
      this.logger.error('RAZORPAY_WEBHOOK_SECRET is not set in environment.');
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
    this.logger.log(`Webhook received: ${event}`);

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
        this.logger.log(`Unhandled webhook event: ${event}`);
    }
  }

  private async handlePaymentCaptured(
    payload: Record<string, unknown>
  ): Promise<void> {
    const payment = payload.payment as Record<string, unknown> | undefined;
    const entity = payment?.entity as Record<string, unknown> | undefined;
    const notes = entity?.notes as Record<string, string> | undefined;
    const bookingId = notes?.bookingId;

    if (!bookingId) {
      this.logger.error('No bookingId in payment notes');
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
      this.logger.error('Failed to update booking', error);
      return;
    }

    this.logger.log(`Booking confirmed: ${bookingId}`);

    // Auto-create conversation with welcome message
    try {
      const { data: property } = await this.supabaseService.admin
        .from('properties')
        .select('name, host_id')
        .eq('id', booking.property_id)
        .single();

      await this.conversationsService.createForBooking(
        bookingId,
        booking.guest_id,
        property?.host_id ?? '',
        booking.property_id,
        property?.name ?? 'the property',
      );
    } catch (convError) {
      this.logger.error('Failed to create conversation', convError);
      // Non-blocking — booking is confirmed even if conversation creation fails
    }
  }

  private async handlePaymentFailed(
    payload: Record<string, unknown>
  ): Promise<void> {
    const payment = payload.payment as Record<string, unknown> | undefined;
    const entity = payment?.entity as Record<string, unknown> | undefined;
    const notes = entity?.notes as Record<string, string> | undefined;
    const bookingId = notes?.bookingId;

    if (!bookingId) return;

    await this.supabaseService.admin
      .from('bookings')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId);

    this.logger.log(`Payment failed, booking cancelled: ${bookingId}`);
  }

  private async handleRefundCreated(
    payload: Record<string, unknown>
  ): Promise<void> {
    const refund = payload.refund as Record<string, unknown> | undefined;
    const entity = refund?.entity as Record<string, unknown> | undefined;
    const paymentId = entity?.payment_id as string | undefined;

    if (!paymentId) return;

    await this.supabaseService.admin
      .from('bookings')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('payment_id', paymentId);

    this.logger.log(`Refund created for payment: ${paymentId}`);
  }

  private async handlePaymentAuthorized(
    payload: Record<string, unknown>
  ): Promise<void> {
    const payment = payload.payment as Record<string, unknown> | undefined;
    const entity = payment?.entity as Record<string, unknown> | undefined;
    const notes = entity?.notes as Record<string, string> | undefined;
    const bookingId = notes?.bookingId;

    if (!bookingId) {
      this.logger.warn('payment.authorized: No bookingId in notes');
      return;
    }

    // Just log for now — actual confirmation happens on payment.captured
    // (authorized doesn't mean money received yet)
    this.logger.log(
      `Payment authorized for booking: ${bookingId}, ` +
        `payment ID: ${entity?.id} — waiting for capture`
    );

    // If auto-capture is disabled/OFF, capture the payment manually
    const autoCaptureEnabled =
      this.configService.get<string>('razorpay.autoCapture') !== 'false';
    if (!autoCaptureEnabled) {
      this.logger.log(
        `Auto-capture is disabled. Capturing payment manually for booking: ${bookingId}`
      );
      const paymentId = entity?.id as string | undefined;
      const amount = entity?.amount as number | undefined;
      if (paymentId && amount !== undefined) {
        await this.capturePayment(paymentId, amount / 100);
      } else {
        this.logger.error(
          'payment.authorized: Cannot capture payment manually due to missing payment ID or amount'
        );
      }
    }
  }

  private async capturePayment(
    paymentId: string,
    amount: number
  ): Promise<void> {
    if (!this.razorpay) {
      this.logger.error('Razorpay is not configured, cannot capture payment');
      return;
    }
    try {
      await this.razorpay.payments.capture(
        paymentId,
        amount * 100, // paise
        'INR'
      );
      this.logger.log(`Payment captured manually: ${paymentId}`);
    } catch (error) {
      this.logger.error(
        `Failed to capture payment: ${paymentId}`,
        error
      );
    }
  }
}
