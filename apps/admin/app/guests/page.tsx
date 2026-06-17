import { supabase } from '@/lib/supabase';
import styles from './page.module.css';

async function getGuests() {
  const { data } = await supabase
    .from('users')
    .select(`
      *,
      guest_profile:guest_profiles(
        saved_properties
      )
    `)
    .in('role', ['guest', 'both'])
    .order('created_at', { ascending: false });
  return data ?? [];
}

export default async function GuestsPage() {
  const guests = await getGuests();

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Guests</h1>
        <p className={styles.subtitle}>
          {guests.length} guests registered
        </p>
      </div>

      <div className={styles.table}>
        <div className={styles.tableHeader}>
          <span>Guest</span>
          <span>Email</span>
          <span>Phone</span>
          <span>Saved Properties</span>
          <span>Joined</span>
        </div>
        {guests.map(guest => {
          const rawProfile = guest.guest_profile;
          const profile = (Array.isArray(rawProfile) ? rawProfile[0] : rawProfile) as Record<string, any> | null;
          const savedCount = (profile?.saved_properties as string[] ?? []).length;
          
          return (
            <div 
              key={guest.id} 
              className={styles.tableRow}
            >
              <span className={styles.guestName}>
                {guest.name}
              </span>
              <span className={styles.email}>
                {guest.email ?? 'N/A'}
              </span>
              <span className={styles.phone}>
                {guest.phone ?? 'N/A'}
              </span>
              <span>
                <span className={styles.savedBadge}>
                  ⭐ {savedCount} items
                </span>
              </span>
              <span className={styles.date}>
                {new Date(guest.created_at).toLocaleDateString('en-IN')}
              </span>
            </div>
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
