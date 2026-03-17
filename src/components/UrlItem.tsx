import { SavedEntry } from '../types'
import { getDomain, formatDate } from '../utils'

interface UrlItemProps {
  entry: SavedEntry
  onRemove: () => void
  onToggleFavorite: () => void
  showGroupBadge?: { name: string; color: string }
}

export function UrlItem({ entry, onRemove, onToggleFavorite, showGroupBadge }: UrlItemProps) {
  const domain = getDomain(entry.url)
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=16`

  return (
    <div
      style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '6px 14px 6px 32px', transition: 'background 0.1s' }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'var(--bg3)'
        e.currentTarget.querySelectorAll<HTMLElement>('.hov-action').forEach(el => el.style.opacity = '1')
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = ''
        e.currentTarget.querySelectorAll<HTMLElement>('.hov-action').forEach(el => {
          // keep star visible if favorited
          const isStar = el.dataset.favorited === 'true'
          el.style.opacity = isStar ? '1' : '0'
        })
      }}
    >
      <img
        src={faviconUrl} alt="" width={14} height={14}
        style={{ borderRadius: 2, flexShrink: 0, marginTop: 2, background: 'var(--bg4)', objectFit: 'contain' }}
        onError={e => ((e.target as HTMLImageElement).style.display = 'none')}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        {showGroupBadge && (
          <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 8, fontWeight: 600, fontFamily: 'DM Mono, monospace', background: `${showGroupBadge.color}22`, color: showGroupBadge.color, marginBottom: 2, display: 'inline-block' }}>
            {showGroupBadge.name}
          </span>
        )}
        <a
          href={entry.url}
          onClick={e => { e.preventDefault(); chrome.tabs.create({ url: entry.url }) }}
          title={entry.title}
          style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textDecoration: 'none', lineHeight: 1.4 }}
          onMouseEnter={e => ((e.target as HTMLElement).style.color = 'var(--accent)')}
          onMouseLeave={e => ((e.target as HTMLElement).style.color = 'var(--text)')}
        >
          {entry.title || entry.url}
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 1 }}>
          <span style={{ fontSize: 10, fontFamily: 'DM Mono, monospace', color: 'var(--text3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }}>{domain}</span>
          <span style={{ fontSize: 10, fontFamily: 'DM Mono, monospace', color: 'var(--text3)', flexShrink: 0 }}>{formatDate(entry.savedAt)}</span>
        </div>
      </div>

      {/* Star / favorite button */}
      <button
        className="hov-action"
        data-favorited={entry.favorited ? 'true' : 'false'}
        onClick={onToggleFavorite}
        title={entry.favorited ? 'Unfavorite' : 'Favorite'}
        style={{
          opacity: entry.favorited ? 1 : 0,
          background: 'none', border: 'none', cursor: 'pointer',
          padding: 2, display: 'flex', alignItems: 'center',
          transition: 'opacity 0.15s, color 0.15s', flexShrink: 0,
          color: entry.favorited ? '#eab308' : 'var(--text3)',
        }}
        onMouseEnter={e => (e.currentTarget.style.color = '#eab308')}
        onMouseLeave={e => (e.currentTarget.style.color = entry.favorited ? '#eab308' : 'var(--text3)')}
      >
        <svg viewBox="0 0 12 12" fill={entry.favorited ? 'currentColor' : 'none'} width={12} height={12}>
          <path d="M6 1l1.4 2.8 3.1.45-2.25 2.19.53 3.1L6 8.1l-2.78 1.46.53-3.1L1.5 4.25l3.1-.45Z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Remove button */}
      <button
        className="hov-action"
        data-favorited="false"
        onClick={onRemove}
        title="Remove"
        style={{ opacity: 0, background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: 'var(--text3)', display: 'flex', alignItems: 'center', transition: 'opacity 0.15s, color 0.15s', flexShrink: 0 }}
        onMouseEnter={e => (e.currentTarget.style.color = 'var(--danger)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'var(--text3)')}
      >
        <svg viewBox="0 0 12 12" fill="none" width={12} height={12}>
          <path d="m2 2 8 8M10 2 2 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}
