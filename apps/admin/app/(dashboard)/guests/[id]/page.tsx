import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import VerificationActions from '../../verification/VerificationActions';
import styles from './page.module.css';

// KYC doc columns hold storage paths, not public URLs (bucket is private).
// Sign each one on every read so admin never sees/stores a permanent link.
async function signDocUrl(pathOrUrl: string | null): Promise<string | null> {
  if (!pathOrUrl) return null;
  // Back-compat: old rows hold a full public URL — extract the path after
  // the bucket name so it can still be signed once the bucket goes private.
  const marker = '/verification-docs/';
  const path = pathOrUrl.includes(marker)
    ? pathOrUrl.slice(pathOrUrl.indexOf(marker) + marker.length)
    : pathOrUrl;
  const { data, error } = await supabase.storage
    .from('verification-docs')
    .createSignedUrl(path, 60 * 60);
  if (error) {
    console.error('Failed to sign KYC doc url:', error);
    return null;
  }
  return data.signedUrl;
}

async function getGuestDetail(id: string) {
  const [
    { data: guest, error: guestError },
    { data: verification },
    { data: bookings }
  ] = await Promise.all([
    supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single(),
    supabase
      .from('guest_verifications')
      .select('*')
      .eq('user_id', id)
      .single(),
    supabase
      .from('bookings')
      .select(`
        *,
        property:properties(name)
      `)
      .eq('guest_id', id)
      .order('created_at', { ascending: false }),
  ]);

  if (guestError || !guest) {
    return null;
  }

  const signedVerification = verification
    ? {
        ...verification,
        id_photo_url: await signDocUrl(verification.id_photo_url),
        selfie_url: await signDocUrl(verification.selfie_url),
      }
    : null;

  return {
    guest,
    verification: signedVerification,
    bookings: (bookings ?? []).map((b: any) => {
      const propertyObj = Array.isArray(b.property) ? b.property[0] : b.property;
      return {
        ...b,
        propertyName: propertyObj?.name ?? 'N/A',
      };
    }),
  };
}

export default async function GuestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const detail = await getGuestDetail(resolvedParams.id);
  if (!detail) notFound();

  const { guest, verification, bookings } = detail;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Guest Profile</h1>
        <p className={styles.subtitle}>ID: {guest.id}</p>
      </div>

      <div className={styles.grid}>
        {/* Left: Guest Details */}
        <div className={styles.profileCard}>
          <h3 className={styles.cardTitle}>Account Details</h3>
          
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Name</span>
            <span className={styles.infoValue}>{guest.name}</span>
          </div>

          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Email</span>
            <span className={styles.infoValue}>{guest.email ?? 'N/A'}</span>
          </div>

          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Phone</span>
            <span className={styles.infoValue}>{guest.phone ?? 'N/A'}</span>
          </div>

          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Role</span>
            <span className={styles.infoValue}>{guest.role}</span>
          </div>

          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Joined</span>
            <span className={styles.infoValue}>
              {new Date(guest.created_at).toLocaleDateString('en-IN')}
            </span>
          </div>
        </div>

        {/* Right: KYC & Trips */}
        <div className={styles.mainContent}>
          {/* KYC Card */}
          <div className={styles.section}>
            <h3 className={styles.cardTitle}>KYC Identity Verification</h3>
            
            {verification ? (
              <div className={styles.kycGrid}>
                <div className={styles.kycMeta}>
                  <div className={styles.kycMetaItem}>
                    <span className={styles.infoLabel}>Doc Type</span>
                    <span className={styles.infoValue}>{verification.id_type}</span>
                  </div>
                  <div className={styles.kycMetaItem}>
                    <span className={styles.infoLabel}>Doc Number</span>
                    <span className={styles.infoValue}>{verification.id_number}</span>
                  </div>
                  <div className={styles.kycMetaItem}>
                    <span className={styles.infoLabel}>KYC Status</span>
                    <span className={`${styles.badge} ${styles[verification.status]}`}>
                      {verification.status}
                    </span>
                  </div>
                  
                  {verification.status === 'pending' && (
                    <div style={{ marginLeft: 'auto', alignSelf: 'center' }}>
                      <VerificationActions verificationId={verification.id} />
                    </div>
                  )}
                </div>

                <div className={styles.photosRow}>
                  {verification.id_photo_url && (
                    <div className={styles.photoBlock}>
                      <span className={styles.photoLabel}>ID Photo</span>
                      <img 
                        src={verification.id_photo_url} 
                        alt="ID Document" 
                        className={styles.photoImg}
                      />
                    </div>
                  )}
                  {verification.selfie_url && (
                    <div className={styles.photoBlock}>
                      <span className={styles.photoLabel}>Selfie with ID</span>
                      <img 
                        src={verification.selfie_url} 
                        alt="Selfie" 
                        className={styles.photoImg}
                      />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className={styles.empty}>No KYC verification document submitted yet</div>
            )}
          </div>

          {/* Bookings Section */}
          <div className={styles.section}>
            <h3 className={styles.cardTitle}>Trip History ({bookings.length})</h3>
            <div className={styles.table}>
              <div className={styles.tableHeader}>
                <span>Property</span>
                <span>Dates</span>
                <span>Amount</span>
                <span>Status</span>
              </div>
              {bookings.map((booking: any) => (
                <Link 
                  href={`/bookings/${booking.id}`} 
                  key={booking.id}
                  className={styles.tableRow}
                >
                  <span className={styles.propName}>{booking.propertyName}</span>
                  <span className={styles.dates}>
                    {new Date(booking.check_in).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} - {new Date(booking.check_out).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                  <span className={styles.amount}>₹{booking.total_amount?.toLocaleString('en-IN')}</span>
                  <span>
                    <span className={`${styles.badge} ${styles[booking.status] ?? ''}`}>
                      {booking.status}
                    </span>
                  </span>
                </Link>
              ))}
              {bookings.length === 0 && (
                <div className={styles.empty}>No bookings placed yet</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
