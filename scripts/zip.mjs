// scripts/zip.mjs
// Run after `vite build` — zips the dist/ folder into topic-tracker.zip
import { createWriteStream, readdirSync, statSync } from 'fs'
import { resolve, relative, join } from 'path'
import archiver from 'archiver'

const dist = resolve('dist')
const out = resolve('topic-tracker.zip')

const output = createWriteStream(out)
const archive = archiver('zip', { zlib: { level: 9 } })

output.on('close', () => {
  const kb = (archive.pointer() / 1024).toFixed(1)
  console.log(`✓ topic-tracker.zip — ${kb} KB`)
})

archive.on('error', err => { throw err })
archive.pipe(output)
archive.directory(dist, false)
archive.finalize()
