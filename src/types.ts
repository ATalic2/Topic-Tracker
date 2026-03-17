export interface Rule {
  type: 'keyword' | 'regex'
  matchIn: 'both' | 'url' | 'title'
  pattern: string
  strictPunctuation: boolean
}

export interface Group {
  id: string
  name: string
  color: string
  rules: Rule[]
  deepScan: boolean
  dynamicScan: boolean
  createdAt: number
}

export interface SavedEntry {
  id: string
  url: string
  title: string
  savedAt: number
  lastSeen: number
  visitCount: number
  favorited?: boolean
}

export interface Settings {
  dedupeHours: number
  uncategorized: boolean
  expiryDays: number
  groupByDomain: boolean
  trackingEnabled: boolean
}

export type SavedUrls = Record<string, SavedEntry[]>
