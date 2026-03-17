export function escHtml(str: string): string {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function getDomain(url: string): string {
  try { return new URL(url).hostname } catch { return url }
}

export function formatDate(ts: number): string {
  if (!ts) return ''
  const d = new Date(ts)
  const diff = Date.now() - d.getTime()
  if (diff < 60000) return 'just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export const COLORS = [
  '#6366f1', '#ec4899', '#f97316', '#10b981',
  '#ef4444', '#eab308', '#8b5cf6', '#06b6d4',
  '#84cc16', '#ffffff',
]
