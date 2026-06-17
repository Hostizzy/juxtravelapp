import { supabase } from '@/lib/supabase';
import styles from './page.module.css';

async function getStats() {
  const [
    totalPropertiesRes,
    pendingPropertiesRes,
    totalHostsRes,
    totalGuestsRes,
    totalBookingsRes,
  ] = await Promise.all([
    supabase
      .from('properties')
      .select('*', { count: 'exact', head: true }),
    supabase
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'under_review'),
    supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .in('role', ['host', 'both']),
    supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .in('role', ['guest', 'both']),
    supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true }),
  ]);

  return {
    totalProperties: totalPropertiesRes.count ?? 0,
    pendingProperties: pendingPropertiesRes.count ?? 0,
    totalHosts: totalHostsRes.count ?? 0,
    totalGuests: totalGuestsRes.count ?? 0,
    totalBookings: totalBookingsRes.count ?? 0,
  };
}

async function getRecentProperties() {
  const { data } = await supabase
    .from('properties')
    .select('id, name, status, created_at, location')
    .order('created_at', { ascending: false })
    .limit(5);
  return data ?? [];
}

export default async function Dashboard() {
  const [stats, recentProperties] = await Promise.all([
    getStats(),
    getRecentProperties(),
  ]);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          Dashboard
        </h1>
        <p className={styles.subtitle}>
          Welcome back, Admin
        </p>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            🏠
          </div>
          <div className={styles.statValue}>
            {stats.totalProperties}
          </div>
          <div className={styles.statLabel}>
            Total Properties
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.warning}`}>
          <div className={styles.statIcon}>
            ⏳
          </div>
          <div className={styles.statValue}>
            {stats.pendingProperties}
          </div>
          <div className={styles.statLabel}>
            Pending Review
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            👤
          </div>
          <div className={styles.statValue}>
            {stats.totalHosts}
          </div>
          <div className={styles.statLabel}>
            Total Hosts
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            🧳
          </div>
          <div className={styles.statValue}>
            {stats.totalGuests}
          </div>
          <div className={styles.statLabel}>
            Total Guests
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            📅
          </div>
          <div className={styles.statValue}>
            {stats.totalBookings}
          </div>
          <div className={styles.statLabel}>
            Total Bookings
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>
          Recent Properties
        </h2>
        <div className={styles.table}>
          <div className={styles.tableHeader}>
            <span>Property</span>
            <span>Location</span>
            <span>Status</span>
            <span>Added</span>
          </div>
          {recentProperties.map(prop => (
            <div 
              key={prop.id} 
              className={styles.tableRow}
            >
              <span className={propNameClass(prop.status)}>
                {prop.name}
              </span>
              <span className={styles.propLocation}>
                {(prop.location as Record<string, string>)?.city ?? 'N/A'}
              </span>
              <span>
                <span className={`
                  ${styles.badge} 
                  ${styles[prop.status] ?? ''}
                `}>
                  {prop.status}
                </span>
              </span>
              <span className={styles.date}>
                {new Date(prop.created_at).toLocaleDateString('en-IN')}
              </span>
            </div>
          ))}
          {recentProperties.length === 0 && (
            <div className={styles.emptyRow}>
              No recent properties found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function propNameClass(status: string) {
  return styles.propName;
}
