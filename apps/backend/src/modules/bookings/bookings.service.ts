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
      status?: 'pending' | 'confirmed';
      paymentId?: string;
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
    const status = body.status ?? 'confirmed';
    const paymentId = status === 'pending' ? null : (body.paymentId ?? 'TEST_DIRECT_' + Date.now());

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
          status,
          payment_id: paymentId,
        })
        .select()
        .single();

    if (error) {
      this.logger.error('Failed to create booking row', error);
      throw new Error('Failed to create booking');
    }

    // Auto-create a conversation thread between guest and host only if confirmed
    if (status === 'confirmed') {
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
    }

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

    // Verify this booking belongs to the requesting user (guest OR host)
    if (booking.guest_id !== userId && booking.host_id !== userId) {
      throw new UnauthorizedException('Not your booking');
    }

    const [{ data: property }, { data: host }, { data: guest }] = await Promise.all([
      this.supabaseService.admin
        .from('properties')
        .select('name, photos, location, host_id')
        .eq('id', booking.property_id)
        .single(),
      this.supabaseService.admin
        .from('users')
        .select('name')
        .eq('id', booking.host_id)
        .single(),
      this.supabaseService.admin
        .from('users')
        .select('name')
        .eq('id', booking.guest_id)
        .single(),
    ]);

    return {
      ...booking,
      property: property ?? null,
      host: host ? { name: host.name, phone: null } : null,
      guest: guest ? { name: guest.name, phone: null } : null,
    };
  }

  async getHostBookings(hostId: string) {
    const { data: bookings, error } = await this.supabaseService.admin
        .from('bookings')
        .select('*')
        .eq('host_id', hostId)
        .order('created_at', { ascending: false });

    if (error || !bookings) return [];
    if (bookings.length === 0) return [];

    const guestIds = [...new Set(bookings.map((b) => b.guest_id))];
    const propertyIds = [...new Set(bookings.map((b) => b.property_id))];

    const [{ data: guests }, { data: properties }] = await Promise.all([
      this.supabaseService.admin
        .from('users')
        .select('id, name')
        .in('id', guestIds),
      this.supabaseService.admin
        .from('properties')
        .select('id, name, location')
        .in('id', propertyIds),
    ]);

    const guestMap = new Map((guests ?? []).map((g) => [g.id, g]));
    const propertyMap = new Map((properties ?? []).map((p) => [p.id, p]));

    return bookings.map((b) => ({
      ...b,
      guest: guestMap.get(b.guest_id) ?? null,
      property: propertyMap.get(b.property_id) ?? null,
    }));
  }

  async getHostEarnings(hostId: string) {
    const { data: bookings } = await this.supabaseService.admin
        .from('bookings')
        .select('host_payout, status, created_at')
        .eq('host_id', hostId)
        .in('status', ['confirmed', 'completed']);

    const total = (bookings ?? []).reduce(
      (sum, b) => sum + (b.host_payout ?? 0), 0
    );

    const now = new Date();
    const thisMonth = (bookings ?? [])
      .filter((b) => {
        const d = new Date(b.created_at);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((sum, b) => sum + (b.host_payout ?? 0), 0);

    const pending = (bookings ?? [])
      .filter((b) => b.status === 'confirmed')
      .reduce((sum, b) => sum + (b.host_payout ?? 0), 0);

    return { 
      totalEarnings: total, 
      thisMonth, 
      pendingPayout: pending 
    };
  }

  async getHostStats(hostId: string) {
    const { data: bookings } = await this.supabaseService.admin
        .from('bookings')
        .select('check_in, host_payout, status, created_at')
        .eq('host_id', hostId);

    const allTimeBookings = (bookings ?? []).length;

    const now = new Date();
    const checkInsThisMonth = (bookings ?? [])
      .filter((b) => {
        const d = new Date(b.check_in);
        return d.getMonth() === now.getMonth() && 
          d.getFullYear() === now.getFullYear() &&
          ['confirmed','completed'].includes(b.status);
      }).length;

    const earningsThisMonth = (bookings ?? [])
      .filter((b) => {
        const d = new Date(b.created_at);
        return d.getMonth() === now.getMonth() && 
          d.getFullYear() === now.getFullYear() &&
          ['confirmed','completed'].includes(b.status);
      })
      .reduce((sum, b) => sum + (b.host_payout ?? 0), 0);

    return { 
      allTimeBookings, 
      checkInsThisMonth, 
      earningsThisMonth 
    };
  }
}


