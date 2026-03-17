interface HeaderProps {
  onSearchToggle: () => void
  onSettings: () => void
  onNewGroup: () => void
}

const iconBtn: React.CSSProperties = {
  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text2)',
  padding: 6, borderRadius: 6, display: 'flex', alignItems: 'center',
  justifyContent: 'center', transition: 'color 0.15s, background 0.15s',
}

const hoverOn = (e: React.MouseEvent) => {
  const el = e.currentTarget as HTMLElement
  el.style.color = 'var(--text)'
  el.style.background = 'var(--bg3)'
}

const hoverOff = (e: React.MouseEvent) => {
  const el = e.currentTarget as HTMLElement
  el.style.color = 'var(--text2)'
  el.style.background = 'none'
}

export function Header({ onSearchToggle, onSettings, onNewGroup }: HeaderProps) {
  return (
    <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderBottom: '1px solid var(--border)', flexShrink: 0, background: 'var(--bg)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <img src="icons/icon.png" alt="Topic Tracker" style={{ width: 22, height: 22, objectFit: 'contain' }} />
        <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.01em' }}>Topic Tracker</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <button style={iconBtn} title="Search" onClick={onSearchToggle} onMouseEnter={hoverOn} onMouseLeave={hoverOff}>
          <svg viewBox="0 0 20 20" fill="none" width={16} height={16}>
            <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.6" />
            <path d="m13 13 3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
        <button style={iconBtn} title="Settings" onClick={onSettings} onMouseEnter={hoverOn} onMouseLeave={hoverOff}>
          <svg viewBox="0 0 20 20" fill="none" width={16} height={16}>
            <path d="M8.325 3.5a4 4 0 0 1 3.35 0l.657 1.426a5 5 0 0 1 1.414.816l1.513-.326a4 4 0 0 1 1.675 2.9l-1.023 1.156c.06.498.06 1.002 0 1.5l1.023 1.156a4 4 0 0 1-1.675 2.9l-1.513-.326a5 5 0 0 1-1.414.816l-.657 1.426a4 4 0 0 1-3.35 0l-.657-1.426a5 5 0 0 1-1.414-.816l-1.513.326a4 4 0 0 1-1.675-2.9l1.023-1.156a5 5 0 0 1 0-1.5L2.066 7.316a4 4 0 0 1 1.675-2.9l1.513.326a5 5 0 0 1 1.414-.816L8.325 3.5z" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="10" cy="10" r="2" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </button>
        <button style={iconBtn} title="New Group" onClick={onNewGroup} onMouseEnter={hoverOn} onMouseLeave={hoverOff}>
          <svg viewBox="0 0 20 20" fill="none" width={16} height={16}>
            <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </header>
  )
}
