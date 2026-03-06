import { kv } from '@vercel/kv'

interface TrackedProfile extends Record<string, unknown> {
  steamId: string
  name: string
  avatar: string
  views: number
  lastSeen: number
}

// In-memory fallback when KV is not configured (local dev / no KV)
const memTracker = new Map<string, TrackedProfile>()
const kvAvailable = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)

export async function recordView(steamId: string, name: string, avatar: string) {
  if (!kvAvailable) {
    const e = memTracker.get(steamId)
    if (e) { e.views += 1; e.lastSeen = Date.now(); e.name = name; e.avatar = avatar }
    else memTracker.set(steamId, { steamId, name, avatar, views: 1, lastSeen: Date.now() })
    return
  }
  try {
    const current = await kv.hgetall<TrackedProfile>(`view:${steamId}`)
    const views = (current?.views ?? 0) + 1
    await kv.hset(`view:${steamId}`, { steamId, name, avatar, views, lastSeen: Date.now() })
    await kv.zadd('views:sorted', { score: views, member: steamId })
  } catch { /* ignore */ }
}

export async function getTopProfiles(limit = 6): Promise<TrackedProfile[]> {
  if (!kvAvailable) {
    return [...memTracker.values()].sort((a, b) => b.views - a.views).slice(0, limit)
  }
  try {
    const ids = await kv.zrange<string[]>('views:sorted', 0, limit - 1, { rev: true })
    if (!ids || ids.length === 0) return []
    const profiles = await Promise.all(ids.map(id => kv.hgetall<TrackedProfile>(`view:${id}`)))
    return profiles.filter(Boolean) as TrackedProfile[]
  } catch {
    return []
  }
}
