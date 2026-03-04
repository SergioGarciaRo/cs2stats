import { NextResponse } from 'next/server'
import { fetchSteamProfile, fetchCS2Hours, resolveVanity, fetchFaceitLevel, fetchCS2Medals, fetchInventoryValue, fetchLeetifyRating, fetchCS2Stats, fetchPlayerBans } from '../../../../lib/steam'
import { getCache, setCache } from '../../../../lib/cache'
import { isRateLimited } from '../../../../lib/rateLimiter'
import { recordView } from '../../../../lib/viewTracker'
import { getVotes } from '../../../../lib/voteTracker'
import { getIp } from '../../../../lib/getIp'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const ip = getIp(req)
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
  const [prof, cs2, faceitResult, medalsResult, inventoryResult, leetifyResult, cs2StatsResult, bansResult] = await Promise.all([
    fetchSteamProfile(id),
    fetchCS2Hours(id),
    fetchFaceitLevel(id),
    fetchCS2Medals(id),
    fetchInventoryValue(id),
    fetchLeetifyRating(id),
    fetchCS2Stats(id),
    fetchPlayerBans(id),
  ])

  if (!prof.ok || !prof.profile) return NextResponse.json({ error: 'profile_not_found' }, { status: 502 })
  const profile = prof.profile

  // Heuristic risk score
  let riskScore = 0
  let riskReasons: string[] = []

  if (profile.visibility === 'private') { riskScore += 20; riskReasons.push('private profile') }
  if (profile.vacBanned) { riskScore += 50; riskReasons.push('VAC banned') }
  if (profile.memberSince) {
    try {
      const year = Number(profile.memberSince.split(' ').pop())
      if (!isNaN(year) && (new Date().getFullYear() - year) <= 1) { riskScore += 15; riskReasons.push('very new account') }
    } catch {}
  }
  if (bansResult.ok) {
    if (bansResult.numberOfVACBans > 0) { riskScore += 40; riskReasons.push(`${bansResult.numberOfVACBans} VAC ban(s)`) }
    if (bansResult.numberOfGameBans > 0) { riskScore += 30; riskReasons.push(`${bansResult.numberOfGameBans} game ban(s)`) }
    if ((bansResult.numberOfVACBans > 0 || bansResult.numberOfGameBans > 0) && bansResult.daysSinceLastBan < 365) {
      riskScore += 20; riskReasons.push('banned within last year')
    }
    if (bansResult.economyBan !== 'none') { riskScore += 15; riskReasons.push('trade banned') }
  }
  if (cs2StatsResult.ok) {
    if (cs2StatsResult.hsPct > 65)   { riskScore += 20; riskReasons.push(`high HS% (${cs2StatsResult.hsPct}%)`) }
    if (cs2StatsResult.accuracy > 35) { riskScore += 15; riskReasons.push(`high accuracy (${cs2StatsResult.accuracy}%)`) }
    if (cs2StatsResult.kd > 4)        { riskScore += 15; riskReasons.push(`very high K/D (${cs2StatsResult.kd})`) }
  }

  let risk = 'low'
  if (riskScore >= 60) risk = `high (${riskReasons.join(', ')})`
  else if (riskScore >= 30) risk = `elevated (${riskReasons.join(', ')})`
  else if (profile.visibility === 'private') risk = 'unknown (private profile)'
  else if (riskReasons.length > 0) risk = `elevated (${riskReasons.join(', ')})`

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
    cs2Stats: cs2StatsResult.ok
      ? { kills: cs2StatsResult.kills, deaths: cs2StatsResult.deaths, kd: cs2StatsResult.kd, hsPct: cs2StatsResult.hsPct, accuracy: cs2StatsResult.accuracy, winRate: cs2StatsResult.winRate, mvps: cs2StatsResult.mvps, matchesPlayed: cs2StatsResult.matchesPlayed }
      : { reason: cs2StatsResult.reason },
    bans: bansResult.ok
      ? { communityBanned: bansResult.communityBanned, vacBanned: bansResult.vacBanned, numberOfVACBans: bansResult.numberOfVACBans, numberOfGameBans: bansResult.numberOfGameBans, daysSinceLastBan: bansResult.daysSinceLastBan, economyBan: bansResult.economyBan }
      : { reason: bansResult.reason },
    fetchedAt: Date.now(),
  }

  setCache(key, payload, 600)
  recordView(id, profile.name || 'Unknown', profile.avatar || '')

  return NextResponse.json({ ...payload, votes: getVotes(id) })
}
