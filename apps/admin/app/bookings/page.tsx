import { supabase } from '@/lib/supabase';
import styles from './page.module.css';

async function getBookings() {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        property:properties(name),
        user:users(name)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data ?? [];
  } catch {
    const { data } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });
    return data ?? [];
  }
}

export default async function BookingsPage() {
  const bookings = await getBookings();

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Bookings</h1>
        <p className={styles.subtitle}>
          {bookings.length} total bookings processed
        </p>
      </div>

      <div className={styles.table}>
        <div className={styles.tableHeader}>
          <span>Reference</span>
          <span>Guest</span>
          <span>Property</span>
          <span>Dates</span>
          <span>Amount</span>
          <span>Status</span>
        </div>
        {bookings.map(booking => {
          const guestName = booking.user?.name ?? booking.guest_name ?? booking.user_id ?? 'N/A';
          const propertyName = booking.property?.name ?? booking.property_name ?? booking.property_id ?? 'N/A';
          const dates = booking.check_in && booking.check_out 
            ? `${new Date(booking.check_in).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} - ${new Date(booking.check_out).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`
            : booking.dates ?? 'N/A';
          const amount = booking.total_price 
            ? `₹${booking.total_price.toLocaleString('en-IN')}`
            : booking.amount 
              ? `₹${booking.amount.toLocaleString('en-IN')}` 
              : 'N/A';

          return (
            <div 
              key={booking.id} 
              className={styles.tableRow}
            >
              <span className={styles.reference}>
                {booking.reference ?? booking.id.substring(0, 8)}
              </span>
              <span className={styles.guestName}>
                {guestName}
              </span>
              <span className={styles.propertyName}>
                {propertyName}
              </span>
              <span className={styles.dates}>
                {dates}
              </span>
              <span className={styles.amount}>
                {amount}
              </span>
              <span>
                <span className={`
                  ${styles.badge}
                  ${styles[String(booking.status).toLowerCase().replace(' ', '_')] ?? styles.default}
                `}>
                  {booking.status}
                </span>
              </span>
            </div>
          );
        })}
        {bookings.length === 0 && (
          <div className={styles.empty}>
            No bookings found
          </div>
        )}
      </div>
    </div>
  );
}
