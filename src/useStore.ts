import { useState, useEffect, useCallback } from 'react'
import { Group, SavedUrls, Settings } from './types'

const DEFAULT_SETTINGS: Settings = {
  dedupeHours: 24,
  uncategorized: false,
  expiryDays: 30,
  groupByDomain: true,
  trackingEnabled: true,
  lightMode: false,
}

function applyTheme(lightMode: boolean) {
  document.documentElement.classList.toggle('light', lightMode)
}

export function useStore() {
  const [groups, setGroups] = useState<Group[]>([])
  const [savedUrls, setSavedUrls] = useState<SavedUrls>({})
  const [settings, setSettingsState] = useState<Settings>(DEFAULT_SETTINGS)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    chrome.storage.local.get(['groups', 'savedUrls', 'settings'], (data) => {
      setGroups(data.groups || [])
      setSavedUrls(data.savedUrls || {})
      const merged = Object.assign({ ...DEFAULT_SETTINGS }, data.settings || {})
      setSettingsState(merged)
      applyTheme(merged.lightMode)
      setLoaded(true)
    })
  }, [])

  const persist = useCallback((updates: { groups?: Group[]; savedUrls?: SavedUrls; settings?: Settings }) => {
    chrome.storage.local.set(updates)
  }, [])

  const updateGroups = useCallback((next: Group[]) => {
    setGroups(next)
    persist({ groups: next })
  }, [persist])

  const updateSavedUrls = useCallback((next: SavedUrls) => {
    setSavedUrls(next)
    persist({ savedUrls: next })
  }, [persist])

  const updateSettings = useCallback((next: Settings) => {
    setSettingsState(next)
    applyTheme(next.lightMode)
    persist({ settings: next })
  }, [persist])

  const reloadSavedUrls = useCallback(() => {
    chrome.storage.local.get(['savedUrls'], (data) => {
      setSavedUrls(data.savedUrls || {})
    })
  }, [])

  return {
    groups, savedUrls, settings, loaded,
    updateGroups, updateSavedUrls, updateSettings, reloadSavedUrls,
  }
}
