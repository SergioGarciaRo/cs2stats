// In-memory cache — compatible with Vercel, Railway, Render y cualquier plataforma
// Sin dependencias nativas. Se resetea al reiniciar el servidor.

interface CacheEntry {
  data: any
  expires: number
}

const store = new Map<string, CacheEntry>()

export function getCache(key: string) {
  const entry = store.get(key)
  if (!entry) return null
  if (Date.now() > entry.expires) {
    store.delete(key)
    return null
  }
  return entry.data
}

export function setCache(key: string, value: any, ttlSeconds = 600) {
  store.set(key, { data: value, expires: Date.now() + ttlSeconds * 1000 })
}

export function deleteCache(key: string) {
  store.delete(key)
}
