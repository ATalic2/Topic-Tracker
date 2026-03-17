import { useState, ReactNode } from 'react'

interface SectionToggleProps {
  label: ReactNode
  hint?: string
  defaultOpen?: boolean
  children: ReactNode
}

export function SectionToggle({ label, hint, defaultOpen = false, children }: SectionToggleProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          width: '100%', background: 'var(--bg3)', border: `1px solid ${open ? 'var(--accent)' : 'var(--border2)'}`,
          borderRadius: '8px', padding: '8px 10px', cursor: 'pointer',
          color: open ? 'var(--text)' : 'var(--text2)', fontFamily: 'inherit', fontSize: '12px',
          transition: 'background 0.15s, color 0.15s',
        }}
      >
        <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          {label}
          {hint && <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: 'var(--text3)', fontSize: '11px' }}> {hint}</span>}
        </span>
        <svg
          viewBox="0 0 16 16" fill="none" width={14} height={14}
          style={{ flexShrink: 0, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }}
        >
          <path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && <div style={{ marginTop: 4 }}>{children}</div>}
    </div>
  )
}
