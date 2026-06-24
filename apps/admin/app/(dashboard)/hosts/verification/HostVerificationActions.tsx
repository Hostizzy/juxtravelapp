'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function HostVerificationActions({
  hostId,
}: {
  hostId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const updateStatus = async (status: 'approved' | 'rejected') => {
    setLoading(true);
    try {
      await fetch(`/api/hosts/${hostId}/verify`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status }),
      });
      router.refresh();
    } catch (error) {
      console.error('Failed to update host verification status:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.actions}>
      <button
        onClick={() => updateStatus('approved')}
        className={styles.approveBtn}
        disabled={loading}
      >
        Approve
      </button>
      <button
        onClick={() => updateStatus('rejected')}
        className={styles.rejectBtn}
        disabled={loading}
      >
        Reject
      </button>
    </div>
  );
}
