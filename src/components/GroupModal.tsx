import { useState, useEffect } from 'react'
import { Group, Rule } from '../types'
import { RuleRow } from './RuleRow'
import { Toggle } from './Toggle'
import { SectionToggle } from './SectionToggle'
import { COLORS } from '../utils'

interface GroupModalProps {
  group: Group | null
  onSave: (group: Group, retroValue: string, retroDate: string, onStatus: (text: string, kind: 'scanning' | 'done' | 'error') => void) => void
  onDelete: () => void
  onClose: () => void
}

type RetroKind = 'scanning' | 'done' | 'error' | null

const DEFAULT_RULE: Rule = { type: 'keyword', matchIn: 'both', pattern: '', strictPunctuation: false }

export function GroupModal({ group, onSave, onDelete, onClose }: GroupModalProps) {
  const [name, setName] = useState(group?.name || '')
  const [color, setColor] = useState(group?.color || '#6366f1')
  const [rules, setRules] = useState<Rule[]>(group?.rules?.length ? group.rules : [{ ...DEFAULT_RULE }])
  const [deepScan, setDeepScan] = useState(group?.deepScan || false)
  const [dynamicScan, setDynamicScan] = useState(group?.dynamicScan || false)
  const [retroValue, setRetroValue] = useState('none')
  const [retroDate, setRetroDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [retroStatus, setRetroStatus] = useState<{ text: string; kind: RetroKind }>({ text: '', kind: null })

  useEffect(() => {
    if (dynamicScan) setDeepScan(true)
  }, [dynamicScan])

  const handleDeepScanChange = (checked: boolean) => {
    setDeepScan(checked)
    if (!checked) setDynamicScan(false)
  }

  const updateRule = (index: number, rule: Rule) => {
    const next = [...rules]
    next[index] = rule
    setRules(next)
  }

  const removeRule = (index: number) => setRules(rules.filter((_, i) => i !== index))
  const addRule = () => setRules([...rules, { ...DEFAULT_RULE }])

  const handleSave = () => {
    if (!name.trim() || saving) return
    setSaving(true)
    const validRules = rules.filter(r => r.pattern.trim())
    const savedGroup: Group = {
      id: group?.id || `group-${Date.now()}`,
      name: name.trim(),
      color,
      rules: validRules,
      deepScan: deepScan || dynamicScan,
      dynamicScan,
      createdAt: group?.createdAt || Date.now(),
    }
    onSave(savedGroup, retroValue, retroDate, (text, kind) => {
      setRetroStatus({ text, kind })
    })
  }

  const hasKeywordRules = rules.some(r => r.type === 'keyword')
  const hasRegexRules = rules.some(r => r.type === 'regex')

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em',
    textTransform: 'uppercase', color: 'var(--text2)', marginBottom: 6,
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', background: 'var(--bg3)', border: '1px solid var(--border2)',
    borderRadius: 8, padding: '8px 10px', color: 'var(--text)',
    fontFamily: 'inherit', fontSize: 13, outline: 'none',
  }

  const hintStyle: React.CSSProperties = {
    fontSize: 11, color: 'var(--text3)', lineHeight: 1.5, marginTop: 6,
  }

  const divider = <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '16px 0' }} />

  const retroStatusColors = {
    scanning: { bg: 'rgba(99,102,241,0.1)', color: 'var(--accent)', border: 'rgba(99,102,241,0.2)' },
    done:     { bg: 'rgba(16,185,129,0.1)', color: '#10b981',       border: 'rgba(16,185,129,0.2)' },
    error:    { bg: 'var(--bg3)',           color: 'var(--text3)',   border: 'var(--border)' },
  }

  return (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 12, width: 340, maxHeight: 540, display: 'flex', flexDirection: 'column', boxShadow: '0 24px 48px rgba(0,0,0,0.5)', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid var(--border)', fontSize: 14, fontWeight: 600, flexShrink: 0 }}>
        <span>{group ? 'Edit Group' : 'New Group'}</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text2)', padding: 6, borderRadius: 6, display: 'flex' }}>
          <svg viewBox="0 0 20 20" fill="none" width={16} height={16}><path d="m5 5 10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
        </button>
      </div>

      {/* Body */}
      <div style={{ padding: 16, overflowY: 'auto', flex: 1 }}>
        <label style={labelStyle}>Group name</label>
        <input
          type="text" value={name} onChange={e => setName(e.target.value)}
          placeholder="e.g. Recipes, Travel, Tech News…"
          style={inputStyle}
          onFocus={e => ((e.target as HTMLElement).style.boxShadow = '0 0 0 3px var(--accent-glow)')}
          onBlur={e => ((e.target as HTMLElement).style.boxShadow = '')}
        />

        <label style={{ ...labelStyle, marginTop: 16 }}>Color</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {COLORS.map(c => (
            <button key={c} type="button" className={`color-dot${color === c ? ' selected' : ''}`} data-color={c} style={{ background: c }} onClick={() => setColor(c)} />
          ))}
        </div>

        <label style={{ ...labelStyle, marginTop: 16 }}>
          Rules <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: 'var(--text3)', fontSize: 11 }}>— match URL or title</span>
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {rules.map((rule, i) => (
            <RuleRow key={i} rule={rule} onChange={r => updateRule(i, r)} onRemove={() => removeRule(i)} />
          ))}
        </div>

        {/* Consolidated rule hints — shown once below all rules */}
        {(hasKeywordRules || hasRegexRules) && (
          <div style={{ marginTop: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {hasKeywordRules && (
              <p style={hintStyle}>
                <strong style={{ color: 'var(--text2)' }}>Strict matching</strong> — when checked, accents and apostrophes are significant (e.g. café ≠ cafe, it's ≠ its).
              </p>
            )}
            {hasRegexRules && (
              <p style={hintStyle}>
                <strong style={{ color: 'var(--text2)' }}>Regex</strong> — no delimiters needed, case insensitive by default. Write the pattern directly.
              </p>
            )}
          </div>
        )}

        <button
          type="button" onClick={addRule}
          style={{ background: 'none', border: '1px dashed var(--border2)', borderRadius: 8, color: 'var(--text2)', fontFamily: 'inherit', fontSize: 12, padding: '7px 12px', cursor: 'pointer', width: '100%', marginTop: 8, transition: 'border-color 0.15s, color 0.15s, background 0.15s' }}
          onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--accent)'; el.style.color = 'var(--accent)'; el.style.background = 'var(--accent-glow)' }}
          onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--border2)'; el.style.color = 'var(--text2)'; el.style.background = 'none' }}
        >
          + Add rule
        </button>

        {divider}

        <SectionToggle label="Deep Scan" hint="— also match inside page content" defaultOpen={!!(group?.deepScan || group?.dynamicScan)}>
          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, cursor: 'pointer' }}>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: 13 }}>Enable deep scan for this group</span>
              <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 3, lineHeight: 1.5 }}>Reads full page text on each visit. Catches mentions in forum posts, articles, etc.</p>
              {deepScan && <p style={{ fontSize: 11, color: '#f97316', marginTop: 3, lineHeight: 1.5 }}>⚠ May impact browser performance on heavy pages.</p>}
            </div>
            <div style={{ marginLeft: 12, flexShrink: 0 }}>
              <Toggle id="deep-scan" checked={deepScan} onChange={handleDeepScanChange} disabled={dynamicScan} />
            </div>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, cursor: 'pointer' }}>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: 13 }}>Watch dynamic content</span>
              <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 3, lineHeight: 1.5 }}>Scans content added after page load — e.g. new posts on live forums. Uses a 2s debounce.</p>
              {dynamicScan && <p style={{ fontSize: 11, color: '#f97316', marginTop: 3, lineHeight: 1.5 }}>⚠ May impact browser performance on pages with frequent live updates.</p>}
            </div>
            <div style={{ marginLeft: 12, flexShrink: 0 }}>
              <Toggle id="dynamic-scan" checked={dynamicScan} onChange={setDynamicScan} />
            </div>
          </label>
        </SectionToggle>

        <div style={{ marginTop: 8 }}>
          <SectionToggle label="Retroactive Scan" hint="— search your past history">
            <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 8, lineHeight: 1.5 }}>After saving, scan your browser history for matches and import them into this group.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
              {[
                { value: 'none', label: "Don't scan" },
                { value: '7', label: 'Last 7 days' },
                { value: '30', label: 'Last 30 days' },
                { value: 'custom', label: 'Custom date' },
              ].map(opt => (
                <label key={opt.value} className="retro-radio">
                  <input type="radio" name="retro" value={opt.value} checked={retroValue === opt.value} onChange={() => setRetroValue(opt.value)} />
                  {opt.label}
                </label>
              ))}
            </div>
            {retroValue === 'custom' && (
              <input type="date" value={retroDate} onChange={e => setRetroDate(e.target.value)} style={{ ...inputStyle, marginTop: 8 }} />
            )}
            {retroStatus.kind && (
              <div style={{
                marginTop: 10, padding: '7px 10px', borderRadius: 8,
                fontSize: 11, fontFamily: 'DM Mono, monospace',
                background: retroStatusColors[retroStatus.kind].bg,
                color: retroStatusColors[retroStatus.kind].color,
                border: `1px solid ${retroStatusColors[retroStatus.kind].border}`,
              }}>
                {retroStatus.text}
              </div>
            )}
          </SectionToggle>
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderTop: '1px solid var(--border)', flexShrink: 0, gap: 8 }}>
        {group ? (
          <button onClick={onDelete} style={{ background: 'var(--danger)', border: 'none', borderRadius: 8, color: '#fff', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, padding: '8px 14px', cursor: 'pointer' }}>Delete group</button>
        ) : <div />}
        <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
          <button onClick={onClose} style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 8, color: 'var(--text2)', fontFamily: 'inherit', fontSize: 13, padding: '8px 14px', cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleSave} disabled={saving} style={{ background: saving ? 'var(--bg4)' : 'var(--accent)', border: 'none', borderRadius: 8, color: '#fff', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, padding: '8px 16px', cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.6 : 1 }}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
