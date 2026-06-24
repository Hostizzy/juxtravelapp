import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import SearchBar from '@/components/SearchBar/SearchBar';
import styles from './page.module.css';

async function getGuests(q?: string) {
  let query = supabase
    .from('users')
    .select('*')
    .in('role', ['guest', 'both'])
    .order('created_at', { ascending: false });

  if (q) {
    query = query.or(`name.ilike.%${q}%,phone.ilike.%${q}%`);
  }

  const { data: users, error } = await query;

  console.log('Guests user query result:', JSON.stringify(users));
  console.log('Guests user query error:', JSON.stringify(error));

  if (error || !users || users.length === 0) {
    return [];
  }

  const userIds = users.map(u => u.id);

  // Fetch verification status separately
  const { data: verifications, error: verError } = await supabase
    .from('guest_verifications')
    .select('user_id, status')
    .in('user_id', userIds);

  console.log('Guests verifications query result:', JSON.stringify(verifications));
  console.log('Guests verifications query error:', JSON.stringify(verError));

  // Fetch booking counts separately
  const { data: bookings, error: bookingsError } = await supabase
    .from('bookings')
    .select('id, guest_id')
    .in('guest_id', userIds);

  console.log('Guests bookings query result:', JSON.stringify(bookings));
  console.log('Guests bookings query error:', JSON.stringify(bookingsError));

  return users.map(u => ({
    ...u,
    verification: verifications?.find(v => v.user_id === u.id) ?? null,
    bookings: (bookings ?? []).filter(b => b.guest_id === u.id),
  }));
}

export default async function GuestsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const resolvedParams = await searchParams;
  const queryVal = resolvedParams.q ?? '';
  const guests = await getGuests(queryVal);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Guests</h1>
        <p className={styles.subtitle}>
          {guests.length} guests registered
        </p>
      </div>

      <SearchBar placeholder="Search guests..." />

      <div className={styles.table}>
        <div className={styles.tableHeader}>
          <span>Guest</span>
          <span>Email</span>
          <span>Phone</span>
          <span>Trips</span>
          <span>KYC Status</span>
          <span>Joined</span>
        </div>
        {guests.map(guest => {
          const verObj = Array.isArray(guest.verification) ? guest.verification[0] : guest.verification;
          const kycStatus = verObj?.status ?? 'none';
          const tripsCount = (guest.bookings as any[] ?? []).length;

          return (
            <Link 
              href={`/guests/${guest.id}`}
              key={guest.id} 
              className={styles.tableRow}
            >
              <span className={styles.guestName}>{guest.name}</span>
              <span className={styles.email}>{guest.email ?? 'N/A'}</span>
              <span className={styles.phone}>{guest.phone ?? 'N/A'}</span>
              <span>{tripsCount}</span>
              <span>
                <span className={`${styles.badge} ${styles[kycStatus] ?? ''}`}>
                  {kycStatus === 'none' ? 'No Docs' : kycStatus}
                </span>
              </span>
              <span className={styles.date}>
                {new Date(guest.created_at).toLocaleDateString('en-IN')}
              </span>
            </Link>
          );
        })}
        {guests.length === 0 && (
          <div className={styles.empty}>
            No guests found
          </div>
        )}
      </div>
    </div>
  );
}
