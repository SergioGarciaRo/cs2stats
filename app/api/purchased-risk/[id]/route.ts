import { NextResponse } from 'next/server'
import { getCache, setCache } from '../../../../lib/cache'

const CACHE_TTL = 3600 // 1 hour

interface RiskResult {
  steamid: string
  score: number
  level: 'Low' | 'Medium' | 'High'
  message: string
  reasons: string[]
  signals: {
    accountAgeDays: number | null
    isProfilePublic: boolean | null
    hasVACBans: boolean
    hasGameBans: boolean
    daysSinceLastBan: number | null
    totalGames: number | null
    cs2Hours: number | null
    playtime2wHours: number | null
    inventoryAccessible: boolean | null
    inventoryItemCount: number | null
  }
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const id = params.id
  if (!/^[0-9]{17}$/.test(id)) {
    return NextResponse.json({ error: 'invalid_steamid' }, { status: 400 })
  }

  const apiKey = process.env.STEAM_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'STEAM_API_KEY missing' }, { status: 500 })
  }

  const cacheKey = `purchased-risk:${id}`
  const cached = getCache(cacheKey)
  if (cached) {
    return NextResponse.json(cached, {
      headers: { 'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400' },
    })
  }

  // ── Fetch all signals in parallel ──────────────────────────────────────────
  const [summaryRes, bansRes, gamesRes, inventoryRes] = await Promise.all([
    fetch(
      `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${apiKey}&steamids=${id}`,
      { next: { revalidate: CACHE_TTL } }
    ).catch(() => null),
    fetch(
      `https://api.steampowered.com/ISteamUser/GetPlayerBans/v1/?key=${apiKey}&steamids=${id}`,
      { next: { revalidate: CACHE_TTL } }
    ).catch(() => null),
    fetch(
      `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${apiKey}&steamid=${id}&include_appinfo=true&include_played_free_games=true`,
      { next: { revalidate: CACHE_TTL } }
    ).catch(() => null),
    fetch(
      `https://steamcommunity.com/inventory/${id}/730/2?l=english&count=5000`,
      { next: { revalidate: CACHE_TTL } }
    ).catch(() => null),
  ])

  // Parse summaries
  let accountAgeDays: number | null = null
  let isProfilePublic: boolean | null = null
  let hasProfileState = false
  if (summaryRes?.ok) {
    try {
      const j = await summaryRes.json()
      const p = j?.response?.players?.[0]
      if (p) {
        isProfilePublic = p.communityvisibilitystate === 3
        hasProfileState = !!(p.profilestate)
        if (p.timecreated) {
          accountAgeDays = Math.floor((Date.now() / 1000 - p.timecreated) / 86400)
        }
      }
    } catch {}
  }

  // Parse bans
  let hasVACBans = false
  let hasGameBans = false
  let daysSinceLastBan: number | null = null
  if (bansRes?.ok) {
    try {
      const j = await bansRes.json()
      const p = j?.players?.[0]
      if (p) {
        hasVACBans       = (p.NumberOfVACBans  ?? 0) > 0
        hasGameBans      = (p.NumberOfGameBans ?? 0) > 0
        daysSinceLastBan = p.DaysSinceLastBan ?? null
      }
    } catch {}
  }

  // Parse owned games
  let totalGames: number | null = null
  let cs2Hours: number | null   = null
  let playtime2wHours: number | null = null
  if (gamesRes?.ok) {
    try {
      const j = await gamesRes.json()
      const resp = j?.response
      totalGames = resp?.game_count ?? null
      const cs2Game = (resp?.games ?? []).find((g: any) => g.appid === 730)
      if (cs2Game) {
        cs2Hours       = Math.floor((cs2Game.playtime_forever ?? 0) / 60)
        playtime2wHours = Math.floor((cs2Game.playtime_2weeks ?? 0) / 60)
      }
    } catch {}
  }

  // Parse inventory
  let inventoryAccessible: boolean | null = null
  let inventoryItemCount: number | null   = null
  if (inventoryRes) {
    if (inventoryRes.status === 403) {
      inventoryAccessible = false
    } else if (inventoryRes.ok) {
      try {
        const j = await inventoryRes.json()
        inventoryAccessible = true
        inventoryItemCount  = (j?.assets ?? []).length
      } catch {}
    }
  }

  // ── Compute risk score ─────────────────────────────────────────────────────
  let score = 0
  const reasons: string[] = []

  // Account age
  if (accountAgeDays !== null) {
    if (accountAgeDays < 90)        { score += 25; reasons.push('New account (<90 days)') }
    else if (accountAgeDays < 365)  { score += 15; reasons.push('Account younger than 1 year') }
    else if (accountAgeDays < 1095) { score +=  8; reasons.push('Account 1–3 years old') }
  }

  // Profile visibility
  if (isProfilePublic === false) { score += 12; reasons.push('Private profile') }
  if (!hasProfileState)          { score +=  6; reasons.push('Profile not configured') }

  // Games owned
  if (totalGames !== null) {
    if (totalGames < 5)       { score += 12; reasons.push('Very few games owned (<5)') }
    else if (totalGames < 20) { score +=  6; reasons.push('Few games owned (5–20)') }
  }

  // CS2 hours
  if (cs2Hours !== null) {
    if (cs2Hours < 50)        { score += 15; reasons.push('Low CS2 hours (<50h)') }
    else if (cs2Hours < 200)  { score +=  8; reasons.push('Moderate CS2 hours (50–200h)') }
  }

  // Recent playtime spike
  if (playtime2wHours !== null && cs2Hours !== null) {
    if (playtime2wHours > 30 && cs2Hours < 100) {
      score += 12; reasons.push('Unusual recent playtime spike vs. low lifetime hours')
    }
  }

  // Inventory
  if (inventoryAccessible === false) { score += 8; reasons.push('Inventory is private') }
  if (inventoryAccessible === true && inventoryItemCount !== null) {
    if (inventoryItemCount === 0)  { score += 6;  reasons.push('Empty inventory') }
    else if (inventoryItemCount > 20) { score -= 6 }
  }

  // Bans
  if (hasVACBans)  { score += 40; reasons.push('VAC ban present') }
  if (hasGameBans) { score += 25; reasons.push('Game ban present') }
  if ((hasVACBans || hasGameBans) && daysSinceLastBan !== null && daysSinceLastBan < 365) {
    score += 15; reasons.push('Ban within the last year')
  }

  score = Math.max(0, Math.min(100, score))

  const level: 'Low' | 'Medium' | 'High' =
    score >= 60 ? 'High' : score >= 30 ? 'Medium' : 'Low'

  const message =
    level === 'High'   ? '⚠ This account may be purchased.' :
    level === 'Medium' ? 'This account shows some signs of being purchased.' :
                         'No strong signs of a purchased account were detected.'

  const result: RiskResult = {
    steamid: id,
    score,
    level,
    message,
    reasons,
    signals: {
      accountAgeDays,
      isProfilePublic,
      hasVACBans,
      hasGameBans,
      daysSinceLastBan,
      totalGames,
      cs2Hours,
      playtime2wHours,
      inventoryAccessible,
      inventoryItemCount,
    },
  }

  setCache(cacheKey, result, CACHE_TTL)

  return NextResponse.json(result, {
    headers: { 'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400' },
  })
}
