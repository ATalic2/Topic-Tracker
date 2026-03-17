import { Group, SavedEntry } from '../../types'
import { getDomain, formatDate } from '../../utils'

interface SearchResultsProps {
  query: string
  results: { entry: SavedEntry; group: Group }[]
}

export function SearchResults({ query, results }: SearchResultsProps) {
  return (
    <div>
      <div style={{ padding: '10px 14px 4px', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text3)' }}>
        Search results
      </div>
      {results.length === 0 ? (
        <div style={{ padding: '24px 14px', color: 'var(--text3)', fontSize: 12, textAlign: 'center' }}>
          No results for "{query}"
        </div>
      ) : (
        results.slice(0, 50).map(({ entry, group }) => {
          const domain = getDomain(entry.url)
          return (
            <div
              key={entry.id}
              style={{ padding: '8px 14px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 8, alignItems: 'flex-start' }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'var(--bg2)')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = '')}
            >
              <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 8, fontWeight: 600, flexShrink: 0, marginTop: 2, fontFamily: 'DM Mono, monospace', background: `${group.color}22`, color: group.color }}>
                {group.name}
              </span>
              <img
                src={`https://www.google.com/s2/favicons?domain=${domain}&sz=16`}
                alt="" width={14} height={14}
                style={{ marginTop: 3, flexShrink: 0 }}
                onError={e => ((e.target as HTMLImageElement).style.display = 'none')}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <a
                  href={entry.url}
                  onClick={e => { e.preventDefault(); chrome.tabs.create({ url: entry.url }) }}
                  style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textDecoration: 'none' }}
                >
                  {entry.title || entry.url}
                </a>
                <div style={{ display: 'flex', gap: 8, marginTop: 1 }}>
                  <span style={{ fontSize: 10, fontFamily: 'DM Mono, monospace', color: 'var(--text3)' }}>{domain}</span>
                  <span style={{ fontSize: 10, fontFamily: 'DM Mono, monospace', color: 'var(--text3)' }}>{formatDate(entry.savedAt)}</span>
                </div>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
