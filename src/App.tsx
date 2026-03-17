import { useState } from 'react'
import { useStore } from './useStore'
import { Group, SavedEntry } from './types'
import { getDomain } from './utils'

import { GroupCard } from './components/GroupCard'
import { GroupModal } from './components/GroupModal'
import { SettingsModal } from './components/SettingsModal'
import { ExportModal } from './components/ExportModal'

import { Header } from './components/layout/Header'
import { SearchBar } from './components/layout/SearchBar'
import { SearchResults } from './components/layout/SearchResults'
import { TrackingBanner } from './components/layout/TrackingBanner'
import { EmptyState } from './components/layout/EmptyState'
import { ModalOverlay } from './components/layout/ModalOverlay'
import { FavoritesTab } from './components/layout/FavoritesTab'

type Modal =
  | { type: 'group'; group: Group | null }
  | { type: 'settings' }
  | { type: 'export'; group: Group }
  | null

type Tab = 'groups' | 'favorites'

export default function App() {
  const { groups, savedUrls, settings, loaded, updateGroups, updateSavedUrls, updateSettings, reloadSavedUrls } = useStore()
  const [modal, setModal] = useState<Modal>(null)
  const [search, setSearch] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('groups')

  if (!loaded) return null

  // ── SEARCH ──
  const groupResults: { entry: SavedEntry; group: Group }[] = []
  const favoriteResults: { entry: SavedEntry; group: Group }[] = []

  if (search.trim()) {
    const q = search.toLowerCase()
    for (const group of groups) {
      for (const entry of savedUrls[group.id] || []) {
        const matches = entry.title?.toLowerCase().includes(q) || entry.url.toLowerCase().includes(q)
        if (matches) {
          groupResults.push({ entry, group })
          if (entry.favorited) favoriteResults.push({ entry, group })
        }
      }
    }
  }

  // ── GROUP SAVE ──
  const handleSaveGroup = (
    savedGroup: Group,
    retroValue: string,
    retroDate: string,
    onStatus: (text: string, kind: 'scanning' | 'done' | 'error') => void
  ) => {
    const existing = groups.find(g => g.id === savedGroup.id)
    const rulesChanged = JSON.stringify(existing?.rules || []) !== JSON.stringify(savedGroup.rules)

    const nextGroups = existing
      ? groups.map(g => g.id === savedGroup.id ? savedGroup : g)
      : [...groups, savedGroup]
    updateGroups(nextGroups)

    if (rulesChanged && savedGroup.rules.length > 0) {
      chrome.runtime.sendMessage({ type: 'SCAN_OPEN_TABS', group: savedGroup }, () => {
        reloadSavedUrls()
      })
    }

    if (retroValue !== 'none' && savedGroup.rules.length > 0) {
      let startTime: number
      if (retroValue === 'custom') {
        if (!retroDate) { setModal(null); return }
        startTime = new Date(retroDate).getTime()
      } else {
        startTime = Date.now() - parseInt(retroValue) * 24 * 60 * 60 * 1000
      }

      onStatus('⏳ Scanning history…', 'scanning')

      chrome.runtime.sendMessage({ type: 'RETRO_SCAN', group: savedGroup, startTime }, (response) => {
        if (!response) {
          onStatus('Scan failed — try again.', 'error')
          return
        }
        const count = response.matchCount
        onStatus(
          count > 0
            ? `✓ Found ${count} match${count === 1 ? '' : 'es'} in history`
            : '✓ Scan complete — no matches found',
          'done'
        )
        reloadSavedUrls()
        setTimeout(() => setModal(null), 1800)
      })
    } else {
      setModal(null)
    }
  }

  // ── GROUP DELETE ──
  const handleDeleteGroup = (groupId: string) => {
    const group = groups.find(g => g.id === groupId)
    if (!confirm(`Delete group "${group?.name}"? Saved URLs will also be removed.`)) return
    const nextUrls = { ...savedUrls }
    delete nextUrls[groupId]
    updateGroups(groups.filter(g => g.id !== groupId))
    updateSavedUrls(nextUrls)
    setModal(null)
  }

  // ── URL REMOVE ──
  const handleRemoveUrl = (groupId: string, urlId: string) => {
    updateSavedUrls({ ...savedUrls, [groupId]: (savedUrls[groupId] || []).filter(e => e.id !== urlId) })
  }

  const handleRemoveDomain = (groupId: string, domain: string) => {
    updateSavedUrls({ ...savedUrls, [groupId]: (savedUrls[groupId] || []).filter(e => getDomain(e.url) !== domain) })
  }

  // ── TOGGLE FAVORITE ──
  const handleToggleFavorite = (groupId: string, urlId: string) => {
    updateSavedUrls({
      ...savedUrls,
      [groupId]: (savedUrls[groupId] || []).map(e =>
        e.id === urlId ? { ...e, favorited: !e.favorited } : e
      ),
    })
  }

  // ── EXPORT ALL ──
  const handleExportAll = () => {
    const data = { groups, savedUrls, exportedAt: new Date().toISOString() }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `topic-tracker-export-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // ── IMPORT ──
  const handleImport = (file: File) => {
    const reader = new FileReader()
    reader.onload = e => {
      try {
        const data = JSON.parse(e.target?.result as string)
        if (data.group && data.urls) {
          const importedGroup = data.group
          if (groups.find(g => g.id === importedGroup.id)) importedGroup.id = `group-${Date.now()}`
          updateGroups([...groups, importedGroup])
          updateSavedUrls({ ...savedUrls, [importedGroup.id]: data.urls })
        } else if (data.groups && data.savedUrls) {
          const newGroups = [...groups]
          const newUrls = { ...savedUrls }
          for (const g of data.groups) {
            if (!groups.find(existing => existing.id === g.id)) {
              newGroups.push(g)
              newUrls[g.id] = data.savedUrls[g.id] || []
            }
          }
          updateGroups(newGroups)
          updateSavedUrls(newUrls)
        } else {
          alert('Unrecognised file format.')
        }
        setModal(null)
      } catch { alert('Failed to parse JSON file.') }
    }
    reader.readAsText(file)
  }

  // ── CLEAR ALL ──
  const handleClearAll = () => {
    if (!confirm('Clear ALL saved URLs across all groups? Groups and rules will remain.')) return
    updateSavedUrls({})
    setModal(null)
  }

  // ── GROUPS ──
  const visibleGroups = groups.filter(g => g.id !== '__uncategorized__')
  const uncatGroup: Group | null = settings.uncategorized
    ? { id: '__uncategorized__', name: 'Uncategorized', color: '#55555f', rules: [], deepScan: false, dynamicScan: false, createdAt: 0 }
    : null
  const allGroups = uncatGroup ? [...visibleGroups, uncatGroup] : visibleGroups

  const favoritesCount = Object.values(savedUrls).flat().filter(e => e.favorited).length

  const openNewGroup = () => setModal({ type: 'group', group: null })
  const openEditGroup = (group: Group) => setModal({ type: 'group', group })
  const closeSearch = () => { setSearch(''); setSearchOpen(false) }

  const tabStyle = (tab: Tab): React.CSSProperties => ({
    flex: 1, background: 'none', border: 'none', cursor: 'pointer',
    fontFamily: 'inherit', fontSize: 12, fontWeight: 600,
    padding: '8px 0', borderBottom: `2px solid ${activeTab === tab ? 'var(--accent)' : 'transparent'}`,
    color: activeTab === tab ? 'var(--text)' : 'var(--text3)',
    transition: 'color 0.15s, border-color 0.15s',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
  })

  const isSearching = search.trim().length > 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 600, background: 'var(--bg)' }}>

      <Header
        onSearchToggle={() => { setSearchOpen(o => !o); if (searchOpen) setSearch('') }}
        onSettings={() => setModal({ type: 'settings' })}
        onNewGroup={openNewGroup}
      />

      {/* TAB BAR */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', flexShrink: 0, background: 'var(--bg)' }}>
        <button style={tabStyle('groups')} onClick={() => setActiveTab('groups')}>Groups</button>
        <button style={tabStyle('favorites')} onClick={() => setActiveTab('favorites')}>
          Favorites
          {favoritesCount > 0 && (
            <span style={{ fontSize: 10, fontFamily: 'DM Mono, monospace', background: 'rgba(234,179,8,0.15)', color: '#eab308', border: '1px solid rgba(234,179,8,0.3)', borderRadius: 10, padding: '0px 5px' }}>
              {favoritesCount}
            </span>
          )}
        </button>
      </div>

      {searchOpen && (
        <SearchBar value={search} onChange={setSearch} onClose={closeSearch} />
      )}

      <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {!settings.trackingEnabled && <TrackingBanner />}

        {activeTab === 'favorites' ? (
          isSearching ? (
            <SearchResults query={search} results={favoriteResults} />
          ) : (
            <FavoritesTab
              groups={groups}
              savedUrls={savedUrls}
              onToggleFavorite={handleToggleFavorite}
              onRemove={handleRemoveUrl}
            />
          )
        ) : isSearching ? (
          <SearchResults query={search} results={groupResults} />
        ) : allGroups.length === 0 ? (
          <EmptyState />
        ) : (
          allGroups.map(group => (
            <GroupCard
              key={group.id}
              group={group}
              urls={savedUrls[group.id] || []}
              groupByDomain={!!settings.groupByDomain}
              onEdit={() => openEditGroup(group)}
              onExport={() => setModal({ type: 'export', group })}
              onRemoveUrl={urlId => handleRemoveUrl(group.id, urlId)}
              onRemoveDomain={domain => handleRemoveDomain(group.id, domain)}
              onToggleFavorite={urlId => handleToggleFavorite(group.id, urlId)}
              isUncategorized={group.id === '__uncategorized__'}
            />
          ))
        )}
      </main>

      {modal && (
        <ModalOverlay onClose={() => setModal(null)}>
          {modal.type === 'group' && (
            <GroupModal
              group={modal.group}
              onSave={handleSaveGroup}
              onDelete={() => modal.group && handleDeleteGroup(modal.group.id)}
              onClose={() => setModal(null)}
            />
          )}
          {modal.type === 'settings' && (
            <SettingsModal
              settings={settings}
              onUpdate={updateSettings}
              onExportAll={handleExportAll}
              onImport={handleImport}
              onClearAll={handleClearAll}
              onClose={() => setModal(null)}
            />
          )}
          {modal.type === 'export' && (
            <ExportModal
              group={modal.group}
              urls={savedUrls[modal.group.id] || []}
              onClose={() => setModal(null)}
            />
          )}
        </ModalOverlay>
      )}

    </div>
  )
}
