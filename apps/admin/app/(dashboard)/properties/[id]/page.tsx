import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import PropertyActions from './PropertyActions';
import styles from './page.module.css';

async function getProperty(id: string) {
  const { data } = await supabase
    .from('properties')
    .select(`
      *,
      host:users!host_id(
        id, name, phone, email, role
      )
    `)
    .eq('id', id)
    .single();
  return data;
}

export default async function PropertyDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const property = await getProperty(resolvedParams.id);
  if (!property) notFound();

  const location = property.location as Record<string, string>;
  const capacity = property.capacity as Record<string, number>;
  const hostObj = Array.isArray(property.host) ? property.host[0] : property.host;
  const host = hostObj as Record<string, string> | null;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{property.name}</h1>
          <p className={styles.location}>
            Address: {location?.address ?? 'No address'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span className={`${styles.badge} ${styles[property.status]}`}>
            {property.status}
          </span>
          {property.verified_by_admin ? (
            <span className={`${styles.badge} ${styles.verifiedAdmin}`}>
              ✓ Admin Verified
            </span>
          ) : (
            property.status === 'active' && (
              <span className={`${styles.badge} ${styles.needsVerification}`}>
                Needs Review
              </span>
            )
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <PropertyActions
        propertyId={property.id}
        currentStatus={property.status}
        verifiedByAdmin={!!property.verified_by_admin}
      />

      {/* Property Info */}
      <div className={styles.grid}>
        <div className={styles.infoCard}>
          <h3 className={styles.cardTitle}>Property Details</h3>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Type</span>
              <span className={styles.infoValue}>{property.type}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Rooms</span>
              <span className={styles.infoValue}>{capacity?.rooms ?? 'N/A'}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Max Guests</span>
              <span className={styles.infoValue}>{capacity?.maxGuests ?? 'N/A'}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Price/Night</span>
              <span className={styles.infoValue}>
                ₹{property.price_per_night?.toLocaleString('en-IN') ?? '0'}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Rating</span>
              <span className={styles.infoValue}>
                {property.rating ? `${property.rating} / 5` : 'N/A'}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Pet Friendly</span>
              <span className={styles.infoValue}>
                {property.pet_friendly ? 'Yes' : 'No'}
              </span>
            </div>
            {property.verified_at && (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Verified At</span>
                <span className={styles.infoValue}>
                  {new Date(property.verified_at).toLocaleDateString('en-IN')}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className={styles.infoCard}>
          <h3 className={styles.cardTitle}>Host Information</h3>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Name</span>
              <span className={styles.infoValue}>{host?.name ?? 'Unknown'}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Phone</span>
              <span className={styles.infoValue}>{host?.phone ?? 'N/A'}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Email</span>
              <span className={styles.infoValue}>{host?.email ?? 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Amenities */}
      <div className={styles.infoCard}>
        <h3 className={styles.cardTitle}>Amenities</h3>
        <div className={styles.amenities}>
          {(property.amenities as string[] ?? []).length > 0 ? (
            (property.amenities as string[]).map((a: string) => (
              <span key={a} className={styles.amenityChip}>
                {a.replace('_', ' ')}
              </span>
            ))
          ) : (
            <span className={styles.noData}>No amenities listed</span>
          )}
        </div>
      </div>

      {/* Honest Notes */}
      {property.honest_notes && (
        <div className={styles.infoCard}>
          <h3 className={styles.cardTitle}>Host Notes</h3>
          <p className={styles.notes}>{property.honest_notes}</p>
        </div>
      )}

      {/* Photos */}
      {(property.photos as string[] ?? []).length > 0 && (
        <div className={styles.infoCard}>
          <h3 className={styles.cardTitle}>
            Photos ({(property.photos as string[]).length})
          </h3>
          <div className={styles.photos}>
            {(property.photos as string[]).map((url: string, i: number) => (
              <img
                key={i}
                src={url}
                alt={`Photo ${i + 1}`}
                className={styles.photo}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
