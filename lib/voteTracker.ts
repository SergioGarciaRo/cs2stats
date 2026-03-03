// In-memory yes/no cheater vote tracker — resets on server restart
// One vote per IP per profile per hour

interface VotedProfile {
  steamId: string
  name: string
  avatar: string
  yes: number
  no: number
  lastVote: number
}

const votes = new Map<string, VotedProfile>()
// ip:steamId → 'yes'|'no' (with timestamp to allow re-vote after 1h)
const votedBy = new Map<string, { vote: 'yes' | 'no'; at: number }>()

export function submitVote(
  steamId: string,
  name: string,
  avatar: string,
  ip: string,
  vote: 'yes' | 'no',
): { ok: boolean; reason?: string; yes: number; no: number } {
  const key = `${ip}:${steamId}`
  const prev = votedBy.get(key)

  if (prev && Date.now() - prev.at < 3600_000) {
    const current = votes.get(steamId)
    return { ok: false, reason: 'already_voted', yes: current?.yes ?? 0, no: current?.no ?? 0 }
  }

  votedBy.set(key, { vote, at: Date.now() })

  const existing = votes.get(steamId)
  if (existing) {
    // Undo previous vote if changing
    if (prev?.vote === 'yes') existing.yes = Math.max(0, existing.yes - 1)
    if (prev?.vote === 'no') existing.no = Math.max(0, existing.no - 1)
    if (vote === 'yes') existing.yes += 1
    else existing.no += 1
    existing.lastVote = Date.now()
    existing.name = name
    existing.avatar = avatar
    return { ok: true, yes: existing.yes, no: existing.no }
  } else {
    const entry: VotedProfile = {
      steamId, name, avatar,
      yes: vote === 'yes' ? 1 : 0,
      no: vote === 'no' ? 1 : 0,
      lastVote: Date.now(),
    }
    votes.set(steamId, entry)
    return { ok: true, yes: entry.yes, no: entry.no }
  }
}

export function getVotes(steamId: string): { yes: number; no: number } {
  const v = votes.get(steamId)
  return { yes: v?.yes ?? 0, no: v?.no ?? 0 }
}

export function getTopSuspected(limit = 10): VotedProfile[] {
  return [...votes.values()]
    .filter(v => v.yes > 0)
    .sort((a, b) => b.yes - a.yes)
    .slice(0, limit)
}
