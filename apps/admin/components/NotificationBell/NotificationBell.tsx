'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Bell } from 'lucide-react';
import styles from './NotificationBell.module.css';

export interface NotificationCounts {
  pendingProperties: number;
  pendingKyc: number;
  pendingHosts: number;
  total: number;
}

export default function NotificationBell({
  counts,
}: {
  counts: NotificationCounts;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={styles.container} ref={containerRef}>
      <button 
        className={styles.bellBtn} 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle notifications"
      >
        <Bell size={20} className={styles.bellIcon} />
        {counts.total > 0 && (
          <span className={styles.badge}>{counts.total}</span>
        )}
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownHeader}>
            <h3>Notifications</h3>
            <span>{counts.total} pending action items</span>
          </div>

          <div className={styles.dropdownContent}>
            {counts.pendingProperties > 0 && (
              <Link 
                href="/properties?status=under_review" 
                className={styles.dropdownItem}
                onClick={() => setIsOpen(false)}
              >
                <span className={styles.itemDot} />
                <span>{counts.pendingProperties} propert{counts.pendingProperties === 1 ? 'y' : 'ies'} pending review</span>
              </Link>
            )}

            {counts.pendingKyc > 0 && (
              <Link 
                href="/verification?status=pending" 
                className={styles.dropdownItem}
                onClick={() => setIsOpen(false)}
              >
                <span className={styles.itemDot} />
                <span>{counts.pendingKyc} guest verification{counts.pendingKyc === 1 ? '' : 's'} pending</span>
              </Link>
            )}

            {counts.pendingHosts > 0 && (
              <Link 
                href="/hosts/verification?status=pending" 
                className={styles.dropdownItem}
                onClick={() => setIsOpen(false)}
              >
                <span className={styles.itemDot} />
                <span>{counts.pendingHosts} host verification{counts.pendingHosts === 1 ? '' : 's'} pending</span>
              </Link>
            )}

            {counts.total === 0 && (
              <div className={styles.empty}>
                No pending notifications
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
