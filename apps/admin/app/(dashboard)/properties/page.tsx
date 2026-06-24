import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import SearchBar from '@/components/SearchBar/SearchBar';
import PropertiesGrid from './PropertiesGrid';
import styles from './page.module.css';

async function getProperties(status?: string, q?: string) {
  let query = supabase
    .from('properties')
    .select(`
      *,
      host:users!host_id(name, phone)
    `)
    .order('created_at', { ascending: false });

  if (status && status !== 'all') {
    if (status === 'needs_verification') {
      query = query.eq('status', 'active').eq('verified_by_admin', false);
    } else {
      query = query.eq('status', status);
    }
  }

  if (q) {
    query = query.ilike('name', `%${q}%`);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching properties:', error);
    return [];
  }
  return data ?? [];
}

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const resolvedParams = await searchParams;
  const status = resolvedParams.status ?? 'all';
  const queryVal = resolvedParams.q ?? '';
  const properties = await getProperties(status, queryVal);

  const tabs = [
    { label: 'All', value: 'all' },
    { label: 'Pending Review', value: 'under_review' },
    { label: 'Active', value: 'active' },
    { label: 'Needs Verification', value: 'needs_verification' },
    { label: 'Rejected', value: 'rejected' },
    { label: 'Draft', value: 'draft' },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Properties</h1>
        <p className={styles.subtitle}>
          {properties.length} properties found
        </p>
      </div>

      <div className={styles.tabs}>
        {tabs.map(tab => (
          <Link
            key={tab.value}
            href={`/properties?status=${tab.value}${queryVal ? `&q=${encodeURIComponent(queryVal)}` : ''}`}
            className={`${styles.tab} ${
              status === tab.value ? styles.tabActive : ''
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <SearchBar placeholder="Search properties..." />

      <PropertiesGrid properties={properties} />

      {properties.length === 0 && (
        <div className={styles.empty}>
          No properties found
        </div>
      )}
    </div>
  );
}
