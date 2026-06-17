import React from 'react';
import styles from './DataTable.module.css';

interface Column<T> {
  header: string;
  render: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  headers: string[];
  data: T[];
  renderRow: (item: T) => React.ReactNode;
}

export default function DataTable({ headers, data, renderRow }: DataTableProps<any>) {
  return (
    <div className={styles.table}>
      <div className={styles.tableHeader}>
        {headers.map((h, i) => (
          <span key={i}>{h}</span>
        ))}
      </div>
      {data.map((item, i) => (
        <div key={i} className={styles.tableRow}>
          {renderRow(item)}
        </div>
      ))}
      {data.length === 0 && (
        <div className={styles.empty}>No entries found</div>
      )}
    </div>
  );
}
