import React from 'react';
import styles from './StatsCard.module.css';

interface StatsCardProps {
  icon: string;
  value: string | number;
  label: string;
  isWarning?: boolean;
}

export default function StatsCard({ icon, value, label, isWarning }: StatsCardProps) {
  return (
    <div className={`${styles.card} ${isWarning ? styles.warning : ''}`}>
      <div className={styles.icon}>{icon}</div>
      <div className={styles.value}>{value}</div>
      <div className={styles.label}>{label}</div>
    </div>
  );
}
