export default function PropertiesLoading() {
  return (
    <div style={{ padding: '24px' }}>
      <div style={{ height: '28px', width: '190px', backgroundColor: '#E0E0E0', borderRadius: '4px', marginBottom: '8px' }} />
      <div style={{ height: '16px', width: '140px', backgroundColor: '#F0F0F0', borderRadius: '4px', marginBottom: '24px' }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat( auto-fill, minmax(280px, 1fr) )', gap: '16px' }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{ height: '220px', backgroundColor: '#FFFFFF', border: '1px solid #EEEEEE', borderRadius: '12px' }} />
        ))}
      </div>
    </div>
  );
}
