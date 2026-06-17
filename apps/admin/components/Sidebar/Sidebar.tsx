'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Sidebar.module.css';

const navItems = [
  { 
    href: '/dashboard', 
    icon: '📊', 
    label: 'Dashboard' 
  },
  { 
    href: '/properties', 
    icon: '🏠', 
    label: 'Properties' 
  },
  { 
    href: '/hosts', 
    icon: '👤', 
    label: 'Hosts' 
  },
  { 
    href: '/guests', 
    icon: '🧳', 
    label: 'Guests' 
  },
  { 
    href: '/bookings', 
    icon: '📅', 
    label: 'Bookings' 
  },
  { 
    href: '/verification', 
    icon: '✅', 
    label: 'KYC Verification' 
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', 
      { method: 'POST' }
    );
    window.location.href = '/login';
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <span className={styles.logoIcon}>
          🌿
        </span>
        <div>
          <div className={styles.logoText}>
            JuxTravel
          </div>
          <div className={styles.logoSub}>
            Admin Panel
          </div>
        </div>
      </div>

      <nav className={styles.nav}>
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.navItem} ${
              pathname.startsWith(item.href) 
                ? styles.active : ''
            }`}
          >
            <span className={styles.navIcon}>
              {item.icon}
            </span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <button
        onClick={handleLogout}
        className={styles.logout}
      >
        🚪 Logout
      </button>
    </aside>
  );
}
