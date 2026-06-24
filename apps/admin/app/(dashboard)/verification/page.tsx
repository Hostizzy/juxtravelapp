import { supabase } from '@/lib/supabase';
import VerificationActions from './VerificationActions';
import Link from 'next/link';
import styles from './page.module.css';

async function getVerifications(status?: string) {
  let query = supabase
    .from('guest_verifications')
    .select(`
      *,
      user:users!user_id(name, phone)
    `)
    .order('created_at', { ascending: false });

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching verifications:', error);
    return [];
  }
  return data ?? [];
}

async function getVerificationCounts() {
  const { data } = await supabase
    .from('guest_verifications')
    .select('status');
  
  const counts = {
    all: 0,
    pending: 0,
    verified: 0,
    rejected: 0,
  };

  if (data) {
    counts.all = data.length;
    data.forEach(item => {
      if (item.status === 'pending') counts.pending++;
      if (item.status === 'verified') counts.verified++;
      if (item.status === 'rejected') counts.rejected++;
    });
  }

  return counts;
}

export default async function VerificationPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const resolvedParams = await searchParams;
  const filterStatus = resolvedParams.status ?? 'all';
  const verifications = await getVerifications(filterStatus);
  const counts = await getVerificationCounts();

  const tabs = [
    { label: 'All', value: 'all', count: counts.all },
    { label: 'Pending', value: 'pending', count: counts.pending, highlight: true },
    { label: 'Verified', value: 'verified', count: counts.verified },
    { label: 'Rejected', value: 'rejected', count: counts.rejected },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>KYC Verification</h1>
        <p className={styles.subtitle}>
          {counts.pending} pending reviews
        </p>
      </div>

      <div className={styles.tabs}>
        {tabs.map(tab => (
          <Link
            key={tab.value}
            href={`/verification?status=${tab.value}`}
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
        {verifications.map(v => {
          const userObj = Array.isArray(v.user) ? v.user[0] : v.user;
          const user = userObj as Record<string, string> | null;
          return (
            <div key={v.id} className={styles.card}>
              <div className={styles.cardHeaderRow}>
                <div className={styles.cardLeft}>
                  <h3 className={styles.userName}>
                    {user?.name ?? 'Unknown User'}
                  </h3>
                  <p className={styles.userPhone}>
                    Phone: {user?.phone ?? 'N/A'}
                  </p>
                  <div className={styles.idInfo}>
                    <span>{v.id_type}</span>
                    <span>•</span>
                    <span>{v.id_number}</span>
                  </div>
                </div>

                <div className={styles.cardRight}>
                  <span className={`${styles.badge} ${styles[v.status]}`}>
                    {v.status}
                  </span>

                  {v.status === 'pending' && (
                    <VerificationActions verificationId={v.id} />
                  )}
                </div>
              </div>

              {/* Photos Inline */}
              <div className={styles.photosRow}>
                {v.id_photo_url && (
                  <div className={styles.photoBlock}>
                    <span className={styles.photoLabel}>ID Photo</span>
                    <img 
                      src={v.id_photo_url} 
                      alt="ID Document" 
                      className={styles.photoImg}
                    />
                  </div>
                )}
                {v.selfie_url && (
                  <div className={styles.photoBlock}>
                    <span className={styles.photoLabel}>Selfie</span>
                    <img 
                      src={v.selfie_url} 
                      alt="Selfie" 
                      className={styles.photoImg}
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {verifications.length === 0 && (
          <div className={styles.empty}>
            No KYC verifications found
          </div>
        )}
      </div>
    </div>
  );
}
