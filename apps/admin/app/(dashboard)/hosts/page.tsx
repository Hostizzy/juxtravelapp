import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import SearchBar from '@/components/SearchBar/SearchBar';
import styles from './page.module.css';

async function getHosts(q?: string) {
  let query = supabase
    .from('users')
    .select('*')
    .in('role', ['host', 'both'])
    .order('created_at', { ascending: false });

  if (q) {
    query = query.or(`name.ilike.%${q}%,phone.ilike.%${q}%`);
  }

  const { data: users, error } = await query;

  if (error || !users || users.length === 0) {
    return [];
  }

  const userIds = users.map(u => u.id);

  // Fetch host_profile separately
  const { data: hostProfiles, error: profileError } = await supabase
    .from('host_profiles')
    .select('*')
    .in('user_id', userIds);

  // Fetch properties count separately
  const { data: properties, error: propertiesError } = await supabase
    .from('properties')
    .select('id, host_id')
    .in('host_id', userIds);

  // Fetch bookings separately
  const { data: bookings, error: bookingsError } = await supabase
    .from('bookings')
    .select('id, host_id, status, host_payout')
    .in('host_id', userIds);

  return users.map(u => ({
    ...u,
    host_profile: hostProfiles?.find(hp => hp.user_id === u.id) ?? null,
    properties: (properties ?? []).filter(p => p.host_id === u.id),
    bookings: (bookings ?? []).filter(b => b.host_id === u.id),
  }));
}

export default async function HostsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const resolvedParams = await searchParams;
  const queryVal = resolvedParams.q ?? '';
  const hosts = await getHosts(queryVal);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Hosts</h1>
        <p className={styles.subtitle}>
          {hosts.length} hosts registered
        </p>
      </div>

      <SearchBar placeholder="Search hosts..." />

      <div className={styles.table}>
        <div className={styles.tableHeader}>
          <span>Host</span>
          <span>Phone</span>
          <span>Email</span>
          <span>Properties</span>
          <span>Bookings</span>
          <span>Revenue</span>
          <span>Status</span>
        </div>
        {hosts.map(host => {
          const profileObj = Array.isArray(host.host_profile) ? host.host_profile[0] : host.host_profile;
          const isVerified = profileObj?.verified ?? false;
          const propertiesCount = (host.properties as any[] ?? []).length;
          const bookingsCount = (host.bookings as any[] ?? []).length;
          const totalRevenue = (host.bookings as any[] ?? [])
            .filter(b => ['confirmed', 'completed'].includes(b.status))
            .reduce((sum, b) => sum + (b.host_payout ?? 0), 0);

          return (
            <Link 
              href={`/hosts/${host.id}`}
              key={host.id} 
              className={styles.tableRow}
            >
              <span className={styles.hostName}>{host.name}</span>
              <span className={styles.phone}>{host.phone ?? 'N/A'}</span>
              <span className={styles.email}>{host.email ?? 'N/A'}</span>
              <span>{propertiesCount}</span>
              <span>{bookingsCount}</span>
              <span className={styles.revenue}>₹{totalRevenue.toLocaleString('en-IN')}</span>
              <span>
                <span className={`${styles.badge} ${isVerified ? styles.verified : styles.pending}`}>
                  {isVerified ? 'Verified' : 'Pending'}
                </span>
              </span>
            </Link>
          );
        })}
        {hosts.length === 0 && (
          <div className={styles.empty}>
            No hosts found
          </div>
        )}
      </div>
    </div>
  );
}
