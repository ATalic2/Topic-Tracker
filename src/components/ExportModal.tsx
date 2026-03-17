import { Group, SavedEntry } from '../types'

interface ExportModalProps {
  group: Group
  urls: SavedEntry[]
  onClose: () => void
}

function escHtml(str: string) {
  return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export function ExportModal({ group, urls, onClose }: ExportModalProps) {
  const exportBookmarks = () => {
    const date = Math.floor(Date.now() / 1000)
    const lines = [
      '<!DOCTYPE NETSCAPE-Bookmark-file-1>',
      '<!-- This is an automatically generated file. Do not edit! -->',
      '<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">',
      '<TITLE>Bookmarks</TITLE><H1>Bookmarks</H1><DL><p>',
      `    <DT><H3 ADD_DATE="${date}" LAST_MODIFIED="${date}">${escHtml(group.name)}</H3>`,
      '    <DL><p>',
      ...urls.map(e => `        <DT><A HREF="${escHtml(e.url)}" ADD_DATE="${Math.floor((e.savedAt || Date.now()) / 1000)}">${escHtml(e.title || e.url)}</A>`),
      '    </DL><p></DL><p>',
    ]
    download(lines.join('\n'), `${slug(group.name)}-bookmarks.html`, 'text/html')
    onClose()
  }

  const exportJson = () => {
    const data = { version: '1.4.0', exportedAt: new Date().toISOString(), group: { ...group }, urls }
    download(JSON.stringify(data, null, 2), `${slug(group.name)}-topic-tracker.json`, 'application/json')
    onClose()
  }

  const slug = (s: string) => s.replace(/[^a-z0-9]/gi, '-').toLowerCase()

  const download = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = filename; a.click()
    URL.revokeObjectURL(url)
  }

  const btnStyle: React.CSSProperties = { background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 8, color: 'var(--text2)', fontFamily: 'inherit', fontSize: 13, padding: '8px 14px', cursor: 'pointer', width: '100%' }

  return (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 12, width: 340, display: 'flex', flexDirection: 'column', boxShadow: '0 24px 48px rgba(0,0,0,0.5)', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid var(--border)', fontSize: 14, fontWeight: 600, flexShrink: 0 }}>
        <span>Export "{group.name}"</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text2)', padding: 6, borderRadius: 6, display: 'flex' }}>
          <svg viewBox="0 0 20 20" fill="none" width={16} height={16}><path d="m5 5 10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
        </button>
      </div>
      <div style={{ padding: 16 }}>
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text2)', marginBottom: 6 }}>Browser bookmarks</p>
        <p style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 8, lineHeight: 1.5 }}>Standard Netscape bookmark file (.html) — importable by Chrome, Firefox, Safari, Edge.</p>
        <button onClick={exportBookmarks} style={btnStyle}>Download as bookmarks (.html)</button>
        <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '16px 0' }} />
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text2)', marginBottom: 6 }}>Topic Tracker JSON</p>
        <p style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 8, lineHeight: 1.5 }}>Exports this group's rules and saved URLs. Others with the extension can import it.</p>
        <button onClick={exportJson} style={btnStyle}>Download as JSON</button>
      </div>
    </div>
  )
}
