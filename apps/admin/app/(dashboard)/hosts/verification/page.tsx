import { supabase } from '@/lib/supabase';
import HostVerificationActions from './HostVerificationActions';
import Link from 'next/link';
import styles from './page.module.css';

async function getHostVerifications(status?: string) {
  let query = supabase
    .from('host_profiles')
    .select(`
      *,
      user:users!user_id(name, phone, email, created_at)
    `)
    .order('created_at', { ascending: false });

  if (status && status !== 'all') {
    query = query.eq('verification_status', status);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching host verifications:', error);
    return [];
  }
  return data ?? [];
}

async function getHostVerificationCounts() {
  const { data } = await supabase
    .from('host_profiles')
    .select('verification_status');

  const counts = {
    all: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  };

  if (data) {
    counts.all = data.length;
    data.forEach(item => {
      const status = item.verification_status;
      if (status === 'pending') counts.pending++;
      if (status === 'approved') counts.approved++;
      if (status === 'rejected') counts.rejected++;
    });
  }

  return counts;
}

async function getProperties() {
  const { data } = await supabase
    .from('properties')
    .select('id, host_id');
  return data ?? [];
}

export default async function HostVerificationPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const resolvedParams = await searchParams;
  const filterStatus = resolvedParams.status ?? 'all';
  const verifications = await getHostVerifications(filterStatus);
  const counts = await getHostVerificationCounts();
  const properties = await getProperties();

  const tabs = [
    { label: 'All', value: 'all', count: counts.all },
    { label: 'Pending', value: 'pending', count: counts.pending, highlight: true },
    { label: 'Approved', value: 'approved', count: counts.approved },
    { label: 'Rejected', value: 'rejected', count: counts.rejected },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Host Verification</h1>
        <p className={styles.subtitle}>
          {counts.pending} hosts pending verification
        </p>
      </div>

      <div className={styles.tabs}>
        {tabs.map(tab => (
          <Link
            key={tab.value}
            href={`/hosts/verification?status=${tab.value}`}
            className={`${styles.tab} ${
              filterStatus === tab.value ? styles.tabActive : ''
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`${styles.tabBadge} ${tab.highlight && tab.value === 'pending' ? styles.tabBadgeHighlight : ''}`}>
                {tab.count}
              </span>
            )}
          </Link>
        ))}
      </div>

      <div className={styles.list}>
        {verifications.map(profile => {
          const userObj = Array.isArray(profile.user) ? profile.user[0] : profile.user;
          const user = userObj as Record<string, any> | null;
          if (!user) return null;

          const propertiesCount = properties.filter(p => p.host_id === profile.user_id).length;

          return (
            <div key={profile.id} className={styles.card}>
              <div className={styles.cardHeaderRow}>
                <div className={styles.cardLeft}>
                  <h3 className={styles.userName}>
                    {user.name || 'Unknown Host'}
                  </h3>
                  <p className={styles.userEmail}>
                    Email: {user.email || 'N/A'}
                  </p>
                  <p className={styles.userPhone}>
                    Phone: {user.phone || 'N/A'}
                  </p>
                  <div className={styles.hostMeta}>
                    <span>{propertiesCount} properties</span>
                    <span>•</span>
                    <span>Joined: {new Date(user.created_at).toLocaleDateString('en-IN')}</span>
                  </div>
                  {profile.bio && (
                    <p className={styles.bioText}>
                      <strong>Bio: </strong>{profile.bio}
                    </p>
                  )}
                </div>

                <div className={styles.cardRight}>
                  <span className={`${styles.badge} ${styles[profile.verification_status] || ''}`}>
                    {profile.verification_status}
                  </span>

                  {profile.verification_status === 'pending' ? (
                    <HostVerificationActions hostId={profile.user_id} />
                  ) : (
                    profile.verification_status === 'approved' && (
                      <span className={styles.verifiedLabel}>
                        Approved on {profile.updated_at ? new Date(profile.updated_at).toLocaleDateString('en-IN') : new Date(profile.created_at).toLocaleDateString('en-IN')}
                      </span>
                    )
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {verifications.length === 0 && (
          <div className={styles.empty}>
            No host verifications found
          </div>
        )}
      </div>
    </div>
  );
}
