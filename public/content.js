// content.js — Injected into every page.
// Handles two modes:
//   1. GET_PAGE_CONTENT — one-shot text extraction at page load (deep scan)
//   2. START_DYNAMIC_WATCH — MutationObserver for dynamically injected content (e.g. live forums)

(function () {

  // ── ONE-SHOT PAGE CONTENT EXTRACTION ──
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === 'GET_PAGE_CONTENT') {
      sendResponse({ content: extractText(document.body) });
      return true;
    }

    if (msg.type === 'START_DYNAMIC_WATCH') {
      startDynamicWatch(msg.groups);
      return true;
    }
  });

  // ── DYNAMIC WATCH (MutationObserver) ──
  // Called once per page when background detects at least one group has dynamicScan enabled.
  // Watches for newly injected DOM nodes, extracts their text, and reports matches back.
  // Uses a 2s debounce to batch rapid mutations (e.g. fast-moving boards).
  // Disconnects per-group after first match to avoid redundant re-saves.

  function startDynamicWatch(groups) {
    if (!groups || groups.length === 0) return;

    // Track which groups have already matched on this page — don't re-trigger them
    const matchedGroups = new Set();

    // Accumulate new text from mutations, flushed on debounce
    let pendingText = '';
    let debounceTimer = null;

    const observer = new MutationObserver((mutations) => {
      // Collect visible text from all newly added nodes
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.TEXT_NODE) {
            const t = node.textContent.trim();
            if (t.length > 1) pendingText += ' ' + t;
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            const t = extractText(node);
            if (t.length > 1) pendingText += ' ' + t;
          }
        }
      }

      if (!pendingText.trim()) return;

      // Debounce — wait 2s of quiet before checking rules
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const textToCheck = pendingText;
        pendingText = '';

        // Report to background for matching
        chrome.runtime.sendMessage({
          type: 'DYNAMIC_CONTENT_MATCH',
          url: window.location.href,
          title: document.title,
          content: textToCheck.slice(0, 150000) // cap at 150k chars
        });

        // If all groups have matched, no point observing further
        if (matchedGroups.size >= groups.length) {
          observer.disconnect();
        }
      }, 2000);
    });

    observer.observe(document.body, {
      childList: true,  // watch for new elements
      subtree: true     // watch entire DOM tree, not just direct children
    });
  }

  // ── TEXT EXTRACTION HELPER ──
  function extractText(root) {
    if (!root) return '';

    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          const tag = parent.tagName.toLowerCase();
          if (['script', 'style', 'noscript', 'svg', 'meta'].includes(tag)) {
            return NodeFilter.FILTER_REJECT;
          }
          const style = window.getComputedStyle(parent);
          if (style.display === 'none' || style.visibility === 'hidden') {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    const chunks = [];
    let node;
    while ((node = walker.nextNode())) {
      const text = node.textContent.trim();
      if (text.length > 1) chunks.push(text);
      if (chunks.join(' ').length > 150000) break;
    }

    return chunks.join(' ');
  }

})();