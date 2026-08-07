export default function MainDashboardLoading() {
  return (
    <div style={{ padding: '24px' }}>
      <div style={{ height: '32px', width: '240px', backgroundColor: '#E0E0E0', borderRadius: '4px', marginBottom: '24px' }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{ height: '90px', backgroundColor: '#FFFFFF', border: '1px solid #EEEEEE', borderRadius: '12px' }} />
        ))}
      </div>
      <div style={{ height: '300px', backgroundColor: '#FFFFFF', border: '1px solid #EEEEEE', borderRadius: '12px' }} />
    </div>
  );
}
