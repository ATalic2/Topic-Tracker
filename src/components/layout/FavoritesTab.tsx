import { Group, SavedEntry, SavedUrls } from '../../types'
import { UrlItem } from '../UrlItem'

interface FavoritesTabProps {
  groups: Group[]
  savedUrls: SavedUrls
  onToggleFavorite: (groupId: string, urlId: string) => void
  onRemove: (groupId: string, urlId: string) => void
}

export function FavoritesTab({ groups, savedUrls, onToggleFavorite, onRemove }: FavoritesTabProps) {
  const favorites: { entry: SavedEntry; group: Group }[] = []

  for (const group of groups) {
    for (const entry of savedUrls[group.id] || []) {
      if (entry.favorited) favorites.push({ entry, group })
    }
  }

  favorites.sort((a, b) => (b.entry.savedAt || 0) - (a.entry.savedAt || 0))

  if (favorites.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 32px', textAlign: 'center', gap: 12 }}>
        <svg viewBox="0 0 24 24" fill="none" width={32} height={32} style={{ color: 'var(--text3)' }}>
          <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text2)' }}>No favorites yet</p>
        <p style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 1.6 }}>
          Hover over any saved URL and click the <span style={{ color: '#eab308' }}>★</span> to favorite it.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div style={{ padding: '10px 14px 4px', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text3)' }}>
        {favorites.length} favorite{favorites.length !== 1 ? 's' : ''}
      </div>
      {favorites.map(({ entry, group }) => (
        <UrlItem
          key={entry.id}
          entry={entry}
          onRemove={() => onRemove(group.id, entry.id)}
          onToggleFavorite={() => onToggleFavorite(group.id, entry.id)}
          showGroupBadge={{ name: group.name, color: group.color }}
        />
      ))}
    </div>
  )
}
