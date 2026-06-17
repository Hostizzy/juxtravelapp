import { supabase } from '@/lib/supabase';
import VerificationActions from './VerificationActions';
import styles from './page.module.css';

async function getVerifications() {
  const { data } = await supabase
    .from('guest_verifications')
    .select(`
      *,
      user:users!user_id(name, phone)
    `)
    .order('created_at', { ascending: false });
  return data ?? [];
}

export default async function VerificationPage() {
  const verifications = await getVerifications();
  const pending = verifications.filter(v => v.status === 'pending');

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          KYC Verification
        </h1>
        <p className={styles.subtitle}>
          {pending.length} pending reviews
        </p>
      </div>

      <div className={styles.list}>
        {verifications.map(v => {
          const user = v.user as Record<string, string>;
          return (
            <div 
              key={v.id} 
              className={styles.card}
            >
              <div className={styles.cardLeft}>
                <h3 className={styles.userName}>
                  {user?.name ?? 'Unknown User'}
                </h3>
                <p className={styles.userPhone}>
                  {user?.phone ?? 'N/A'}
                </p>
                <div className={styles.idInfo}>
                  <span>{v.id_type}</span>
                  <span>•</span>
                  <span>{v.id_number}</span>
                </div>
              </div>

              <div className={styles.cardRight}>
                <span className={`
                  ${styles.badge}
                  ${styles[v.status]}
                `}>
                  {v.status}
                </span>

                {v.id_photo_url && (
                  <a
                    href={v.id_photo_url}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.viewDoc}
                  >
                    View ID Photo →
                  </a>
                )}

                {v.status === 'pending' && (
                  <VerificationActions
                    verificationId={v.id}
                  />
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
