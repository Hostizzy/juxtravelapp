'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminFetch } from '@/lib/adminFetch';
import styles from './page.module.css';

export default function BookingStatusForm({
  bookingId,
  currentStatus,
}: {
  bookingId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      const res = await adminFetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        setSuccess(true);
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.statusContainer}>
      <form onSubmit={handleSubmit} className={styles.statusForm}>
        <div className={styles.statusGroup}>
          <label htmlFor="status" className={styles.statusLabel}>
            Update Booking Status
          </label>
          <div className={styles.inputWrapper}>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={styles.select}
              disabled={loading}
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading || status === currentStatus}
            >
              {loading ? 'Saving...' : 'Update Status'}
            </button>
          </div>
        </div>
      </form>
      {success && <div className={styles.successMsg}>Status updated successfully!</div>}
    </div>
  );
}
