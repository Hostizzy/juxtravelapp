import { Injectable, Logger, NotFoundException, UnauthorizedException, BadRequestException } from '@nestjs/common';
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
      status?: string;
      paymentId?: string;
    }
  ) {
    // Gate 1: Guest KYC gate on booking creation
    const { data: verification } = await this.supabaseService.admin
      .from('guest_verifications')
      .select('status')
      .eq('user_id', guestId)
      .maybeSingle();

    if (!verification || verification.status !== 'verified') {
      throw new BadRequestException('Identity verification required before booking');
    }

    const { data: property, error: propError } = await this.supabaseService.admin
        .from('properties')
        .select('host_id, name, price_per_night, weekend_price')
        .eq('id', body.propertyId)
        .single();

    if (propError || !property) {
      this.logger.error(`Property not found for booking: ${body.propertyId}`, propError);
      throw new Error('Property not found');
    }

    // Gate 2: Host self-booking prevention
    if (property.host_id === guestId) {
      throw new BadRequestException('You cannot book your own property');
    }

    // Server-side price recompute — never trust client totalAmount.
    // Mirrors payments.service.ts createOrder() calculation.
    const checkIn = new Date(body.checkIn);
    const checkOut = new Date(body.checkOut);
    const nights = Math.max(
      1,
      Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)),
    );
    const pricePerNight = property.price_per_night ?? 0;
    const weekendPrice = property.weekend_price ?? pricePerNight;
    let subtotal = 0;
    for (let i = 0; i < nights; i++) {
      const d = new Date(checkIn);
      d.setDate(d.getDate() + i);
      const day = d.getDay();
      subtotal += day === 5 || day === 6 ? weekendPrice : pricePerNight;
    }
    const serviceFee = Math.round(subtotal * 0.1);
    const serverTotal = subtotal + serviceFee;

    if (Math.abs(body.totalAmount - serverTotal) > 10) {
      this.logger.error(
        `[BOOKING] Price mismatch! Client: ${body.totalAmount}, Server: ${serverTotal}`,
      );
      throw new BadRequestException(
        `Invalid amount. Expected ₹${serverTotal}, received ₹${body.totalAmount}`,
      );
    }

    // Reject overlapping dates against any pending/confirmed booking for this property.
    const { data: overlapping } = await this.supabaseService.admin
      .from('bookings')
      .select('id')
      .eq('property_id', body.propertyId)
      .in('status', ['pending', 'confirmed'])
      .lt('check_in', body.checkOut)
      .gt('check_out', body.checkIn)
      .limit(1);

    if (overlapping && overlapping.length > 0) {
      throw new BadRequestException('These dates are no longer available for this property');
    }

    // Booking always starts pending — only payment verification (verifyPaymentSignature)
    // or the Razorpay webhook may promote it to confirmed. Client cannot set status directly.
    const status = 'pending';

    const { data, error } = await this.supabaseService.admin
        .from('bookings')
        .insert({
          guest_id: guestId,
          host_id: property.host_id,
          property_id: body.propertyId,
          check_in: body.checkIn,
          check_out: body.checkOut,
          guests: body.guests,
          total_amount: serverTotal,
          service_fee: serviceFee,
          host_payout: serverTotal - serviceFee,
          status,
          payment_id: null,
        })
        .select()
        .single();

    if (error) {
      this.logger.error('Failed to create booking row', error);
      throw new Error('Failed to create booking');
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
      .select('check_in, host_payout, status, created_at, total_amount')
      .eq('host_id', hostId);

    const allBookings = bookings ?? [];
    
    const allTimeBookings = allBookings.length;

    const now = new Date();
    const checkInsThisMonth = allBookings.filter((b) => {
      const d = new Date(b.check_in);
      return d.getMonth() === now.getMonth() && 
        d.getFullYear() === now.getFullYear() &&
        ['confirmed','completed'].includes(b.status);
    }).length;

    // All time earnings (net after commission)
    const earningsAllTime = allBookings
      .filter(b => ['confirmed','completed'].includes(b.status))
      .reduce((sum, b) => sum + (b.host_payout ?? 0), 0);

    // This month earnings
    const earningsThisMonth = allBookings
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
      earningsThisMonth,
      earningsAllTime, // NEW - use this on home dashboard
    };
  }

  async getHostDetailedStats(hostId: string) {
    // Get all bookings for host with property info
    const { data: bookings } = await this.supabaseService.admin
      .from('bookings')
      .select('id, property_id, total_amount, host_payout, status, check_in, check_out, guests')
      .eq('host_id', hostId);

    // Get all host properties
    const { data: properties } = await this.supabaseService.admin
      .from('properties')
      .select('id, name, price_per_night')
      .eq('host_id', hostId);

    const allBookings = bookings ?? [];
    const allProperties = properties ?? [];

    // Overall totals
    const totalGrossRevenue = allBookings
      .filter(b => ['confirmed', 'completed'].includes(b.status))
      .reduce((sum, b) => sum + (b.total_amount ?? 0), 0);

    const totalCommission = allBookings
      .filter(b => ['confirmed', 'completed'].includes(b.status))
      .reduce((sum, b) => {
        const total = b.total_amount ?? 0;
        const payout = b.host_payout ?? total * 0.9;
        return sum + (total - payout);
      }, 0);

    const totalNetEarnings = allBookings
      .filter(b => ['confirmed', 'completed'].includes(b.status))
      .reduce((sum, b) => sum + (b.host_payout ?? 0), 0);

    const totalBookings = allBookings.filter(b => 
      ['confirmed', 'completed'].includes(b.status)
    ).length;

    const totalGuests = allBookings
      .filter(b => ['confirmed', 'completed'].includes(b.status))
      .reduce((sum, b) => sum + (b.guests ?? 0), 0);

    // Property-wise breakdown
    const propertyStats = allProperties.map(prop => {
      const propBookings = allBookings.filter(b => 
        b.property_id === prop.id && 
        ['confirmed', 'completed'].includes(b.status)
      );
      
      const propRevenue = propBookings.reduce(
        (sum, b) => sum + (b.total_amount ?? 0), 0
      );
      const propCommission = propBookings.reduce(
        (sum, b) => sum + ((b.total_amount ?? 0) - (b.host_payout ?? (b.total_amount ?? 0) * 0.9)), 0
      );
      const propNet = propBookings.reduce(
        (sum, b) => sum + (b.host_payout ?? 0), 0
      );

      return {
        id: prop.id,
        name: prop.name,
        totalBookings: propBookings.length,
        grossRevenue: propRevenue,
        commission: propCommission,
        netEarnings: propNet,
      };
    }).filter(p => p.totalBookings > 0); // Only show properties with bookings

    // Sort by revenue descending
    propertyStats.sort((a, b) => b.grossRevenue - a.grossRevenue);

    // Average booking value
    const avgBookingValue = totalBookings > 0 
      ? Math.round(totalGrossRevenue / totalBookings) 
      : 0;

    // Available balance (pending payout for confirmed bookings / completed)
    const availableBalance = allBookings
      .filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + (b.host_payout ?? 0), 0);

    return {
      overview: {
        totalGrossRevenue,
        totalCommission,
        totalNetEarnings,
        commissionRate: 10,
        totalBookings,
        totalGuests,
        totalProperties: allProperties.length,
        avgBookingValue,
        availableBalance,
      },
      properties: propertyStats,
    };
  }
}


