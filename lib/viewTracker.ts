// In-memory view tracker — resets on server restart
// Stores: steamId → { name, avatar, views, lastSeen }

interface TrackedProfile {
  steamId: string
  name: string
  avatar: string
  views: number
  lastSeen: number
}

const tracker = new Map<string, TrackedProfile>()

export function recordView(steamId: string, name: string, avatar: string) {
  const existing = tracker.get(steamId)
  if (existing) {
    existing.views += 1
    existing.lastSeen = Date.now()
    existing.name = name
    existing.avatar = avatar
  } else {
    tracker.set(steamId, { steamId, name, avatar, views: 1, lastSeen: Date.now() })
  }
}

export function getTopProfiles(limit = 6): TrackedProfile[] {
  return [...tracker.values()]
    .sort((a, b) => b.views - a.views)
    .slice(0, limit)
}
