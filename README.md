# Topic Tracker

[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/pblamjihhnkkecpdbipfidfachihajkl)](https://chromewebstore.google.com/detail/pblamjihhnkkecpdbipfidfachihajkl?utm_source=item-share-cb)

A privacy-first Chrome extension that automatically saves visited pages into custom topic groups based on keyword and regex rules. 100% local.

## Features

- **Keyword & regex rules** — match against URL, title, or full page content
- **Deep scan** — reads full page text to catch mentions in articles and forums
- **Dynamic scan** — watches for content added after page load (SPAs, live feeds)
- **Retroactive scan** — search your existing browser history for matches
- **URL expiry** — automatically remove stale entries after N days
- **Export** — Netscape bookmarks (.html) or JSON
- **Domain subgroups** — organise URLs by domain within each group

Load the zip or `dist/` folder in Chrome to test. Upload the zip to the Chrome Web Store.

## Stack

- React 18 + TypeScript
- Vite 5
