import { Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { ConversationsService } from '../conversations/conversations.service';

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly conversationsService: ConversationsService,
  ) {}

  async createDirect(
    guestId: string,
    body: {
      propertyId: string;
      checkIn: string;
      checkOut: string;
      guests: number;
      totalAmount: number;
    }
  ) {
    const { data: property, error: propError } = await this.supabaseService.admin
        .from('properties')
        .select('host_id, name')
        .eq('id', body.propertyId)
        .single();

    if (propError || !property) {
      this.logger.error(`Property not found for booking: ${body.propertyId}`, propError);
      throw new Error('Property not found');
    }

    const serviceFee = Math.round(body.totalAmount * 0.1);

    const { data, error } = await this.supabaseService.admin
        .from('bookings')
        .insert({
          guest_id: guestId,
          host_id: property.host_id,
          property_id: body.propertyId,
          check_in: body.checkIn,
          check_out: body.checkOut,
          guests: body.guests,
          total_amount: body.totalAmount,
          service_fee: serviceFee,
          host_payout: body.totalAmount - serviceFee,
          status: 'confirmed', // skip pending/payment for now
          payment_id: 'TEST_DIRECT_' + Date.now(),
        })
        .select()
        .single();

    if (error) {
      this.logger.error('Failed to create booking row', error);
      throw new Error('Failed to create booking');
    }

    // Auto-create a conversation thread between guest and host
    this.conversationsService
      .createForBooking(
        data.id,
        guestId,
        property.host_id,
        body.propertyId,
        property.name ?? 'your property',
      )
      .catch((err: unknown) => {
        this.logger.error('Failed to auto-create conversation', err);
      });

    // FUTURE: persist points to a loyalty_points table
    // or a points column on users when that system is
    // built. For now, points are calculated client-side
    // as (confirmed/completed bookings count * 100).
    return data;
  }

  async getMyBookings(guestId: string) {
    const { data, error } = await this.supabaseService.admin
        .from('bookings')
        .select(`
          *,
          property:properties(
            name, photos, location, price_per_night
          )
        `)
        .eq('guest_id', guestId)
        .order('created_at', { ascending: false });

    if (error) {
      this.logger.error(`Failed to fetch bookings for guest: ${guestId}`, error);
      return [];
    }

    return data ?? [];
  }

  async getBookingById(
    bookingId: string,
    userId: string
  ) {
    const { data: booking, error } = await this.supabaseService.admin
        .from('bookings')
        .select('*')
        .eq('id', bookingId)
        .single();

    if (error || !booking) {
      throw new NotFoundException('Booking not found');
    }

    // Verify this booking belongs to the requesting user
    if (booking.guest_id !== userId) {
      throw new UnauthorizedException('Not your booking');
    }

    const [{ data: property }, { data: host }] = await Promise.all([
      this.supabaseService.admin
        .from('properties')
        .select('name, photos, location, host_id')
        .eq('id', booking.property_id)
        .single(),
      this.supabaseService.admin
        .from('users')
        .select('name, phone')
        .eq('id', booking.host_id)
        .single(),
    ]);

    return {
      ...booking,
      property: property ?? null,
      host: host ?? null,
    };
  }
}

