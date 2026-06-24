'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function PropertyActions({
  propertyId,
  currentStatus,
  verifiedByAdmin,
}: {
  propertyId: string;
  currentStatus: string;
  verifiedByAdmin: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState('');
  const [showReject, setShowReject] = useState(false);

  const updateStatus = async (status: string, rejectionReason?: string, verified?: boolean) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/properties/${propertyId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ 
          status,
          rejection_reason: rejectionReason,
          verified
        }),
      });

      if (res.ok) {
        router.refresh();
        setShowReject(false);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.actions}>
      {currentStatus === 'under_review' && (
        <>
          <button
            onClick={() => updateStatus('active')}
            className={styles.approveBtn}
            disabled={loading}
          >
            Approve Property
          </button>
          <button
            onClick={() => setShowReject(true)}
            className={styles.rejectBtn}
            disabled={loading}
          >
            Reject Property
          </button>
        </>
      )}

      {currentStatus === 'active' && (
        <button
          onClick={() => updateStatus('draft')}
          className={styles.pauseBtn}
          disabled={loading}
        >
          Pause Listing
        </button>
      )}

      {currentStatus === 'rejected' && (
        <button
          onClick={() => updateStatus('active')}
          className={styles.approveBtn}
          disabled={loading}
        >
          Re-approve Property
        </button>
      )}

      {!verifiedByAdmin && (
        <button
          onClick={() => updateStatus(currentStatus, undefined, true)}
          className={styles.verifyBtn}
          disabled={loading}
        >
          Verify Property
        </button>
      )}

      {showReject && (
        <div className={styles.rejectForm}>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="Reason for rejection..."
            className={styles.rejectInput}
            rows={3}
          />
          <div className={styles.rejectButtons}>
            <button
              onClick={() => updateStatus('rejected', reason)}
              className={styles.rejectBtn}
              disabled={loading || !reason}
            >
              Confirm Reject
            </button>
            <button
              onClick={() => setShowReject(false)}
              className={styles.cancelBtn}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
