import { kv } from '@vercel/kv'

interface VotedProfile extends Record<string, unknown> {
  steamId: string
  name: string
  avatar: string
  yes: number
  no: number
  lastVote: number
}

// In-memory fallback when KV is not configured
const memVotes = new Map<string, VotedProfile>()
const memVotedBy = new Map<string, { vote: 'yes' | 'no'; at: number }>()
const kvAvailable = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)

export async function submitVote(
  steamId: string,
  name: string,
  avatar: string,
  ip: string,
  vote: 'yes' | 'no',
): Promise<{ ok: boolean; reason?: string; yes: number; no: number }> {
  if (!kvAvailable) {
    const key = `${ip}:${steamId}`
    const prev = memVotedBy.get(key)
    if (prev && Date.now() - prev.at < 3600_000) {
      const current = memVotes.get(steamId)
      return { ok: false, reason: 'already_voted', yes: current?.yes ?? 0, no: current?.no ?? 0 }
    }
    memVotedBy.set(key, { vote, at: Date.now() })
    const e = memVotes.get(steamId)
    if (e) {
      if (prev?.vote === 'yes') e.yes = Math.max(0, e.yes - 1)
      if (prev?.vote === 'no') e.no = Math.max(0, e.no - 1)
      if (vote === 'yes') e.yes += 1; else e.no += 1
      e.lastVote = Date.now(); e.name = name; e.avatar = avatar
      return { ok: true, yes: e.yes, no: e.no }
    }
    const entry: VotedProfile = { steamId, name, avatar, yes: vote === 'yes' ? 1 : 0, no: vote === 'no' ? 1 : 0, lastVote: Date.now() }
    memVotes.set(steamId, entry)
    return { ok: true, yes: entry.yes, no: entry.no }
  }

  try {
    const voteKey = `voted:${ip}:${steamId}`
    const prev = await kv.get<{ vote: 'yes' | 'no'; at: number }>(voteKey)
    const current = await kv.hgetall<VotedProfile>(`vote:${steamId}`) ?? { steamId, name, avatar, yes: 0, no: 0, lastVote: Date.now() }

    if (prev && Date.now() - prev.at < 3600_000) {
      return { ok: false, reason: 'already_voted', yes: current.yes, no: current.no }
    }

    if (prev?.vote === 'yes') current.yes = Math.max(0, current.yes - 1)
    if (prev?.vote === 'no') current.no = Math.max(0, current.no - 1)
    if (vote === 'yes') current.yes += 1; else current.no += 1
    current.lastVote = Date.now(); current.name = name; current.avatar = avatar

    await kv.set(voteKey, { vote, at: Date.now() }, { ex: 3600 })
    await kv.hset(`vote:${steamId}`, current)
    await kv.zadd('votes:sorted', { score: current.yes, member: steamId })

    return { ok: true, yes: current.yes, no: current.no }
  } catch {
    return { ok: false, reason: 'error', yes: 0, no: 0 }
  }
}

export async function getVotes(steamId: string): Promise<{ yes: number; no: number }> {
  if (!kvAvailable) {
    const v = memVotes.get(steamId)
    return { yes: v?.yes ?? 0, no: v?.no ?? 0 }
  }
  try {
    const v = await kv.hgetall<VotedProfile>(`vote:${steamId}`)
    return { yes: v?.yes ?? 0, no: v?.no ?? 0 }
  } catch {
    return { yes: 0, no: 0 }
  }
}

export async function getTopSuspected(limit = 10): Promise<VotedProfile[]> {
  if (!kvAvailable) {
    return [...memVotes.values()].filter(v => v.yes > 0).sort((a, b) => b.yes - a.yes).slice(0, limit)
  }
  try {
    const ids = await kv.zrange<string[]>('votes:sorted', 0, limit - 1, { rev: true })
    if (!ids || ids.length === 0) return []
    const profiles = await Promise.all(ids.map(id => kv.hgetall<VotedProfile>(`vote:${id}`)))
    return (profiles.filter(Boolean) as VotedProfile[]).filter(p => p.yes > 0)
  } catch {
    return []
  }
}
