'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './conversations.module.css';

interface ConvRow {
  id: string;
  created_at: string;
  last_message: string | null;
  last_message_at: string | null;
  guest: { name: string } | null;
  host: { name: string } | null;
  property: { name: string } | null;
  messageCount: number;
  unreadCount?: number;
}

function formatDate(iso: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ConversationsClient() {
  const [conversations, setConversations] = useState<ConvRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/admin/conversations', { cache: 'no-store' });
      if (!res.ok) {
        console.error('Failed to fetch conversations');
        return;
      }
      const json = await res.json();
      const data = json.data ?? json;
      setConversations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Fetch failed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
    // Poll every 5 seconds
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, []);

  const totalUnread = conversations.reduce((sum, c) => sum + (c.unreadCount ?? 0), 0);

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Conversations</h1>
          <p className={styles.pageDesc}>
            All guest–host message threads. You can view and reply to any conversation.
          </p>
        </div>
        <div className={styles.badge}>
          {conversations.length} total {totalUnread > 0 && `• ${totalUnread} unread`}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px', color: '#6B7370' }}>
          Loading conversations...
        </div>
      ) : conversations.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>✉</div>
          <p className={styles.emptyTitle}>No conversations yet</p>
          <p className={styles.emptyDesc}>
            Conversations are automatically created when a booking is confirmed.
          </p>
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Property</th>
                <th>Guest</th>
                <th>Host</th>
                <th>Last Message</th>
                <th>Messages</th>
                <th>Created</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {conversations.map((conv) => (
                <tr key={conv.id}>
                  <td>
                    <span className={styles.propName}>
                      {conv.property?.name ?? '—'}
                    </span>
                  </td>
                  <td>{conv.guest?.name ?? '—'}</td>
                  <td>{conv.host?.name ?? '—'}</td>
                  <td>
                    {conv.last_message ? (
                      <span className={styles.lastMsg}>
                        {conv.last_message.length > 50
                          ? conv.last_message.slice(0, 50) + '…'
                          : conv.last_message}
                      </span>
                    ) : (
                      <span className={styles.noMsg}>No messages</span>
                    )}
                  </td>
                  <td>
                    <span className={styles.msgCount}>
                      {conv.messageCount}
                    </span>
                  </td>
                  <td className={styles.dateCell}>
                    {formatDate(conv.created_at)}
                  </td>
                  <td>
                    <Link
                      href={`/conversations/${conv.id}`}
                      className={styles.viewBtn}
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
