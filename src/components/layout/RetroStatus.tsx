interface RetroStatusProps {
  text: string
  kind: 'scanning' | 'done' | 'error' | null
}

export function RetroStatus({ text, kind }: RetroStatusProps) {
  if (!kind) return null

  const styles = {
    scanning: {
      background: 'rgba(99,102,241,0.1)',
      color: 'var(--accent)',
      border: '1px solid rgba(99,102,241,0.2)',
    },
    done: {
      background: 'rgba(16,185,129,0.1)',
      color: '#10b981',
      border: '1px solid rgba(16,185,129,0.2)',
    },
    error: {
      background: 'var(--bg3)',
      color: 'var(--text3)',
      border: '1px solid var(--border)',
    },
  }

  return (
    <div style={{
      margin: '8px 14px',
      padding: '8px 10px',
      borderRadius: 8,
      fontSize: 11,
      fontFamily: 'DM Mono, monospace',
      ...styles[kind],
    }}>
      {text}
    </div>
  )
}
