export function TrackingBanner() {
  return (
    <div style={{
      padding: '8px 14px',
      background: 'rgba(239,68,68,0.1)',
      borderBottom: '1px solid rgba(239,68,68,0.2)',
      color: 'var(--danger)',
      fontSize: 11,
      fontFamily: 'DM Mono, monospace',
      textAlign: 'center',
    }}>
      ⏸ Tracking is paused — new URLs are not being saved.
    </div>
  )
}
