import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import BookingStatusForm from './BookingStatusForm';
import styles from './page.module.css';

async function getBookingDetail(id: string) {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      property:properties(
        id,
        name,
        location
      ),
      guest:users!guest_id(id, name, email, phone),
      host:users!host_id(id, name, email, phone)
    `)
    .eq('id', id)
    .single();

  if (error || !data) {
    console.error('Error fetching booking detail:', error);
    return null;
  }

  const guestObj = Array.isArray(data.guest) ? data.guest[0] : data.guest;
  const hostObj = Array.isArray(data.host) ? data.host[0] : data.host;
  const propertyObj = Array.isArray(data.property) ? data.property[0] : data.property;

  return {
    ...data,
    guest: guestObj ?? null,
    host: hostObj ?? null,
    property: propertyObj ?? null,
  };
}

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const booking = await getBookingDetail(resolvedParams.id);
  if (!booking) notFound();

  const checkInDate = booking.check_in ? new Date(booking.check_in) : null;
  const checkOutDate = booking.check_out ? new Date(booking.check_out) : null;
  const nights = checkInDate && checkOutDate 
    ? Math.round((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const propertyLocation = booking.property?.location as Record<string, string> | undefined;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Booking Detail</h1>
        <p className={styles.subtitle}>Reference: {booking.payment_id ?? booking.id}</p>
      </div>

      <div className={styles.grid}>
        {/* Left: Summary & Status Control */}
        <div className={styles.profileCard}>
          <h3 className={styles.cardTitle}>Booking Summary</h3>
          
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Status</span>
            <span className={`${styles.badge} ${styles[booking.status] ?? ''}`}>
              {booking.status}
            </span>
          </div>

          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Check-In</span>
            <span className={styles.infoValue}>
              {checkInDate ? checkInDate.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}
            </span>
          </div>

          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Check-Out</span>
            <span className={styles.infoValue}>
              {checkOutDate ? checkOutDate.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}
            </span>
          </div>

          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Duration</span>
            <span className={styles.infoValue}>{nights} {nights === 1 ? 'night' : 'nights'}</span>
          </div>

          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Guests Count</span>
            <span className={styles.infoValue}>{booking.guests ?? 1} guest{(booking.guests ?? 1) > 1 ? 's' : ''}</span>
          </div>

          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Created At</span>
            <span className={styles.infoValue}>
              {new Date(booking.created_at).toLocaleString('en-IN')}
            </span>
          </div>

          <BookingStatusForm bookingId={booking.id} currentStatus={booking.status} />
        </div>

        {/* Right: Stay Details, Users, Financials */}
        <div className={styles.mainContent}>
          {/* Linked Entities Section */}
          <div className={styles.section}>
            <h3 className={styles.cardTitle}>Associated Details</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Guest</span>
                {booking.guest ? (
                  <Link href={`/guests/${booking.guest.id}`} className={styles.linkValue}>
                    {booking.guest.name}
                  </Link>
                ) : (
                  <span className={styles.infoValue}>N/A</span>
                )}
                <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                  {booking.guest?.email ?? ''}
                </span>
              </div>

              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Host</span>
                {booking.host ? (
                  <Link href={`/hosts/${booking.host.id}`} className={styles.linkValue}>
                    {booking.host.name}
                  </Link>
                ) : (
                  <span className={styles.infoValue}>N/A</span>
                )}
                <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                  {booking.host?.email ?? ''}
                </span>
              </div>

              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Property</span>
                {booking.property ? (
                  <Link href={`/properties/${booking.property.id}`} className={styles.linkValue}>
                    {booking.property.name}
                  </Link>
                ) : (
                  <span className={styles.infoValue}>N/A</span>
                )}
                <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                  {propertyLocation?.city ? `${propertyLocation.city}, ${propertyLocation.state ?? ''}` : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Financial Breakdown Section */}
          <div className={styles.section}>
            <h3 className={styles.cardTitle}>Financial Statement</h3>
            <div className={styles.financialsGrid}>
              <div className={styles.financialCard}>
                <div className={styles.infoLabel}>Total Amount (Paid)</div>
                <div className={styles.financialValue}>
                  ₹{booking.total_amount?.toLocaleString('en-IN') ?? 0}
                </div>
              </div>

              <div className={styles.financialCard}>
                <div className={styles.infoLabel}>Service Fee (10%)</div>
                <div className={styles.financialValue}>
                  ₹{booking.service_fee?.toLocaleString('en-IN') ?? 0}
                </div>
              </div>

              <div className={`${styles.financialCard} ${styles.highlight}`}>
                <div className={styles.infoLabel}>Host Payout</div>
                <div className={styles.financialValue}>
                  ₹{booking.host_payout?.toLocaleString('en-IN') ?? 0}
                </div>
              </div>
            </div>
          </div>

          {/* Transaction Metadata Section */}
          <div className={styles.section}>
            <h3 className={styles.cardTitle}>Transaction Info</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Booking ID</span>
                <span className={styles.infoValue}>{booking.id}</span>
              </div>

              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Payment Reference</span>
                <span className={styles.infoValue}>{booking.payment_id ?? 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
