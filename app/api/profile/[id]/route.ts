import { NextResponse } from 'next/server'
import { fetchSteamProfile, fetchCS2Hours, resolveVanity, fetchFaceitLevel, fetchCS2Medals, fetchInventoryValue, fetchLeetifyRating } from '../../../../lib/steam'
import { getCache, setCache } from '../../../../lib/cache'
import { isRateLimited } from '../../../../lib/rateLimiter'
import { recordView } from '../../../../lib/viewTracker'
import { getVotes } from '../../../../lib/voteTracker'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const ip = req.headers.get('x-real-ip') || req.headers.get('x-forwarded-for') || 'local'
  if (isRateLimited(ip)) return NextResponse.json({ error: 'rate_limited' }, { status: 429 })

  let id = params.id
  if (!/^[0-9]{17}$/.test(id)) {
    const resolved = await resolveVanity(id)
    if (!resolved.ok) return NextResponse.json({ error: 'invalid_id_or_vanity', details: resolved.error }, { status: 400 })
    id = resolved.steamId
  }

  const key = `profile:${id}`
  const cached = getCache(key)
  if (cached) {
    recordView(id, cached.profile?.name || 'Unknown', cached.profile?.avatar || '')
    return NextResponse.json({ ...cached, votes: getVotes(id) })
  }

  // Fetch all data in parallel
  const [prof, cs2, faceitResult, medalsResult, inventoryResult, leetifyResult] = await Promise.all([
    fetchSteamProfile(id),
    fetchCS2Hours(id),
    fetchFaceitLevel(id),
    fetchCS2Medals(id),
    fetchInventoryValue(id),
    fetchLeetifyRating(id),
  ])

  if (!prof.ok || !prof.profile) return NextResponse.json({ error: 'fetch_error', details: (prof as any).error }, { status: 502 })
  const profile = prof.profile

  // Heuristic risk
  let risk = 'low'
  if (profile.visibility === 'private') risk = 'unknown (private profile)'
  if (profile.vacBanned) risk = 'high (VAC banned)'
  if (profile.memberSince) {
    try {
      const year = Number(profile.memberSince.split(' ').pop())
      if (!isNaN(year) && (new Date().getFullYear() - year) <= 1) risk = 'elevated (very new account)'
    } catch {}
  }

  const payload = {
    profile,
    cs2,
    risk,
    faceit: faceitResult.ok
      ? { level: faceitResult.level, elo: faceitResult.elo, faceitName: faceitResult.faceitName }
      : { reason: faceitResult.reason },
    medals: medalsResult.ok
      ? { items: medalsResult.medals }
      : { reason: medalsResult.reason },
    inventory: inventoryResult.ok
      ? {
          totalItems: inventoryResult.totalItems,
          marketableItems: inventoryResult.marketableItems,
          approximateValueUSD: inventoryResult.approximateValueUSD,
          isPartial: inventoryResult.isPartial,
        }
      : { reason: inventoryResult.reason },
    leetify: leetifyResult.ok
      ? { aim: leetifyResult.aim, positioning: leetifyResult.positioning, utility: leetifyResult.utility, overall: leetifyResult.overall }
      : { reason: leetifyResult.reason },
    fetchedAt: Date.now(),
  }

  setCache(key, payload, 600)
  recordView(id, profile.name || 'Unknown', profile.avatar || '')

  return NextResponse.json({ ...payload, votes: getVotes(id) })
}
