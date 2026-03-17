interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  onClose: () => void
}

export function SearchBar({ value, onChange, onClose }: SearchBarProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderBottom: '1px solid var(--border)', background: 'var(--bg2)', flexShrink: 0 }}>
      <svg viewBox="0 0 20 20" fill="none" width={15} height={15} style={{ color: 'var(--text3)', flexShrink: 0 }}>
        <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.6" />
        <path d="m13 13 3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      <input
        autoFocus
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Search across all groups…"
        style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--text)', fontFamily: 'inherit', fontSize: 13 }}
      />
      <button
        onClick={onClose}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text2)', padding: 4, display: 'flex' }}
      >
        <svg viewBox="0 0 20 20" fill="none" width={14} height={14}>
          <path d="m5 5 10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}
