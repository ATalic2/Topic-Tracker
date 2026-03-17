// ── ALARM SETUP ──
// Register a periodic cleanup alarm on install/startup.
// Runs every 6 hours to purge expired URLs.
chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create('expiry-cleanup', { periodInMinutes: 360 });
});

chrome.runtime.onStartup.addListener(() => {
  chrome.alarms.create('expiry-cleanup', { periodInMinutes: 360 });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'expiry-cleanup') runExpiryCleanup();
});

// ── EXPIRY CLEANUP ──
function runExpiryCleanup() {
  chrome.storage.local.get(['savedUrls', 'settings'], (storageData) => {
    const savedUrls = storageData.savedUrls || {};
    const settings = Object.assign({ expiryDays: 30 }, storageData.settings || {});

    // 0 = never expire
    if (!settings.expiryDays || settings.expiryDays <= 0) return;

    const cutoff = Date.now() - settings.expiryDays * 24 * 60 * 60 * 1000;
    let changed = false;

    for (const groupId of Object.keys(savedUrls)) {
      const before = savedUrls[groupId].length;
      savedUrls[groupId] = savedUrls[groupId].filter(entry => (entry.lastSeen || entry.savedAt || 0) >= cutoff);
      if (savedUrls[groupId].length !== before) changed = true;
    }

    if (changed) chrome.storage.local.set({ savedUrls });
  });
}

// ── LIVE TAB TRACKING ──
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  const isLoad = changeInfo.status === 'complete';
  const isTitleChange = changeInfo.title !== undefined;
  if (!isLoad && !isTitleChange) return;
  if (!tab.url || !tab.title) return;

  const url = tab.url;
  const title = tab.title || '';

  if (isInternalUrl(url)) return;

  chrome.storage.local.get(['groups', 'savedUrls', 'settings'], (storageData) => {
    const groups = storageData.groups || [];
    const savedUrls = storageData.savedUrls || {};
    const settings = Object.assign({ dedupeHours: 24, uncategorized: false, trackingEnabled: true }, storageData.settings || {});

    if (settings.trackingEnabled === false) return;

    let matched = false;

    for (const group of groups) {
      if (!group.rules || group.rules.length === 0) continue;

      const urlTitleMatch = matchesRules(group.rules, url, title, null);

      if (urlTitleMatch) {
        saveToGroup(group.id, { url, title }, savedUrls, settings.dedupeHours);
        matched = true;
      } else if (group.deepScan) {
        chrome.tabs.sendMessage(tabId, { type: 'GET_PAGE_CONTENT' }, (response) => {
          if (chrome.runtime.lastError || !response) return;
          const content = response.content || '';
          if (matchesRules(group.rules, url, title, content)) {
            chrome.storage.local.get(['savedUrls'], (freshStorageData) => {
              const freshSavedUrls = freshStorageData.savedUrls || {};
              saveToGroup(group.id, { url, title }, freshSavedUrls, settings.dedupeHours);
              chrome.storage.local.set({ savedUrls: freshSavedUrls });
            });
          }
        });
      }
    }

    if (!matched && settings.uncategorized) {
      saveToGroup('__uncategorized__', { url, title }, savedUrls, settings.dedupeHours);
    }

    chrome.storage.local.set({ savedUrls });

    if (isLoad) {
      const dynamicGroups = groups.filter(group => group.dynamicScan && group.rules && group.rules.length > 0);
      if (dynamicGroups.length > 0) {
        chrome.tabs.sendMessage(tabId, {
          type: 'START_DYNAMIC_WATCH',
          groups: dynamicGroups
        }, () => { chrome.runtime.lastError; });
      }
    }
  });
});

// ── SINGLE MESSAGE LISTENER ──
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  switch (msg.type) {

    case 'DYNAMIC_CONTENT_MATCH': {
      const { url, title, content } = msg;

      chrome.storage.local.get(['groups', 'savedUrls', 'settings'], (storageData) => {
        const groups = storageData.groups || [];
        const savedUrls = storageData.savedUrls || {};
        const settings = Object.assign({ dedupeHours: 24 }, storageData.settings || {});

        for (const group of groups) {
          if (!group.dynamicScan || !group.rules || group.rules.length === 0) continue;
          if (matchesRules(group.rules, url, title, content)) {
            saveToGroup(group.id, { url, title }, savedUrls, settings.dedupeHours);
          }
        }

        chrome.storage.local.set({ savedUrls });
      });
      return true;
    }

    case 'RETRO_SCAN': {
      const { group, startTime } = msg;

      chrome.storage.local.get(['savedUrls', 'settings'], (storageData) => {
        const savedUrls = storageData.savedUrls || {};
        const settings = Object.assign({ dedupeHours: 24 }, storageData.settings || {});

        chrome.history.search({
          text: '',
          startTime,
          maxResults: 10000
        }, (historyItems) => {
          let matchCount = 0;

          for (const item of historyItems) {
            const itemUrl = item.url || '';
            const itemTitle = item.title || '';

            if (isInternalUrl(itemUrl)) continue;
            if (!matchesRules(group.rules, itemUrl, itemTitle, null)) continue;

            saveToGroup(group.id, { url: itemUrl, title: itemTitle, savedAt: item.lastVisitTime }, savedUrls, settings.dedupeHours);
            matchCount++;
          }

          chrome.storage.local.set({ savedUrls });
          sendResponse({ matchCount });
        });
      });
      return true;
    }

  }
});

