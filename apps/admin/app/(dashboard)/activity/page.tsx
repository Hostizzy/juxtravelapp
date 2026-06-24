import { supabase } from '@/lib/supabase';
import styles from './page.module.css';

async function getActivityLog() {
  const { data, error } = await supabase
    .from('admin_activity_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    console.error('Error fetching activity log:', error);
    return [];
  }

  return data ?? [];
}

function getRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.max(0, Math.floor(diffMs / 1000));
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

function formatActionText(action: string) {
  return action.replace(/_/g, ' ');
}

export default async function ActivityPage() {
  const logs = await getActivityLog();

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Activity Log</h1>
        <p className={styles.subtitle}>
          Audit trail of admin operations and approvals (showing last 100 entries)
        </p>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Admin Email</th>
              <th>Action</th>
              <th>Target Type</th>
              <th>Target Name</th>
              <th>Details</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className={styles.row}>
                <td className={styles.email}>{log.admin_email}</td>
                <td>
                  <span className={`${styles.actionBadge} ${styles[log.action] ?? styles.defaultAction}`}>
                    {formatActionText(log.action)}
                  </span>
                </td>
                <td className={styles.targetType}>{log.target_type}</td>
                <td className={styles.targetName}>{log.target_name ?? 'N/A'}</td>
                <td className={styles.details}>
                  {log.details && Object.keys(log.details).length > 0 ? (
                    <pre className={styles.jsonPre}>{JSON.stringify(log.details)}</pre>
                  ) : (
                    '-'
                  )}
                </td>
                <td className={styles.time} title={new Date(log.created_at).toLocaleString('en-IN')}>
                  {getRelativeTime(log.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {logs.length === 0 && (
          <div className={styles.empty}>
            No activity logged yet
          </div>
        )}
      </div>
    </div>
  );
}
