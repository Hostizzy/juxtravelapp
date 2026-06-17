import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import styles from './page.module.css';

async function getProperties(status?: string) {
  let query = supabase
    .from('properties')
    .select(`
      *,
      host:users!host_id(name, phone)
    `)
    .order('created_at', { ascending: false });

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  const { data } = await query;
  return data ?? [];
}

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const resolvedParams = await searchParams;
  const status = resolvedParams.status ?? 'all';
  const properties = await getProperties(status);

  const tabs = [
    { label: 'All', value: 'all' },
    { label: 'Pending Review', value: 'under_review' },
    { label: 'Active', value: 'active' },
    { label: 'Rejected', value: 'rejected' },
    { label: 'Draft', value: 'draft' },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          Properties
        </h1>
        <p className={styles.subtitle}>
          {properties.length} properties found
        </p>
      </div>

      <div className={styles.tabs}>
        {tabs.map(tab => (
          <Link
            key={tab.value}
            href={`/properties?status=${tab.value}`}
            className={`${styles.tab} ${
              status === tab.value ? styles.tabActive : ''
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <div className={styles.grid}>
        {properties.map(prop => (
          <Link
            key={prop.id}
            href={`/properties/${prop.id}`}
            className={styles.card}
          >
            <div className={styles.cardHeader}>
              <div className={styles.cardInfo}>
                <h3 className={styles.cardName}>
                  {prop.name}
                </h3>
                <p className={styles.cardLocation}>
                  📍 {(prop.location as Record<string, string>)?.city ?? 'N/A'}, {(prop.location as Record<string, string>)?.state ?? 'N/A'}
                </p>
              </div>
              <span className={`
                ${styles.badge} 
                ${styles[prop.status]}
              `}>
                {prop.status === 'under_review' ? 'Pending' : prop.status}
              </span>
            </div>

            <div className={styles.cardMeta}>
              <span>
                🏠 {(prop.capacity as Record<string, number>)?.rooms ?? 0} rooms
              </span>
              <span>
                👥 {(prop.capacity as Record<string, number>)?.maxGuests ?? 0} max guests
              </span>
              <span>
                ₹{prop.price_per_night?.toLocaleString('en-IN') ?? 0}/night
              </span>
            </div>

            <div className={styles.cardFooter}>
              <span className={styles.hostName}>
                Host: {(prop.host as Record<string, string>)?.name ?? 'Unknown'}
              </span>
              <span className={styles.cardDate}>
                {new Date(prop.created_at).toLocaleDateString('en-IN')}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {properties.length === 0 && (
        <div className={styles.empty}>
          No properties found
        </div>
      )}
    </div>
  );
}