// ── MATCHING LOGIC ──
function matchesRules(rules, url, title, pageContent) {
  for (const rule of rules) {
    if (!rule.pattern || !rule.pattern.trim()) continue;

    try {
      const targets = buildTargets(rule.matchIn, url, title, pageContent);

      if (rule.type === 'regex') {
        const regex = new RegExp(rule.pattern, 'i');
        if (targets.some(target => regex.test(target))) return true;
      } else {
        const normalizedPattern = normalizeText(rule.pattern, rule.strictPunctuation);
        if (targets.some(target => normalizeText(target, rule.strictPunctuation).includes(normalizedPattern))) return true;
      }
    } catch (error) {
      continue;
    }
  }
  return false;
}

// ── TEXT NORMALIZATION ──
function normalizeText(str, strictPunctuation = false) {
  let result = str.toLowerCase();

  if (!strictPunctuation) {
    result = result.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    result = result.replace(/[''`]/g, '');
  }

  return result;
}

// ── HTML ENTITY DECODING ──
// Chrome history sometimes stores titles with HTML entities (e.g. &eacute; instead of é).
// This ensures matching works correctly against those titles.
function decodeHtmlEntities(str) {
  if (!str) return '';
  return str
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&eacute;/gi, 'é').replace(/&Eacute;/gi, 'É')
    .replace(/&agrave;/gi, 'à').replace(/&Agrave;/gi, 'À')
    .replace(/&aacute;/gi, 'á').replace(/&Aacute;/gi, 'Á')
    .replace(/&acirc;/gi,  'â').replace(/&Acirc;/gi,  'Â')
    .replace(/&atilde;/gi, 'ã').replace(/&Atilde;/gi, 'Ã')
    .replace(/&auml;/gi,   'ä').replace(/&Auml;/gi,   'Ä')
    .replace(/&ecirc;/gi,  'ê').replace(/&Ecirc;/gi,  'Ê')
    .replace(/&egrave;/gi, 'è').replace(/&Egrave;/gi, 'È')
    .replace(/&euml;/gi,   'ë').replace(/&Euml;/gi,   'Ë')
    .replace(/&iacute;/gi, 'í').replace(/&Iacute;/gi, 'Í')
    .replace(/&icirc;/gi,  'î').replace(/&Icirc;/gi,  'Î')
    .replace(/&igrave;/gi, 'ì').replace(/&Igrave;/gi, 'Ì')
    .replace(/&iuml;/gi,   'ï').replace(/&Iuml;/gi,   'Ï')
    .replace(/&oacute;/gi, 'ó').replace(/&Oacute;/gi, 'Ó')
    .replace(/&ocirc;/gi,  'ô').replace(/&Ocirc;/gi,  'Ô')
    .replace(/&ograve;/gi, 'ò').replace(/&Ograve;/gi, 'Ò')
    .replace(/&otilde;/gi, 'õ').replace(/&Otilde;/gi, 'Õ')
    .replace(/&ouml;/gi,   'ö').replace(/&Ouml;/gi,   'Ö')
    .replace(/&uacute;/gi, 'ú').replace(/&Uacute;/gi, 'Ú')
    .replace(/&ucirc;/gi,  'û').replace(/&Ucirc;/gi,  'Û')
    .replace(/&ugrave;/gi, 'ù').replace(/&Ugrave;/gi, 'Ù')
    .replace(/&uuml;/gi,   'ü').replace(/&Uuml;/gi,   'Ü')
    .replace(/&ntilde;/gi, 'ñ').replace(/&Ntilde;/gi, 'Ñ')
    .replace(/&ccedil;/gi, 'ç').replace(/&Ccedil;/gi, 'Ç')
    .replace(/&amp;/gi,  '&')
    .replace(/&lt;/gi,   '<')
    .replace(/&gt;/gi,   '>')
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
}

function buildTargets(matchIn, url, title, pageContent) {
  const decodedTitle = decodeHtmlEntities(title);
  if (matchIn === 'url') return [url];
  if (matchIn === 'title') return [decodedTitle];
  const targets = [url, decodedTitle];
  if (pageContent) targets.push(pageContent);
  return targets;
}

// ── HELPERS ──
function isInternalUrl(url) {
  return (
    url.startsWith('chrome://') ||
    url.startsWith('chrome-extension://') ||
    url.startsWith('about:') ||
    url.startsWith('edge://') ||
    url.startsWith('brave://') ||
    url.startsWith('file:///')
  );
}

function saveToGroup(groupId, { url, title, savedAt }, savedUrls, dedupeHours = 24) {
  if (!savedUrls[groupId]) savedUrls[groupId] = [];

  const entries = savedUrls[groupId];
  const now = Date.now();
  const timestamp = savedAt || now;
  const dedupeWindow = dedupeHours * 60 * 60 * 1000;

  const existingEntry = entries.find(entry => entry.url === url);
  if (existingEntry) {
    if ((now - existingEntry.lastSeen) < dedupeWindow) {
      existingEntry.lastSeen = now;
      return;
    }
    existingEntry.lastSeen = now;
    existingEntry.visitCount = (existingEntry.visitCount || 1) + 1;
    return;
  }

  entries.unshift({
    url,
    title,
    savedAt: timestamp,
    lastSeen: now,
    visitCount: 1,
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`
  });

  if (entries.length > 500) entries.splice(500);
}
