export function EmptyState() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '60px 32px', textAlign: 'center', gap: 12,
    }}>
      <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text2)' }}>No groups yet</p>
      <p style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 1.6 }}>
        Click <strong style={{ color: 'var(--text2)' }}>+</strong> to create your first topic group with matching rules.
      </p>
    </div>
  )
}
