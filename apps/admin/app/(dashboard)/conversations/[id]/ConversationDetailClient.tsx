'use client';

import { useEffect, useState } from 'react';
import AdminChatBox from './AdminChatBox';
import styles from './detail.module.css';

interface MessageRow {
  id: string;
  sender_id: string | null;
  sender_type: 'guest' | 'host' | 'admin' | 'system';
  content: string;
  created_at: string;
  sender?: { name: string } | null;
}

interface ConvDetail {
  id: string;
  booking_id: string;
  guest_id: string;
  host_id: string;
  created_at: string;
  guest: { name: string } | null;
  host: { name: string } | null;
  property: { name: string } | null;
}

function formatTs(iso: string) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ConversationDetailClient({ conversationId }: { conversationId: string }) {
  const [conv, setConv] = useState<ConvDetail | null>(null);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDetail = async () => {
    try {
      const res = await fetch(`/api/admin/conversations/${conversationId}`, { cache: 'no-store' });
      if (!res.ok) return;
      const json = await res.json();
      if (json.conv) setConv(json.conv);
      if (Array.isArray(json.messages)) setMessages(json.messages);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
    // Poll every 3 seconds for real-time messages
    const interval = setInterval(fetchDetail, 3000);
    return () => clearInterval(interval);
  }, [conversationId]);

  if (loading && !conv) {
    return <div style={{ padding: 32, textAlign: 'center', color: '#6B7370' }}>Loading conversation...</div>;
  }

  if (!conv) {
    return <div style={{ padding: 32, textAlign: 'center', color: '#6B7370' }}>Conversation not found</div>;
  }

  const guestName = conv.guest?.name ?? 'Guest';
  const hostName = conv.host?.name ?? 'Host';
  const propertyName = conv.property?.name ?? 'Conversation';

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <a href="/conversations" className={styles.back}>← Conversations</a>
        <div>
          <h1 className={styles.title}>{propertyName}</h1>
          <p className={styles.subtitle}>
            Guest: <strong>{guestName}</strong> &harr; Host: <strong>{hostName}</strong>
          </p>
        </div>
      </div>

      {/* Chat thread */}
      <div className={styles.thread}>
        {messages.length === 0 ? (
          <div className={styles.emptyThread}>No messages yet in this conversation.</div>
        ) : (
          messages.map((msg) => {
            if (msg.sender_type === 'system') {
              return (
                <div key={msg.id} className={styles.systemMsg}>
                  <span className={styles.systemIcon}>&#9432;</span>
                  {msg.content}
                  <span className={styles.msgTs} style={{ marginLeft: 8 }}>{formatTs(msg.created_at)}</span>
                </div>
              );
            }

            const isGuest = msg.sender_type === 'guest';
            const isHost = msg.sender_type === 'host';
            const isAdmin = msg.sender_type === 'admin';

            let senderLabel = 'Unknown';
            if (isGuest) {
              senderLabel = msg.sender?.name ?? guestName;
            } else if (isHost) {
              senderLabel = msg.sender?.name ?? hostName;
            } else if (isAdmin) {
              senderLabel = 'Admin';
            }

            const formattedTime = formatTs(msg.created_at);

            return (
              <div key={msg.id} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                  <span style={{
                    fontWeight: 600,
                    fontSize: 13,
                    color: msg.sender_type === 'admin' ? '#D4704A' : (msg.sender_type === 'host' ? '#1A6B5A' : '#374151')
                  }}>
                    {senderLabel}
                  </span>
                  <span style={{ fontSize: 11, color: '#9CA3AF' }}>
                    {formattedTime}
                  </span>
                </div>
                <div style={{
                  background: msg.sender_type === 'admin' ? '#FEF2F2' : (msg.sender_type === 'host' ? '#ECFDF5' : '#F9FAFB'),
                  border: '1px solid #E5E7EB',
                  borderRadius: 10,
                  padding: '10px 14px',
                  maxWidth: 480,
                  fontSize: 14,
                  color: '#111827',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}>
                  {msg.content}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Admin reply box */}
      <AdminChatBox conversationId={conv.id} />
    </div>
  );
}
