import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';

async function getHostDetail(id: string) {
  const [
    { data: host, error: hostError },
    { data: properties },
    { data: bookings }
  ] = await Promise.all([
    supabase
      .from('users')
      .select('*, host_profile:host_profiles(*)')
      .eq('id', id)
      .single(),
    supabase
      .from('properties')
      .select('*')
      .eq('host_id', id)
      .order('created_at', { ascending: false }),
    supabase
      .from('bookings')
      .select(`
        *,
        property:properties(name),
        guest:users!guest_id(name)
      `)
      .eq('host_id', id)
      .order('created_at', { ascending: false }),
  ]);

  if (hostError || !host) {
    return null;
  }

  const totalRevenue = (bookings ?? [])
    .filter(b => ['confirmed', 'completed'].includes(b.status))
    .reduce((sum, b) => sum + (b.host_payout ?? 0), 0);

  return {
    host,
    properties: properties ?? [],
    bookings: (bookings ?? []).map((b: any) => {
      const guestObj = Array.isArray(b.guest) ? b.guest[0] : b.guest;
      const propertyObj = Array.isArray(b.property) ? b.property[0] : b.property;
      return {
        ...b,
        guestName: guestObj?.name ?? 'N/A',
        propertyName: propertyObj?.name ?? 'N/A',
      };
    }),
    totalRevenue,
  };
}

export default async function HostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const detail = await getHostDetail(resolvedParams.id);
  if (!detail) notFound();

  const { host, properties, bookings, totalRevenue } = detail;
  const profileObj = Array.isArray(host.host_profile) ? host.host_profile[0] : host.host_profile;
  const isVerified = profileObj?.verified ?? false;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Host Profile</h1>
        <p className={styles.subtitle}>ID: {host.id}</p>
      </div>

      <div className={styles.grid}>
        {/* Left: Host Info Card */}
        <div className={styles.profileCard}>
          <h3 className={styles.cardTitle}>Account Details</h3>
          
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Name</span>
            <span className={styles.infoValue}>{host.name}</span>
          </div>

          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Phone</span>
            <span className={styles.infoValue}>{host.phone ?? 'N/A'}</span>
          </div>

          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Email</span>
            <span className={styles.infoValue}>{host.email ?? 'N/A'}</span>
          </div>

          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>KYC Status</span>
            <span className={`${styles.badge} ${isVerified ? styles.verified : styles.pending}`}>
              {isVerified ? 'Verified' : 'Pending'}
            </span>
          </div>

          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Joined</span>
            <span className={styles.infoValue}>
              {new Date(host.created_at).toLocaleDateString('en-IN')}
            </span>
          </div>
        </div>

        {/* Right: Stats & Stays */}
        <div className={styles.mainContent}>
          <div className={styles.statsRow}>
            <div className={styles.statBox}>
              <div className={styles.statValue}>{properties.length}</div>
              <div className={styles.statLabel}>Properties</div>
            </div>
            <div className={styles.statBox}>
              <div className={styles.statValue}>{bookings.length}</div>
              <div className={styles.statLabel}>Bookings</div>
            </div>
            <div className={styles.statBox}>
              <div className={styles.statValue}>₹{totalRevenue.toLocaleString('en-IN')}</div>
              <div className={styles.statLabel}>Revenue Earned</div>
            </div>
          </div>

          {/* Properties Section */}
          <div className={styles.section}>
            <h3 className={styles.cardTitle}>Properties ({properties.length})</h3>
            <div className={styles.propertiesGrid}>
              {properties.map((prop: any) => {
                const locationObj = prop.location as Record<string, string>;
                return (
                  <Link 
                    href={`/properties/${prop.id}`} 
                    key={prop.id}
                    className={styles.propertyCard}
                  >
                    <div className={styles.propertyName}>{prop.name}</div>
                    <div className={styles.propertyLocation}>
                      {locationObj?.city ?? 'N/A'}, {locationObj?.state ?? 'N/A'}
                    </div>
                    <div className={styles.propertyPrice}>
                      ₹{prop.price_per_night?.toLocaleString('en-IN')}/night
                    </div>
                  </Link>
                );
              })}
              {properties.length === 0 && (
                <div className={styles.empty}>No properties listed yet</div>
              )}
            </div>
          </div>

          {/* Bookings Section */}
          <div className={styles.section}>
            <h3 className={styles.cardTitle}>Bookings ({bookings.length})</h3>
            <div className={styles.table}>
              <div className={styles.tableHeader}>
                <span>Guest</span>
                <span>Property</span>
                <span>Dates</span>
                <span>Payout</span>
              </div>
              {bookings.map((booking: any) => (
                <Link 
                  href={`/bookings/${booking.id}`} 
                  key={booking.id}
                  className={styles.tableRow}
                >
                  <span className={styles.guestName}>{booking.guestName}</span>
                  <span className={styles.dates}>{booking.propertyName}</span>
                  <span className={styles.dates}>
                    {new Date(booking.check_in).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} - {new Date(booking.check_out).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                  <span className={styles.amount}>₹{booking.host_payout?.toLocaleString('en-IN')}</span>
                </Link>
              ))}
              {bookings.length === 0 && (
                <div className={styles.empty}>No bookings processed yet</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
