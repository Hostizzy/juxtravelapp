'use client';

import { useState } from 'react';
import { adminFetch } from '@/lib/adminFetch';
import styles from './detail.module.css';

interface Props {
  conversationId: string;
}

export default function AdminReplyBox({ conversationId }: Props) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    const text = message.trim();
    if (!text || sending) return;
    setSending(true);
    setError(null);
    setSent(false);

    try {
      const res = await adminFetch(`/api/conversations/${conversationId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });

      if (!res.ok) {
        const json = await res.json() as { error?: string };
        throw new Error(json.error ?? 'Failed to send');
      }

      setMessage('');
      setSent(true);
      // Reload to show new message
      setTimeout(() => window.location.reload(), 600);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(msg);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={styles.replyBox}>
      <div className={styles.replyLabel}>Reply as Admin</div>
      <textarea
        className={styles.replyTextarea}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message to guest and host…"
        rows={3}
        maxLength={2000}
        disabled={sending}
      />
      {error && <p className={styles.replyError}>{error}</p>}
      {sent && <p className={styles.replySent}>Message sent!</p>}
      <button
        className={styles.replyBtn}
        onClick={handleSend}
        disabled={!message.trim() || sending}
      >
        {sending ? 'Sending…' : 'Send Message'}
      </button>
    </div>
  );
}
