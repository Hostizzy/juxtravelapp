import { supabase } from '@/lib/supabase';
import styles from './page.module.css';

async function getHosts() {
  const { data } = await supabase
    .from('users')
    .select(`
      *,
      host_profile:host_profiles(
        verified, verification_status
      )
    `)
    .in('role', ['host', 'both'])
    .order('created_at', { ascending: false });
  return data ?? [];
}

export default async function HostsPage() {
  const hosts = await getHosts();

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Hosts</h1>
        <p className={styles.subtitle}>
          {hosts.length} hosts registered
        </p>
      </div>

      <div className={styles.table}>
        <div className={styles.tableHeader}>
          <span>Host</span>
          <span>Phone</span>
          <span>Role</span>
          <span>Verified</span>
          <span>Joined</span>
        </div>
        {hosts.map(host => {
          const rawProfile = host.host_profile;
          const profile = (Array.isArray(rawProfile) ? rawProfile[0] : rawProfile) as Record<string, any> | null;
          return (
            <div 
              key={host.id} 
              className={styles.tableRow}
            >
              <span className={styles.hostName}>
                {host.name}
              </span>
              <span className={styles.phone}>
                {host.phone ?? 'N/A'}
              </span>
              <span>
                <span className={styles.roleBadge}>
                  {host.role}
                </span>
              </span>
              <span>
                {profile?.verified 
                  ? '✅ Verified' 
                  : '⏳ Pending'}
              </span>
              <span className={styles.date}>
                {new Date(host.created_at).toLocaleDateString('en-IN')}
              </span>
            </div>
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
