import { Settings } from '../types'
import { Toggle } from './Toggle'

interface SettingsModalProps {
  settings: Settings
  onUpdate: (s: Settings) => void
  onExportAll: () => void
  onImport: (file: File) => void
  onClearAll: () => void
  onClose: () => void
}

export function SettingsModal({ settings, onUpdate, onExportAll, onImport, onClearAll, onClose }: SettingsModalProps) {
  const set = (patch: Partial<Settings>) => onUpdate({ ...settings, ...patch })

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em',
    textTransform: 'uppercase', color: 'var(--text2)', marginBottom: 6,
  }
  const hintStyle: React.CSSProperties = { fontSize: 11, color: 'var(--text3)', marginTop: -2, marginBottom: 8, lineHeight: 1.5 }
  const divider = <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '16px 0' }} />
  const inputStyle: React.CSSProperties = {
    width: 80, background: 'var(--bg3)', border: '1px solid var(--border2)',
    borderRadius: 8, padding: '8px 10px', color: 'var(--text)',
    fontFamily: 'inherit', fontSize: 13, outline: 'none',
  }

  return (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 12, width: 340, maxHeight: 540, display: 'flex', flexDirection: 'column', boxShadow: '0 24px 48px rgba(0,0,0,0.5)', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid var(--border)', fontSize: 14, fontWeight: 600, flexShrink: 0 }}>
        <span>Settings</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text2)', padding: 6, borderRadius: 6, display: 'flex' }}>
          <svg viewBox="0 0 20 20" fill="none" width={16} height={16}><path d="m5 5 10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
        </button>
      </div>
      <div style={{ padding: 16, overflowY: 'auto', flex: 1 }}>

        <label style={labelStyle}>Tracking</label>
        <p style={hintStyle}>When disabled, the extension stops saving new URLs entirely. Existing saved URLs are not affected.</p>
        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, cursor: 'pointer' }}>
          <span>Enable tracking</span>
          <Toggle id="tracking" checked={settings.trackingEnabled} onChange={v => set({ trackingEnabled: v })} />
        </label>

        {divider}

        <label style={labelStyle}>Deduplicate within</label>
        <p style={hintStyle}>Don't re-save the same URL within this many hours of last visit.</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input type="number" min={0} max={720} value={settings.dedupeHours} onChange={e => set({ dedupeHours: parseInt(e.target.value) || 24 })} style={inputStyle} />
          <span style={{ fontSize: 12, color: 'var(--text2)' }}>hours</span>
        </div>

        {divider}

        <label style={labelStyle}>URL expiry</label>
        <p style={hintStyle}>Remove saved URLs not visited within this many days. Set to 0 to keep forever.</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input type="number" min={0} max={3650} value={settings.expiryDays} onChange={e => set({ expiryDays: parseInt(e.target.value) || 0 })} style={inputStyle} />
          <span style={{ fontSize: 12, color: 'var(--text2)' }}>days</span>
        </div>

        {divider}

        <label style={labelStyle}>Group by domain</label>
        <p style={hintStyle}>Organise saved URLs within each group into subgroups by their domain.</p>
        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, cursor: 'pointer' }}>
          <span>Enable domain subgroups</span>
          <Toggle id="group-by-domain" checked={!!settings.groupByDomain} onChange={v => set({ groupByDomain: v })} />
        </label>

        {divider}

        <label style={labelStyle}>Uncategorized group</label>
        <p style={hintStyle}>Save pages that don't match any rule into an "Uncategorized" group.</p>
        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, cursor: 'pointer' }}>
          <span>Enable Uncategorized</span>
          <Toggle id="uncategorized" checked={settings.uncategorized} onChange={v => set({ uncategorized: v })} />
        </label>

        {divider}

        <label style={labelStyle}>Data</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
          <button onClick={onExportAll} style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 8, color: 'var(--text2)', fontFamily: 'inherit', fontSize: 13, padding: '8px 14px', cursor: 'pointer', width: '100%' }}>Export all data (JSON)</button>
          <label style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 8, color: 'var(--text2)', fontFamily: 'inherit', fontSize: 13, padding: '8px 14px', cursor: 'pointer', width: '100%', textAlign: 'center' }}>
            Import group or data (JSON)
            <input type="file" accept=".json" style={{ display: 'none' }} onChange={e => { if (e.target.files?.[0]) onImport(e.target.files[0]); e.target.value = '' }} />
          </label>
          <button onClick={onClearAll} style={{ background: 'transparent', border: '1px solid rgba(239,68,68,0.35)', borderRadius: 8, color: 'var(--danger)', fontFamily: 'inherit', fontSize: 13, padding: '8px 14px', cursor: 'pointer', width: '100%' }}>Clear all saved URLs</button>
        </div>
      </div>
    </div>
  )
}
