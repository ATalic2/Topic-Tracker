import { Rule } from '../types'

interface RuleRowProps {
  rule: Rule
  onChange: (rule: Rule) => void
  onRemove: () => void
}

export function RuleRow({ rule, onChange, onRemove }: RuleRowProps) {
  const isRegex = rule.type === 'regex'
  let regexValid = true
  if (isRegex && rule.pattern) {
    try { new RegExp(rule.pattern) } catch { regexValid = false }
  }

  const selectStyle: React.CSSProperties = {
    background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 8,
    color: 'var(--text)', fontFamily: 'inherit', fontSize: 11, padding: '0 4px',
    outline: 'none', cursor: 'pointer', flexShrink: 0, maxWidth: 90,
    height: 30, boxSizing: 'border-box',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', overflow: 'hidden' }}>
        <select
          value={rule.type}
          onChange={e => onChange({ ...rule, type: e.target.value as Rule['type'] })}
          style={selectStyle}
        >
          <option value="keyword">keyword</option>
          <option value="regex">regex</option>
        </select>
        <select
          value={rule.matchIn}
          onChange={e => onChange({ ...rule, matchIn: e.target.value as Rule['matchIn'] })}
          style={selectStyle}
        >
          <option value="both">URL+title</option>
          <option value="url">URL only</option>
          <option value="title">title only</option>
        </select>
        <input
          type="text"
          value={rule.pattern}
          onChange={e => onChange({ ...rule, pattern: e.target.value })}
          placeholder="pattern"
          style={{
            flex: 1, minWidth: 0, width: 0, height: 30, boxSizing: 'border-box',
            background: 'var(--bg3)', border: `1px solid ${!regexValid ? 'var(--danger)' : 'var(--border2)'}`,
            borderRadius: 8, padding: '0 8px', color: 'var(--text)',
            fontFamily: 'DM Mono, monospace', fontSize: 11, outline: 'none',
          }}
        />
        <button
          type="button"
          onClick={onRemove}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)',
            padding: 4, borderRadius: 4, display: 'flex', alignItems: 'center', flexShrink: 0,
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--danger)'; (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.1)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text3)'; (e.currentTarget as HTMLElement).style.background = 'none' }}
        >
          <svg viewBox="0 0 16 16" fill="none" width={14} height={14}>
            <path d="m4 4 8 8M12 4 4 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      {!isRegex && (
        <div style={{ paddingLeft: 2 }}>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text2)', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={rule.strictPunctuation}
              onChange={e => onChange({ ...rule, strictPunctuation: e.target.checked })}
              style={{ width: 12, height: 12, accentColor: 'var(--accent)', cursor: 'pointer' }}
            />
            <span>Strict matching</span>
          </label>
        </div>
      )}
    </div>
  )
}
