export default function VerificationLoading() {
  return (
    <div style={{ padding: '24px' }}>
      <div style={{ height: '28px', width: '220px', backgroundColor: '#E0E0E0', borderRadius: '4px', marginBottom: '8px' }} />
      <div style={{ height: '16px', width: '140px', backgroundColor: '#F0F0F0', borderRadius: '4px', marginBottom: '24px' }} />
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{ height: '36px', width: '90px', backgroundColor: '#EAEAEA', borderRadius: '8px' }} />
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ height: '140px', backgroundColor: '#FFFFFF', border: '1px solid #EEEEEE', borderRadius: '12px' }} />
        ))}
      </div>
    </div>
  );
}
