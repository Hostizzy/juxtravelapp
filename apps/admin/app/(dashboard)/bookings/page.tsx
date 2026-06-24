import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import SearchBar from '@/components/SearchBar/SearchBar';
import styles from './page.module.css';

async function getBookings(q?: string) {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      id,
      total_amount,
      status,
      check_in,
      check_out,
      guests,
      created_at,
      guest:users!guest_id(name),
      host:users!host_id(name),
      property:properties(name)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching bookings:', error);
    return [];
  }

  const bookingsList = (data ?? []).map((b: any) => {
    const guestObj = Array.isArray(b.guest) ? b.guest[0] : b.guest;
    const hostObj = Array.isArray(b.host) ? b.host[0] : b.host;
    const propertyObj = Array.isArray(b.property) ? b.property[0] : b.property;

    return {
      id: b.id,
      total_amount: b.total_amount,
      status: b.status,
      check_in: b.check_in,
      check_out: b.check_out,
      guests: b.guests,
      created_at: b.created_at,
      guestName: guestObj?.name ?? 'N/A',
      hostName: hostObj?.name ?? 'N/A',
      propertyName: propertyObj?.name ?? 'N/A',
    };
  });

  if (q) {
    const queryLower = q.toLowerCase();
    return bookingsList.filter((b) => 
      b.guestName.toLowerCase().includes(queryLower) ||
      b.propertyName.toLowerCase().includes(queryLower)
    );
  }

  return bookingsList;
}

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const resolvedParams = await searchParams;
  const queryVal = resolvedParams.q ?? '';
  const bookings = await getBookings(queryVal);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Bookings</h1>
        <p className={styles.subtitle}>
          {bookings.length} bookings registered in the system
        </p>
      </div>

      <SearchBar placeholder="Search bookings..." />

      <div className={styles.table}>
        <div className={styles.tableHeader}>
          <span>Guest</span>
          <span>Property</span>
          <span>Host</span>
          <span>Dates</span>
          <span>Guests</span>
          <span>Amount</span>
          <span>Status</span>
        </div>
        {bookings.map((booking) => {
          const checkInStr = booking.check_in 
            ? new Date(booking.check_in).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
            : 'N/A';
          const checkOutStr = booking.check_out
            ? new Date(booking.check_out).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
            : 'N/A';

          return (
            <Link 
              href={`/bookings/${booking.id}`} 
              key={booking.id}
              className={styles.tableRow}
            >
              <span className={styles.guestName}>{booking.guestName}</span>
              <span className={styles.propertyName}>{booking.propertyName}</span>
              <span className={styles.hostName}>{booking.hostName}</span>
              <span className={styles.dates}>{checkInStr} - {checkOutStr}</span>
              <span className={styles.guests}>{booking.guests ?? 1}</span>
              <span className={styles.amount}>
                {booking.total_amount ? `₹${booking.total_amount.toLocaleString('en-IN')}` : 'N/A'}
              </span>
              <span>
                <span className={`${styles.badge} ${styles[booking.status] ?? ''}`}>
                  {booking.status}
                </span>
              </span>
            </Link>
          );
        })}
        {bookings.length === 0 && (
          <div className={styles.empty}>No bookings found</div>
        )}
      </div>
    </div>
  );
}
