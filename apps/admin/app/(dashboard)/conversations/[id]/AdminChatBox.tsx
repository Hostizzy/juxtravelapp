'use client';
import { useState } from 'react';
import { useAdminReply } from '../../../../hooks/useAdminConversation';

export default function AdminChatBox({
  conversationId,
}: { conversationId: string }) {
  const [text, setText] = useState('');
  const replyMutation = useAdminReply(conversationId);

  const handleSend = async () => {
    if (!text.trim() || replyMutation.isPending) return;
    const msg = text.trim();
    setText('');
    await replyMutation.mutateAsync(msg);
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
        disabled={replyMutation.isPending || !text.trim()}
        style={{ background: '#1A6B5A', color: 'white',
          border: 'none', borderRadius: 8, 
          padding: '0 20px', fontWeight: 600,
          cursor: 'pointer' }}
      >
        {replyMutation.isPending ? 'Sending...' : 'Send'}
      </button>
    </div>
  );
}
