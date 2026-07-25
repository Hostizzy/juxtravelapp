'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Home,
  UserCheck,
  Users,
  Calendar,
  ShieldCheck,
  LogOut,
  Shield,
  History,
  MessageSquare,
  UserCog,
} from 'lucide-react';
import styles from './Sidebar.module.css';

const navItems = [
  {
    href: '/dashboard',
    icon: LayoutDashboard,
    label: 'Dashboard',
  },
  {
    href: '/properties',
    icon: Home,
    label: 'Properties',
  },
  {
    href: '/hosts',
    icon: UserCheck,
    label: 'Hosts',
  },
  {
    href: '/hosts/verification',
    icon: Shield,
    label: 'Host Verification',
  },
  {
    href: '/guests',
    icon: Users,
    label: 'Guests',
  },
  {
    href: '/bookings',
    icon: Calendar,
    label: 'Bookings',
  },
  {
    href: '/verification',
    icon: ShieldCheck,
    label: 'KYC Verification',
  },
  {
    href: '/activity',
    icon: History,
    label: 'Activity Log',
  },
  {
    href: '/conversations',
    icon: MessageSquare,
    label: 'Conversations',
  },
  {
    href: '/admins',
    icon: UserCog,
    label: 'Admins',
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <div className={styles.logoMark} />
        <div>
          <div className={styles.logoText}>JuxTravel</div>
          <div className={styles.logoSub}>Admin Panel</div>
        </div>
      </div>

      <nav className={styles.nav}>
        {navItems.map((item) => {
          const Icon = item.icon;

          // Differentiate host verification from standard host details to prevent double highlight
          const isActive =
            item.href === '/hosts'
              ? pathname === '/hosts' ||
                (pathname.startsWith('/hosts/') &&
                  !pathname.startsWith('/hosts/verification'))
              : pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${isActive ? styles.active : ''}`}
            >
              <span className={styles.navIcon}>
                <Icon size={16} />
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <button onClick={handleLogout} className={styles.logout}>
        <span className={styles.navIcon}>
          <LogOut size={16} />
        </span>
        <span>Logout</span>
      </button>
    </aside>
  );
}
