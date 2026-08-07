'use client';

import { useEffect } from 'react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Dashboard Error:', error);
  }, [error]);

  return (
    <div
      style={{
        padding: '40px 20px',
        textAlign: 'center',
        maxWidth: '500px',
        margin: '60px auto',
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        border: '1px solid #EDECEA',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      }}
    >
      <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1A1F1E', marginBottom: '12px' }}>
        Something went wrong!
      </h2>
      <p style={{ fontSize: '14px', color: '#6B7370', marginBottom: '24px', lineHeight: '20px' }}>
        An unexpected error occurred while loading this page. Please try again.
      </p>
      <button
        onClick={() => reset()}
        style={{
          backgroundColor: '#1A6B5A',
          color: '#FFFFFF',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Try Again
      </button>
    </div>
  );
}
