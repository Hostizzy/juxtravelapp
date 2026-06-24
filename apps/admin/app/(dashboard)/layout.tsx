import { getAdminUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/Sidebar/Sidebar';
import NotificationBell from '@/components/NotificationBell/NotificationBell';
import { supabase } from '@/lib/supabase';
import styles from './layout.module.css';

async function getNotificationCounts() {
  const [
    { count: pendingProps }, 
    { count: pendingKyc }, 
    { count: pendingHosts }
  ] = await Promise.all([
    supabase
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'under_review'),
    supabase
      .from('guest_verifications')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending'),
    supabase
      .from('host_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('verification_status', 'pending'),
  ]);

  const total = (pendingProps ?? 0) + (pendingKyc ?? 0) + (pendingHosts ?? 0);

  return {
    pendingProperties: pendingProps ?? 0,
    pendingKyc: pendingKyc ?? 0,
    pendingHosts: pendingHosts ?? 0,
    total,
  };
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAdminUser();
  if (!user) redirect('/login');

  const notificationCounts = await getNotificationCounts();

  return (
    <div className={styles.layout}>
      <Sidebar />
      <div className={styles.main}>
        <header className={styles.header}>
          <div className={styles.headerTitle}>JuxTravel Control Center</div>
          <div className={styles.headerRight}>
            <NotificationBell counts={notificationCounts} />
            <div className={styles.userEmail}>
              Logged in as <strong>{user.name}</strong>
            </div>
          </div>
        </header>
        <main className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
}
