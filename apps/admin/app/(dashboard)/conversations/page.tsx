import Link from 'next/link';
import styles from './conversations.module.css';

interface ConvRow {
  id: string;
  booking_id: string;
  guest_id: string;
  host_id: string;
  property_id: string;
  created_at: string;
  last_message: string | null;
  last_message_at: string | null;
  guest: { name: string } | null;
  host: { name: string } | null;
  property: { name: string } | null;
  messageCount: number;
}

async function getConversations(): Promise<ConvRow[]> {
  const backendUrl =
    process.env.BACKEND_URL || 'https://juxtravelapp.onrender.com/api/v1';
  try {
    const res = await fetch(
      `${backendUrl}/conversations/admin/all`,
      { cache: 'no-store' }
    );
    if (!res.ok) {
      console.error(`Failed to fetch conversations from backend. Status: ${res.status}`);
      return [];
    }
    const json = await res.json();
    return (json.data ?? json) as ConvRow[];
  } catch (error) {
    console.error('Fetch all conversations failed:', error);
    return [];
  }
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

export default async function ConversationsPage() {
  const conversations = await getConversations();

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Conversations</h1>
          <p className={styles.pageDesc}>
            All guest–host message threads. You can view and reply to any conversation.
          </p>
        </div>
        <div className={styles.badge}>{conversations.length} total</div>
      </div>

      {conversations.length === 0 ? (
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
