'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminChatBox({
  conversationId,
}: { conversationId: string }) {
  const router = useRouter();
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch(
        `/api/conversations/${conversationId}/reply`,
        {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json' 
          },
          body: JSON.stringify({ message: text.trim() }),
        }
      );
      if (res.ok) {
        setText('');
        router.refresh();
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ display: 'flex', gap: 8, 
      padding: 16, borderTop: '1px solid #E5E7EB' }}>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Reply as JuxTravel Support..."
        rows={2}
        style={{ flex: 1, padding: 10, 
          borderRadius: 8, border: '1px solid #E5E7EB',
          resize: 'none', fontSize: 14 }}
      />
      <button
        onClick={handleSend}
        disabled={sending || !text.trim()}
        style={{ background: '#1A6B5A', color: 'white',
          border: 'none', borderRadius: 8, 
          padding: '0 20px', fontWeight: 600,
          cursor: 'pointer' }}
      >
        Send
      </button>
    </div>
  );
}
