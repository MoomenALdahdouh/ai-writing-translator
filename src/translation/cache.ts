/**
 * Short-lived in-memory cache only. Never written to chrome.storage.
 * Keys are hashes so raw user text is not retained as a map key dump.
 */

function fnv1a(value: string): string {
  let hash = 2166136261
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0).toString(16)
}

export function translationCacheKey(
  sourceLanguage: string,
  targetLanguage: string,
  text: string,
): string {
  return `${sourceLanguage}|${targetLanguage}|${fnv1a(text.normalize('NFC'))}|${text.length}`
}

export function createMemoryTranslationCache(ttlMs = 60_000, max = 40) {
  const store = new Map<string, { value: string; expires: number }>()

  function prune(now: number): void {
    for (const [key, entry] of store) {
      if (entry.expires <= now) store.delete(key)
    }
    while (store.size > max) {
      const oldest = store.keys().next().value
      if (oldest === undefined) break
      store.delete(oldest)
    }
  }

  return {
    get(key: string, now = Date.now()): string | undefined {
      prune(now)
      const entry = store.get(key)
      if (!entry || entry.expires <= now) {
        store.delete(key)
        return undefined
      }
      return entry.value
    },
    set(key: string, value: string, now = Date.now()): void {
      store.set(key, { value, expires: now + ttlMs })
      prune(now)
    },
    clear(): void {
      store.clear()
    },
    size(): number {
      return store.size
    },
  }
}
