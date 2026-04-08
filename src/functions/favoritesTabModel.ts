import { Group, SavedEntry, SavedUrls } from '../types'

/** Stable key for expanded-domain state (group + domain). */
export function favoritesDomainKey(groupId: string, domain: string) {
  return `${groupId}\u001f${domain}`
}

export function groupIdsWithFavorites(groups: Group[], savedUrls: SavedUrls): Set<string> {
  const ids = new Set<string>()
  for (const g of groups) {
    if ((savedUrls[g.id] || []).some(e => e.favorited)) ids.add(g.id)
  }
  return ids
}

export type GroupWithFavoriteEntries = { group: Group; entries: SavedEntry[] }

export function buildGroupsWithFavorites(groups: Group[], savedUrls: SavedUrls): GroupWithFavoriteEntries[] {
  return groups
    .map(group => ({
      group,
      entries: (savedUrls[group.id] || [])
        .filter(e => e.favorited)
        .sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0)),
    }))
    .filter(({ entries }) => entries.length > 0)
}
