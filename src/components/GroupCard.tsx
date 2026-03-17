import { useState } from 'react'
import { Group, SavedEntry, SavedUrls } from '../types'
import { getDomain } from '../utils'
import { UrlItem } from './UrlItem'

interface GroupCardProps {
  group: Group
  urls: SavedEntry[]
  groupByDomain: boolean
  onEdit: () => void
  onExport: () => void
  onRemoveUrl: (urlId: string) => void
  onRemoveDomain: (domain: string) => void
  onToggleFavorite: (urlId: string) => void
  isUncategorized: boolean
}

export function GroupCard({
  group, urls, groupByDomain, onEdit, onExport,
  onRemoveUrl, onRemoveDomain, onToggleFavorite, isUncategorized
}: GroupCardProps) {
  const [open, setOpen] = useState(false)
  const [showAll, setShowAll] = useState(false)
  const [expandedDomains, setExpandedDomains] = useState<Set<string>>(new Set())

  const sorted = [...urls].sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0))
  const atCap = sorted.length >= 475

  const toggleDomain = (domain: string) => {
    setExpandedDomains(prev => {
      const next = new Set(prev)
      next.has(domain) ? next.delete(domain) : next.add(domain)
      return next
    })
  }

  const renderFlat = () => {
    const displayed = showAll ? sorted : sorted.slice(0, 5)
    return (
      <>
        {displayed.map(entry => (
          <UrlItem key={entry.id} entry={entry} onRemove={() => onRemoveUrl(entry.id)} onToggleFavorite={() => onToggleFavorite(entry.id)} />
        ))}
        {sorted.length > 5 && !showAll && (
          <button
            onClick={() => setShowAll(true)}
            style={{ padding: '6px 32px', fontSize: 11, color: 'var(--text3)', background: 'none', border: 'none', cursor: 'pointer', display: 'block', width: '100%', textAlign: 'left' }}
            onMouseEnter={e => ((e.target as HTMLElement).style.textDecoration = 'underline')}
            onMouseLeave={e => ((e.target as HTMLElement).style.textDecoration = 'none')}
          >
            Show {sorted.length - 5} more…
          </button>
        )}
        {sorted.length > 5 && showAll && (
          <button
            onClick={() => setShowAll(false)}
            style={{ padding: '6px 32px', fontSize: 11, color: 'var(--text3)', background: 'none', border: 'none', cursor: 'pointer', display: 'block', width: '100%', textAlign: 'left' }}
            onMouseEnter={e => ((e.target as HTMLElement).style.textDecoration = 'underline')}
            onMouseLeave={e => ((e.target as HTMLElement).style.textDecoration = 'none')}
          >
            Show less
          </button>
        )}
      </>
    )
  }

  const renderByDomain = () => {
    const buckets: Record<string, SavedEntry[]> = {}
    for (const entry of sorted) {
      const d = getDomain(entry.url)
      if (!buckets[d]) buckets[d] = []
      buckets[d].push(entry)
    }
    const sortedDomains = Object.keys(buckets).sort((a, b) => (buckets[b][0].savedAt || 0) - (buckets[a][0].savedAt || 0))

    return (
      <>
        {sortedDomains.map(domain => {
          const entries = buckets[domain]
          const isOpen = expandedDomains.has(domain)
          const favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=16`
          return (
            <div key={domain} style={{ borderBottom: '1px solid var(--border)' }}>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px 6px 20px', cursor: 'pointer', transition: 'background 0.1s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg3)'; const btn = (e.currentTarget as HTMLElement).querySelector('.domain-del-btn') as HTMLElement; if (btn) btn.style.opacity = '1' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ''; const btn = (e.currentTarget as HTMLElement).querySelector('.domain-del-btn') as HTMLElement; if (btn) btn.style.opacity = '0' }}
              >
                <img src={favicon} alt="" width={14} height={14} style={{ borderRadius: 2, flexShrink: 0 }} onError={e => ((e.target as HTMLImageElement).style.display = 'none')} />
                <span onClick={() => toggleDomain(domain)} style={{ fontSize: 11, fontWeight: 600, color: 'var(--text2)', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: 'DM Mono, monospace', cursor: 'pointer' }}>{domain}</span>
                <span style={{ fontSize: 10, fontFamily: 'DM Mono, monospace', color: 'var(--text3)', background: 'var(--bg3)', padding: '1px 6px', borderRadius: 10 }}>{entries.length}</span>
                <button
                  className="domain-del-btn"
                  onClick={e => { e.stopPropagation(); onRemoveDomain(domain) }}
                  title={`Remove all from ${domain}`}
                  style={{ opacity: 0, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', padding: '2px 4px', borderRadius: 4, display: 'flex', alignItems: 'center', flexShrink: 0, transition: 'opacity 0.15s, color 0.15s' }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'var(--danger)')}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'var(--text3)')}
                >
                  <svg viewBox="0 0 12 12" fill="none" width={11} height={11}>
                    <path d="M2 3h8M5 3V2h2v1M4.5 9.5l-.5-5M7.5 9.5l.5-5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                </button>
                <svg onClick={() => toggleDomain(domain)} viewBox="0 0 16 16" fill="none" width={12} height={12} style={{ flexShrink: 0, transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'none', cursor: 'pointer' }}>
                  <path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              {isOpen && entries.map(entry => (
                <UrlItem key={entry.id} entry={entry} onRemove={() => onRemoveUrl(entry.id)} onToggleFavorite={() => onToggleFavorite(entry.id)} />
              ))}
            </div>
          )
        })}
      </>
    )
  }

  return (
    <div style={{ borderBottom: '1px solid var(--border)' }} className={`group-card ${open ? 'open' : ''}`}>
      {/* Header */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', cursor: 'pointer', transition: 'background 0.1s', userSelect: 'none' }}
        className="group-header"
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg2)'; (e.currentTarget as HTMLElement).querySelectorAll('.hov-btn').forEach((b: Element) => ((b as HTMLElement).style.opacity = '1')) }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ''; (e.currentTarget as HTMLElement).querySelectorAll('.hov-btn').forEach((b: Element) => ((b as HTMLElement).style.opacity = '0')) }}
      >
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: group.color || '#6366f1', flexShrink: 0, display: 'inline-block' }} />
        <span style={{ fontSize: 13, fontWeight: 600, flex: 1, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{group.name}</span>
        {group.deepScan && <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', background: 'rgba(99,102,241,0.15)', color: 'var(--accent)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 4, padding: '1px 5px', flexShrink: 0 }}>deep</span>}
        {group.dynamicScan && <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 4, padding: '1px 5px', flexShrink: 0 }}>dynamic</span>}
        <span style={{ fontSize: 11, fontFamily: 'DM Mono, monospace', color: 'var(--text3)', background: 'var(--bg3)', padding: '1px 6px', borderRadius: 10, flexShrink: 0 }}>{urls.length}</span>
        {!isUncategorized && (
          <>
            <button className="hov-btn" onClick={e => { e.stopPropagation(); onEdit() }} title="Edit group" style={{ opacity: 0, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text2)', padding: 6, borderRadius: 6, display: 'flex', alignItems: 'center', transition: 'color 0.15s, background 0.15s' }} onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text)'; (e.currentTarget as HTMLElement).style.background = 'var(--bg3)' }} onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text2)'; (e.currentTarget as HTMLElement).style.background = 'none' }}>
              <svg viewBox="0 0 16 16" fill="none" width={16} height={16}><path d="M11.013 2.5a1.5 1.5 0 0 1 2.121 2.121L5.5 12.256l-2.828.707.707-2.828L11.013 2.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" /></svg>
            </button>
            <button className="hov-btn" onClick={e => { e.stopPropagation(); onExport() }} title="Export group" style={{ opacity: 0, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text2)', padding: 6, borderRadius: 6, display: 'flex', alignItems: 'center', transition: 'color 0.15s, background 0.15s' }} onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text)'; (e.currentTarget as HTMLElement).style.background = 'var(--bg3)' }} onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text2)'; (e.currentTarget as HTMLElement).style.background = 'none' }}>
              <svg viewBox="0 0 16 16" fill="none" width={16} height={16}><path d="M8 2v8M5 7l3 3 3-3M3 11v2h10v-2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </>
        )}
        <svg className="group-chevron" viewBox="0 0 16 16" fill="none" width={14} height={14} style={{ color: 'var(--text3)', flexShrink: 0 }}>
          <path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* URL list */}
      <div className="url-list">
        <div style={{ padding: '4px 0 6px' }}>
          {atCap && (
            <div style={{ margin: '6px 14px 2px', padding: '6px 10px', borderRadius: 8, background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.25)', color: '#eab308', fontSize: 11, fontFamily: 'DM Mono, monospace', lineHeight: 1.5 }}>
              ⚠ {sorted.length}/500 URLs saved — oldest entries will be dropped when the limit is reached.
            </div>
          )}
          {sorted.length === 0
            ? <div style={{ padding: '12px 32px', fontSize: 11, color: 'var(--text3)', fontStyle: 'italic' }}>No pages saved yet — browse and matching pages will appear here.</div>
            : groupByDomain ? renderByDomain() : renderFlat()
          }
        </div>
      </div>
    </div>
  )
}
