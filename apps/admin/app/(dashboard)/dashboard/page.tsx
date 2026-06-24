import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import AnalyticsCharts from './AnalyticsCharts';
import styles from './page.module.css';

async function getStats() {
  const [
    totalPropertiesRes,
    pendingPropertiesRes,
    totalHostsRes,
    totalGuestsRes,
    totalBookingsRes,
    revenueRes,
    pendingHostVerificationsRes,
    propertiesNeedingVerificationRes
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
    supabase
      .from('bookings')
      .select('total_amount, status')
      .in('status', ['confirmed', 'completed']),
    supabase
      .from('host_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('verification_status', 'pending'),
    supabase
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
      .eq('verified_by_admin', false)
  ]);

  const totalRevenue = (revenueRes.data ?? []).reduce(
    (sum, b) => sum + (b.total_amount ?? 0), 0
  );

  return {
    totalProperties: totalPropertiesRes.count ?? 0,
    pendingProperties: pendingPropertiesRes.count ?? 0,
    totalHosts: totalHostsRes.count ?? 0,
    totalGuests: totalGuestsRes.count ?? 0,
    totalBookings: totalBookingsRes.count ?? 0,
    totalRevenue,
    pendingHostVerifications: pendingHostVerificationsRes.count ?? 0,
    propertiesNeedingVerification: propertiesNeedingVerificationRes.count ?? 0,
  };
}

async function getBookingsOverTime() {
  const { data } = await supabase
    .from('bookings')
    .select('created_at, total_amount')
    .order('created_at', { ascending: true });
  
  const grouped: Record<string, { count: number; revenue: number }> = {};
  
  (data ?? []).forEach(b => {
    const date = new Date(b.created_at).toISOString().split('T')[0];
    if (!grouped[date]) {
      grouped[date] = { count: 0, revenue: 0 };
    }
    grouped[date].count += 1;
    grouped[date].revenue += b.total_amount ?? 0;
  });

  return Object.entries(grouped).map(([date, stats]) => ({
    date,
    ...stats,
  }));
}

async function getRevenueByLocation() {
  const { data } = await supabase
    .from('bookings')
    .select(`
      total_amount,
      property:properties(location)
    `)
    .in('status', ['confirmed', 'completed']);

  const grouped: Record<string, number> = {};
  (data ?? []).forEach((b: any) => {
    const propertyObj = Array.isArray(b.property) ? b.property[0] : b.property;
    const city = propertyObj?.location as Record<string, string> | undefined;
    const cityName = city?.city ?? 'Unknown';
    grouped[cityName] = (grouped[cityName] ?? 0) + (b.total_amount ?? 0);
  });

  return Object.entries(grouped)
    .map(([city, revenue]) => ({ city, revenue }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 8);
}

async function getRecentData() {
  const [propertiesRes, bookingsRes] = await Promise.all([
    supabase
      .from('properties')
      .select('id, name, status, created_at, location')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('bookings')
      .select(`
        id,
        total_amount,
        status,
        check_in,
        check_out,
        guest:users!guest_id(name),
        property:properties(name)
      `)
      .order('created_at', { ascending: false })
      .limit(5)
  ]);

  return {
    recentProperties: propertiesRes.data ?? [],
    recentBookings: (bookingsRes.data ?? []).map((b: any) => {
      const guestObj = Array.isArray(b.guest) ? b.guest[0] : b.guest;
      const propertyObj = Array.isArray(b.property) ? b.property[0] : b.property;
      return {
        id: b.id,
        total_amount: b.total_amount,
        status: b.status,
        check_in: b.check_in,
        check_out: b.check_out,
        guestName: guestObj?.name ?? 'N/A',
        propertyName: propertyObj?.name ?? 'N/A',
      };
    }),
  };
}

export default async function DashboardPage() {
  const [stats, recent, bookingsOverTime, revenueByLocation] = await Promise.all([
    getStats(),
    getRecentData(),
    getBookingsOverTime(),
    getRevenueByLocation(),
  ]);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Dashboard</h1>
        <p className={styles.subtitle}>System health and recent performance summary</p>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statBadge} />
          <div className={styles.statValue}>{stats.totalProperties}</div>
          <div className={styles.statLabel}>Total Properties</div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statBadge} ${styles.warning}`} />
          <div className={styles.statValue}>{stats.pendingProperties}</div>
          <div className={styles.statLabel}>Pending Review</div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statBadge} ${styles.warning}`} />
          <div className={styles.statValue}>{stats.propertiesNeedingVerification}</div>
          <div className={styles.statLabel}>Props Needing Verify</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statBadge} />
          <div className={styles.statValue}>{stats.totalHosts}</div>
          <div className={styles.statLabel}>Total Hosts</div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statBadge} ${styles.warning}`} />
          <div className={styles.statValue}>{stats.pendingHostVerifications}</div>
          <div className={styles.statLabel}>Pending Host Verify</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statBadge} />
          <div className={styles.statValue}>{stats.totalGuests}</div>
          <div className={styles.statLabel}>Total Guests</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statBadge} />
          <div className={styles.statValue}>{stats.totalBookings}</div>
          <div className={styles.statLabel}>Total Bookings</div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statBadge} ${styles.success}`} />
          <div className={styles.statValue}>₹{stats.totalRevenue.toLocaleString('en-IN')}</div>
          <div className={styles.statLabel}>Total Revenue</div>
        </div>
      </div>

      <AnalyticsCharts 
        bookingsOverTime={bookingsOverTime} 
        revenueByLocation={revenueByLocation} 
      />

      <div className={styles.sectionsGrid}>
        {/* Recent Properties */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Recent Properties</h2>
          <div className={styles.table}>
            <div className={styles.tableHeader}>
              <span>Property</span>
              <span>Location</span>
              <span>Status</span>
              <span>Added</span>
            </div>
            {recent.recentProperties.map((prop: any) => (
              <Link 
                href={`/properties/${prop.id}`} 
                key={prop.id} 
                className={styles.tableRow}
              >
                <span className={styles.propName}>{prop.name}</span>
                <span className={styles.propLocation}>
                  {(prop.location as Record<string, string>)?.city ?? 'N/A'}
                </span>
                <span>
                  <span className={`${styles.badge} ${styles[prop.status] ?? ''}`}>
                    {prop.status === 'under_review' ? 'Pending' : prop.status}
                  </span>
                </span>
                <span className={styles.date}>
                  {new Date(prop.created_at).toLocaleDateString('en-IN')}
                </span>
              </Link>
            ))}
            {recent.recentProperties.length === 0 && (
              <div className={styles.emptyRow}>No recent properties found</div>
            )}
          </div>
        </div>

        {/* Recent Bookings */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Recent Bookings</h2>
          <div className={styles.table}>
            <div className={styles.bookingTableHeader}>
              <span>Guest</span>
              <span>Property</span>
              <span>Amount</span>
              <span>Status</span>
            </div>
            {recent.recentBookings.map((booking: any) => (
              <Link 
                href={`/bookings/${booking.id}`} 
                key={booking.id} 
                className={styles.bookingTableRow}
              >
                <span className={styles.guestName}>{booking.guestName}</span>
                <span className={styles.propLocation}>{booking.propertyName}</span>
                <span className={styles.amount}>₹{booking.total_amount?.toLocaleString('en-IN')}</span>
                <span>
                  <span className={`${styles.badge} ${styles[booking.status] ?? ''}`}>
                    {booking.status}
                  </span>
                </span>
              </Link>
            ))}
            {recent.recentBookings.length === 0 && (
              <div className={styles.emptyRow}>No recent bookings found</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
