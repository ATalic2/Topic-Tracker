import { useEffect, useRef, useState } from 'react'
import { Group, SavedUrls } from '../../types'
import { buildGroupsWithFavorites, favoritesDomainKey, groupIdsWithFavorites } from '../../functions/favoritesTabModel'
import { FavoriteGroupUrlList } from './FavoriteGroupUrlList'

interface FavoritesTabProps {
  groups: Group[]
  savedUrls: SavedUrls
  groupByDomain: boolean
  onToggleFavorite: (groupId: string, urlId: string) => void
  onRemove: (groupId: string, urlId: string) => void
  onRemoveDomain: (groupId: string, domain: string) => void
}

export function FavoritesTab({
  groups,
  savedUrls,
  groupByDomain,
  onToggleFavorite,
  onRemove,
  onRemoveDomain,
}: FavoritesTabProps) {
  const [collapsed, setCollapsed] = useState<Set<string>>(() => groupIdsWithFavorites(groups, savedUrls))
  const [expandedDomains, setExpandedDomains] = useState<Set<string>>(new Set())
  const defaultedCollapsedRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    setCollapsed(prev => {
      const next = new Set(prev)
      let changed = false
      for (const g of groups) {
        const hasFav = (savedUrls[g.id] || []).some(e => e.favorited)
        if (!hasFav) {
          defaultedCollapsedRef.current.delete(g.id)
          continue
        }
        if (!defaultedCollapsedRef.current.has(g.id)) {
          defaultedCollapsedRef.current.add(g.id)
          if (!next.has(g.id)) {
            next.add(g.id)
            changed = true
          }
        }
      }
      return changed ? next : prev
    })
  }, [groups, savedUrls])

  const toggleCollapse = (groupId: string) => {
    setCollapsed(prev => {
      const next = new Set(prev)
      next.has(groupId) ? next.delete(groupId) : next.add(groupId)
      return next
    })
  }

  const toggleDomain = (groupId: string, domain: string) => {
    const key = favoritesDomainKey(groupId, domain)
    setExpandedDomains(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  const groupsWithFavorites = buildGroupsWithFavorites(groups, savedUrls)
  const totalCount = groupsWithFavorites.reduce((sum, { entries }) => sum + entries.length, 0)

  if (totalCount === 0) {
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
        {totalCount} favorite{totalCount !== 1 ? 's' : ''}
      </div>

      {groupsWithFavorites.map(({ group, entries }) => {
        const isCollapsed = collapsed.has(group.id)
        return (
          <div key={group.id} style={{ borderBottom: '1px solid var(--border)' }}>
            <div
              onClick={() => toggleCollapse(group.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', cursor: 'pointer', transition: 'background 0.1s', userSelect: 'none' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg3)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ''}
            >
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: group.color || '#6366f1', flexShrink: 0, display: 'inline-block' }} />
              <span style={{ fontSize: 12, fontWeight: 600, flex: 1, color: 'var(--text)' }}>{group.name}</span>
              <span style={{ fontSize: 10, fontFamily: 'DM Mono, monospace', color: 'var(--text3)', background: 'var(--bg3)', padding: '1px 6px', borderRadius: 10 }}>
                {entries.length}
              </span>
              <svg
                viewBox="0 0 16 16" fill="none" width={12} height={12}
                style={{ flexShrink: 0, color: 'var(--text3)', transition: 'transform 0.2s', transform: isCollapsed ? 'rotate(-90deg)' : 'none' }}
              >
                <path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            {!isCollapsed && (
              <FavoriteGroupUrlList
                group={group}
                entries={entries}
                groupByDomain={groupByDomain}
                expandedDomains={expandedDomains}
                onToggleDomain={toggleDomain}
                onRemove={onRemove}
                onToggleFavorite={onToggleFavorite}
                onRemoveDomain={onRemoveDomain}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
