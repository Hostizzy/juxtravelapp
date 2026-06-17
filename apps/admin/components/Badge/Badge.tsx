import React from 'react';
import styles from './Badge.module.css';

interface BadgeProps {
  status: string;
  label?: string;
}

export default function Badge({ status, label }: BadgeProps) {
  const displayLabel = label ?? status;
  return (
    <span className={`${styles.badge} ${styles[status] ?? styles.default}`}>
      {displayLabel}
    </span>
  );
}
