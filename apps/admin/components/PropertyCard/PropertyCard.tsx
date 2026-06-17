import React from 'react';
import Link from 'next/link';
import styles from './PropertyCard.module.css';

interface PropertyCardProps {
  id: string;
  name: string;
  city: string;
  state: string;
  status: string;
  rooms: number;
  maxGuests: number;
  price: number;
  hostName: string;
  createdAt: string;
}

export default function PropertyCard({
  id,
  name,
  city,
  state,
  status,
  rooms,
  maxGuests,
  price,
  hostName,
  createdAt,
}: PropertyCardProps) {
  return (
    <Link href={`/properties/${id}`} className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardInfo}>
          <h3 className={styles.cardName}>{name}</h3>
          <p className={styles.cardLocation}>
            📍 {city}, {state}
          </p>
        </div>
        <span className={`${styles.badge} ${styles[status]}`}>
          {status === 'under_review' ? 'Pending' : status}
        </span>
      </div>

      <div className={styles.cardMeta}>
        <span>🏠 {rooms} rooms</span>
        <span>👥 {maxGuests} max guests</span>
        <span>₹{price.toLocaleString('en-IN')}/night</span>
      </div>

      <div className={styles.cardFooter}>
        <span className={styles.hostName}>Host: {hostName}</span>
        <span className={styles.cardDate}>
          {new Date(createdAt).toLocaleDateString('en-IN')}
        </span>
      </div>
    </Link>
  );
}
