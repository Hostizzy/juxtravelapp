'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';

interface Property {
  id: string;
  name: string;
  status: string;
  location: Record<string, any>;
  capacity: Record<string, any>;
  price_per_night: number;
  host?: any;
  verified_by_admin?: boolean;
  created_at: string;
}

export default function PropertiesGrid({
  properties,
}: {
  properties: Property[];
}) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === properties.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(properties.map(p => p.id)));
    }
  };

  const handleBulkUpdate = async (status: string) => {
    if (selectedIds.size === 0) return;
    setLoading(true);
    try {
      const res = await fetch('/api/properties/bulk-update', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          ids: Array.from(selectedIds),
          status,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        console.error('Bulk update failed:', errData);
        alert('Failed to update: ' + (errData.error ?? 'Unknown error'));
        return;
      }

      setSelectedIds(new Set());
      router.refresh();
    } catch (error) {
      console.error('Bulk update error:', error);
      alert('Something went wrong during bulk status update.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Select All Bar */}
      <div className={styles.selectAllBar}>
        <label className={styles.selectAllLabel}>
          <input
            type="checkbox"
            checked={
              selectedIds.size === properties.length &&
              properties.length > 0
            }
            onChange={toggleSelectAll}
          />
          Select All ({properties.length})
        </label>
      </div>

      {/* Grid */}
      <div className={styles.grid}>
        {properties.map(prop => {
          const hostObj = Array.isArray(prop.host) ? prop.host[0] : prop.host;
          const hostName = hostObj?.name ?? 'Unknown';
          const location = prop.location as Record<string, string>;
          const capacity = prop.capacity as Record<string, number>;

          return (
            <div 
              key={prop.id} 
              className={styles.cardWrapper}
            >
              <input
                type="checkbox"
                checked={selectedIds.has(prop.id)}
                onChange={() => toggleSelect(prop.id)}
                onClick={(e) => e.stopPropagation()}
                className={styles.cardCheckbox}
              />
              <Link
                href={`/properties/${prop.id}`}
                className={styles.card}
              >
                <div className={styles.cardHeader}>
                  <div className={styles.cardInfo}>
                    <h3 className={styles.cardName}>
                      {prop.name}
                    </h3>
                    <p className={styles.cardLocation}>
                      {location?.city ?? 'N/A'}, {location?.state ?? 'N/A'}
                    </p>
                  </div>
                  <div className={styles.badgeColumn}>
                    <span className={`${styles.badge} ${styles[prop.status]}`}>
                      {prop.status === 'under_review' ? 'Pending' : prop.status}
                    </span>
                    {prop.verified_by_admin ? (
                      <span className={`${styles.badge} ${styles.verifiedAdmin}`}>
                        ✓ Admin Verified
                      </span>
                    ) : (
                      prop.status === 'active' && (
                        <span className={`${styles.badge} ${styles.needsVerification}`}>
                          Needs Review
                        </span>
                      )
                    )}
                  </div>
                </div>

                <div className={styles.cardMeta}>
                  <span>
                    {capacity?.rooms ?? 0} rooms
                  </span>
                  <span>
                    {capacity?.maxGuests ?? 0} max guests
                  </span>
                  <span>
                    ₹{prop.price_per_night?.toLocaleString('en-IN') ?? 0}/night
                  </span>
                </div>

                <div className={styles.cardFooter}>
                  <span className={styles.hostName}>
                    Host: {hostName}
                  </span>
                  <span className={styles.cardDate}>
                    {new Date(prop.created_at).toLocaleDateString('en-IN')}
                  </span>
                </div>
              </Link>
            </div>
          );
        })}
      </div>

      {/* Floating Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className={styles.bulkBar}>
          <span className={styles.bulkCount}>
            {selectedIds.size} selected
          </span>
          <div className={styles.bulkActions}>
            <button
              onClick={() => handleBulkUpdate('active')}
              className={styles.bulkApproveBtn}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Approve All'}
            </button>
            <button
              onClick={() => handleBulkUpdate('rejected')}
              className={styles.bulkRejectBtn}
              disabled={loading}
            >
              Reject All
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className={styles.bulkCancelBtn}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
