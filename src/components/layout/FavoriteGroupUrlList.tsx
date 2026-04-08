import { Group, SavedEntry } from '../../types'
import { getDomain } from '../../utils'
import { UrlItem } from '../UrlItem'
import { favoritesDomainKey } from '../../functions/favoritesTabModel'

export interface FavoriteGroupUrlListProps {
  group: Group
  entries: SavedEntry[]
  groupByDomain: boolean
  expandedDomains: Set<string>
  onToggleDomain: (groupId: string, domain: string) => void
  onRemove: (groupId: string, urlId: string) => void
  onToggleFavorite: (groupId: string, urlId: string) => void
  onRemoveDomain: (groupId: string, domain: string) => void
}

export function FavoriteGroupUrlList({
  group,
  entries,
  groupByDomain,
  expandedDomains,
  onToggleDomain,
  onRemove,
  onToggleFavorite,
  onRemoveDomain,
}: FavoriteGroupUrlListProps) {
  if (!groupByDomain) {
    return (
      <>
        {entries.map((entry: SavedEntry) => (
          <UrlItem
            key={entry.id}
            entry={entry}
            onRemove={() => onRemove(group.id, entry.id)}
            onToggleFavorite={() => onToggleFavorite(group.id, entry.id)}
          />
        ))}
      </>
    )
  }

  const buckets: Record<string, SavedEntry[]> = {}
  for (const entry of entries) {
    const d = getDomain(entry.url)
    if (!buckets[d]) buckets[d] = []
    buckets[d].push(entry)
  }
  const sortedDomains = Object.keys(buckets).sort((a, b) => (buckets[b][0].savedAt || 0) - (buckets[a][0].savedAt || 0))

  return (
    <>
      {sortedDomains.map(domain => {
        const domainEntries = buckets[domain]
        const dk = favoritesDomainKey(group.id, domain)
        const domainOpen = expandedDomains.has(dk)
        const favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=16`
        return (
          <div key={domain} style={{ borderBottom: '1px solid var(--border)' }}>
            <div
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px 6px 20px', cursor: 'pointer', transition: 'background 0.1s' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = 'var(--bg3)'
                const btn = (e.currentTarget as HTMLElement).querySelector('.domain-del-btn') as HTMLElement
                if (btn) btn.style.opacity = '1'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = ''
                const btn = (e.currentTarget as HTMLElement).querySelector('.domain-del-btn') as HTMLElement
                if (btn) btn.style.opacity = '0'
              }}
            >
              <img src={favicon} alt="" width={14} height={14} style={{ borderRadius: 2, flexShrink: 0 }} onError={e => ((e.target as HTMLImageElement).style.display = 'none')} />
              <span
                onClick={() => onToggleDomain(group.id, domain)}
                style={{ fontSize: 11, fontWeight: 600, color: 'var(--text2)', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: 'DM Mono, monospace', cursor: 'pointer' }}
              >
                {domain}
              </span>
              <span style={{ fontSize: 10, fontFamily: 'DM Mono, monospace', color: 'var(--text3)', background: 'var(--bg3)', padding: '1px 6px', borderRadius: 10 }}>
                {domainEntries.length}
              </span>
              <button
                className="domain-del-btn"
                onClick={e => {
                  e.stopPropagation()
                  onRemoveDomain(group.id, domain)
                }}
                title={`Remove all from ${domain}`}
                style={{ opacity: 0, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', padding: '2px 4px', borderRadius: 4, display: 'flex', alignItems: 'center', flexShrink: 0, transition: 'opacity 0.15s, color 0.15s' }}
                onMouseEnter={e => ((e.target as HTMLElement).style.color = 'var(--danger)')}
                onMouseLeave={e => ((e.target as HTMLElement).style.color = 'var(--text3)')}
              >
                <svg viewBox="0 0 12 12" fill="none" width={11} height={11}>
                  <path d="M2 3h8M5 3V2h2v1M4.5 9.5l-.5-5M7.5 9.5l.5-5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
              </button>
              <svg
                onClick={() => onToggleDomain(group.id, domain)}
                viewBox="0 0 16 16"
                fill="none"
                width={12}
                height={12}
                style={{ flexShrink: 0, transition: 'transform 0.2s', transform: domainOpen ? 'rotate(180deg)' : 'none', cursor: 'pointer' }}
              >
                <path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            {domainOpen &&
              domainEntries.map((entry: SavedEntry) => (
                <UrlItem
                  key={entry.id}
                  entry={entry}
                  onRemove={() => onRemove(group.id, entry.id)}
                  onToggleFavorite={() => onToggleFavorite(group.id, entry.id)}
                />
              ))}
          </div>
        )
      })}
    </>
  )
}
