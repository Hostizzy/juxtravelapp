export default function DashboardLoading() {
  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div
        style={{
          height: '32px',
          width: '200px',
          backgroundColor: '#EAEAEA',
          borderRadius: '6px',
          marginBottom: '16px',
          animation: 'pulse 1.5s infinite ease-in-out',
        }}
      />
      <div
        style={{
          height: '200px',
          width: '100%',
          backgroundColor: '#F5F5F5',
          borderRadius: '12px',
          marginBottom: '24px',
        }}
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        <div style={{ height: '100px', backgroundColor: '#F0F0F0', borderRadius: '8px' }} />
        <div style={{ height: '100px', backgroundColor: '#F0F0F0', borderRadius: '8px' }} />
        <div style={{ height: '100px', backgroundColor: '#F0F0F0', borderRadius: '8px' }} />
      </div>
    </div>
  );
}
