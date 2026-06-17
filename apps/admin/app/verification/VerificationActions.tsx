'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function VerificationActions({
  verificationId,
}: {
  verificationId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const updateStatus = async (status: string) => {
    setLoading(true);
    try {
      await fetch(`/api/verification/${verificationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.actions}>
      <button
        onClick={() => updateStatus('verified')}
        className={styles.approveBtn}
        disabled={loading}
      >
        ✅ Approve
      </button>
      <button
        onClick={() => updateStatus('rejected')}
        className={styles.rejectBtn}
        disabled={loading}
      >
        ❌ Reject
      </button>
    </div>
  );
}
