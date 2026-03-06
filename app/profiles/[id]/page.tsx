"use client"
import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import MapStatsTable from '../../../components/MapStatsTable'
import InventoryValue from '../../../components/InventoryValue'
import PurchasedAccountRisk from '../../../components/PurchasedAccountRisk'

// Recharts uses browser APIs — skip SSR
const PerformanceCharts = dynamic(
  () => import('../../../components/PerformanceCharts'),
  { ssr: false }
)

function VoteSection({ steamId, name, avatar, initialYes, initialNo }: {
  steamId: string; name: string; avatar: string; initialYes: number; initialNo: number
}) {
  const [yes, setYes] = useState(initialYes)
  const [no, setNo] = useState(initialNo)
  const [voted, setVoted] = useState<'yes' | 'no' | 'already' | null>(null)
  const [loading, setLoading] = useState(false)

  async function vote(v: 'yes' | 'no') {
    if (loading || voted === 'already') return
    setLoading(true)
    const res = await fetch(`/api/vote/${steamId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vote: v, name, avatar }),
    })
    const data = await res.json()
    setYes(data.yes ?? yes)
    setNo(data.no ?? no)
    setVoted(res.status === 429 ? 'already' : v)
    setLoading(false)
  }

  const total = yes + no
  const yesPct = total > 0 ? Math.round((yes / total) * 100) : 0
  const noPct = total > 0 ? 100 - yesPct : 0

  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>
        Is this player cheating?
      </div>

      {voted === 'already' ? (
        <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 8 }}>You already voted on this profile</div>
      ) : voted ? (
        <div style={{ fontSize: 13, color: voted === 'yes' ? '#f87171' : '#4ade80', fontWeight: 700, marginBottom: 8 }}>
          {voted === 'yes' ? '⚠ You voted: Yes, cheater' : '✓ You voted: No, clean player'}
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          <button onClick={() => vote('yes')} disabled={loading} style={{
            padding: '7px 16px', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 13,
            background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171',
            opacity: loading ? 0.6 : 1, transition: 'background 0.15s',
          }}>⚠ Yes, cheater</button>
          <button onClick={() => vote('no')} disabled={loading} style={{
            padding: '7px 16px', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 13,
            background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', color: '#4ade80',
            opacity: loading ? 0.6 : 1, transition: 'background 0.15s',
          }}>✓ No, clean</button>
        </div>
      )}

      {total > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>
            <span style={{ color: '#f87171' }}>Cheater {yesPct}% ({yes})</span>
            <span style={{ color: '#4ade80' }}>Clean {noPct}% ({no})</span>
          </div>
          <div style={{ height: 6, borderRadius: 3, background: 'rgba(34,197,94,0.2)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${yesPct}%`, background: 'linear-gradient(90deg, #ef4444, #f87171)', borderRadius: 3, transition: 'width 0.4s ease' }} />
          </div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{total} community vote{total !== 1 ? 's' : ''}</div>
        </div>
      )}
    </div>
  )
}

interface MatchStats {
  matchId: string
  date: string
  map: string
  kd: number
  adr: number
  hsPercent: number
  win: boolean
  kills: number
}

interface Medal {
  name: string
  xp: string
  level: string
  icon: string
  unlocked: string
}

interface ProfileData {
  profile: {
    steamId: string
    name: string | null
    avatar: string | null
    visibility: string
    memberSince: string | null
    vacBanned: boolean
    tradeBanState: string | null
  }
  cs2: { ok: boolean; hours?: string; reason?: string }
  risk: string
  faceit: { level?: number; elo?: number; faceitName?: string; reason?: string } | null
  medals: { items?: Medal[]; reason?: string } | null
  inventory: {
    totalItems?: number
    marketableItems?: number
    approximateValueUSD?: number | null
    isPartial?: boolean
    pricingFailed?: boolean
    topSkins?: Array<{ name: string; price: number; icon: string }>
    reason?: string
  } | null
  leetify?: {
    aim?: number | null
    positioning?: number | null
    utility?: number | null
    opening?: number | null
    clutch?: number | null
    overall?: number | null
    ctRating?: number | null
    tRating?: number | null
    gameCount?: number | null
    roundCount?: number | null
    premierElo?: number | null
    recentMatches?: string[]
    reason?: string
  } | null
  cs2Stats?: { kills?: number; deaths?: number; kd?: number; hsPct?: number; accuracy?: number; winRate?: number; mvps?: number; matchesPlayed?: number; reason?: string } | null
  bans?: { communityBanned?: boolean; vacBanned?: boolean; numberOfVACBans?: number; numberOfGameBans?: number; daysSinceLastBan?: number; economyBan?: string; reason?: string } | null
  matchHistory?: { matches?: MatchStats[]; reason?: string } | null
  fetchedAt: number
  votes?: { yes: number; no: number }
}

function riskColor(risk: string) {
  if (risk.includes('high')) return 'var(--danger)'
  if (risk.includes('elevated')) return 'var(--accent2)'
  if (risk.includes('unknown')) return '#a78bfa'
  return 'var(--success)'
}
function riskLabel(risk: string) {
  if (risk.includes('high')) return 'HIGH'
  if (risk.includes('elevated')) return 'ELEVATED'
  if (risk.includes('unknown')) return 'UNKNOWN'
  return 'LOW'
}
function riskPct(risk: string) {
  if (risk.includes('high')) return '90%'
  if (risk.includes('elevated')) return '60%'
  if (risk.includes('unknown')) return '40%'
  return '20%'
}

export default function ProfilePage() {
  const params = useParams() as { id: string }
  const searchParams = useSearchParams()
  const debug = searchParams?.get('debug') === '1'
  const [data, setData] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!params.id) return
    let cancelled = false
    setLoading(true)
    setError(null)
    setData(null)
    fetch(`/api/profile/${params.id}`)
      .then(async (res) => {
        const j = await res.json()
        if (!res.ok) throw new Error(j.error || 'Failed to load profile')
        if (!cancelled) setData(j)
      })
      .catch((e) => { if (!cancelled) setError(e.message || String(e)) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [params.id])

  const faceitLevel = data?.faceit?.level ?? null
  const faceitElo = data?.faceit?.elo ?? null
  const faceitName = data?.faceit?.faceitName ?? null
  const hasFaceit = faceitLevel !== null

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>
      <a href="/" style={{ fontSize: 14, color: 'var(--muted)' }}>← Back</a>

      {loading && (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--muted)', fontSize: 18 }}>
          Loading profile...
        </div>
      )}

      {!loading && error && (
        <div className="card" style={{ marginTop: 24, borderLeft: '3px solid var(--danger)' }}>
          <div style={{ color: 'var(--danger)', fontWeight: 700, marginBottom: 4 }}>Error</div>
          <div style={{ color: 'var(--muted)' }}>{error}</div>
        </div>
      )}

      {!loading && !error && data && (
        <div>
          {/* ── Banner sospechoso ───────────────────────────────────── */}
          {(data.votes?.yes ?? 0) >= 10 && (
            <div style={{
              marginTop: 20,
              padding: '14px 20px',
              borderRadius: 12,
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.35)',
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <span style={{ fontSize: 22 }}>⚠️</span>
              <div>
                <div style={{ fontWeight: 700, color: '#f87171', fontSize: 14 }}>
                  Suspected cheater by the community
                </div>
                <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>
                  {data.votes!.yes} players have flagged this profile as suspicious
                </div>
              </div>
            </div>
          )}

          {/* ── Header ─────────────────────────────────────────────── */}
          <div className="card" style={{ marginTop: 20, display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            {data.profile.avatar && (
              <a href={`https://steamcommunity.com/profiles/${data.profile.steamId}`} target="_blank" rel="noreferrer">
                <img src={data.profile.avatar} alt="avatar" className="profile-avatar" style={{ display: 'block' }} />
              </a>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <div className="profile-name">{data.profile.name || 'Unknown Profile'}</div>
                <a
                  href={`https://steamcommunity.com/profiles/${data.profile.steamId}`}
                  target="_blank" rel="noreferrer"
                  style={{ fontSize: 11, color: 'var(--muted)', padding: '2px 8px', borderRadius: 6, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', whiteSpace: 'nowrap' }}
                >
                  View on Steam ↗
                </a>
              </div>
              <div className="profile-id" style={{ cursor: 'pointer', userSelect: 'all' }} title="Click to select">{data.profile.steamId}</div>
              {data.profile.memberSince && (
                <div className="profile-age">Member since {data.profile.memberSince}</div>
              )}
              <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                <span style={{
                  padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                  background: data.profile.visibility === 'public' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                  color: data.profile.visibility === 'public' ? 'var(--success)' : 'var(--danger)',
                  border: `1px solid ${data.profile.visibility === 'public' ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`,
                }}>
                  {data.profile.visibility === 'public' ? '🌐 Public' : '🔒 Private'}
                </span>
                {data.profile.vacBanned && (
                  <span style={{
                    padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                    background: 'rgba(239,68,68,0.15)', color: 'var(--danger)',
                    border: '1px solid rgba(239,68,68,0.35)',
                  }}>🚫 VAC Banned</span>
                )}
                {hasFaceit && (
                  <a
                    href={`https://www.faceit.com/en/players/${faceitName}`}
                    target="_blank" rel="noreferrer"
                    style={{
                      padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                      background: 'rgba(255,122,24,0.15)', color: '#ff7a18',
                      border: '1px solid rgba(255,122,24,0.3)', textDecoration: 'none',
                    }}
                  >FACEIT Lv.{faceitLevel}</a>
                )}
                {data.leetify?.premierElo != null && (
                  <span style={{
                    padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                    background: 'rgba(99,179,237,0.12)', color: '#60a5fa',
                    border: '1px solid rgba(99,179,237,0.25)',
                  }}>Premier {data.leetify.premierElo.toLocaleString()}</span>
                )}
                {(data.votes?.yes ?? 0) > 0 && (
                  <span style={{
                    padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                    background: 'rgba(239,68,68,0.12)', color: '#f87171',
                    border: '1px solid rgba(239,68,68,0.2)',
                  }}>⚠ {data.votes!.yes} report{data.votes!.yes !== 1 ? 's' : ''}</span>
                )}
              </div>

              <VoteSection
                steamId={data.profile.steamId}
                name={data.profile.name || 'Unknown'}
                avatar={data.profile.avatar || ''}
                initialYes={data.votes?.yes ?? 0}
                initialNo={data.votes?.no ?? 0}
              />
            </div>
          </div>

          {/* ── Top stats ───────────────────────────────────────────── */}
          <div className="top-stats">
            <div className="top-stat-card">
              <div className="stat-label">Cheating Risk</div>
              <div className="top-stat-value" style={{ color: riskColor(data.risk) }}>
                {riskLabel(data.risk)}
              </div>
            </div>
            <div className="top-stat-card">
              <div className="stat-label">CS2 Hours</div>
              <div className="top-stat-value">
                {data.cs2.ok ? data.cs2.hours : '—'}
              </div>
              {!data.cs2.ok && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>Private or no data</div>}
            </div>
            <div className="top-stat-card">
              <div className="stat-label">FACEIT Level</div>
              <div className="top-stat-value" style={{ color: hasFaceit ? '#ff7a18' : 'var(--muted)' }}>
                {hasFaceit ? faceitLevel : '—'}
              </div>
              {faceitElo && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{faceitElo} ELO</div>}
            </div>
            <div className="top-stat-card">
              <div className="stat-label">Leetify Rating</div>
              <div className="top-stat-value" style={{ color: data.leetify?.overall != null ? '#a78bfa' : 'var(--muted)' }}>
                {data.leetify?.overall != null ? (data.leetify.overall > 0 ? `+${data.leetify.overall}` : String(data.leetify.overall)) : '—'}
              </div>
              {data.leetify?.premierElo != null && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{data.leetify.premierElo.toLocaleString()} Premier ELO</div>}
            </div>
            <div className="top-stat-card">
              <div className="stat-label">Inventory</div>
              <div className="top-stat-value" style={{ color: (data.inventory?.approximateValueUSD ?? 0) > 0 ? '#f59e0b' : 'var(--muted)' }}>
                {(data.inventory?.approximateValueUSD ?? 0) > 0
                  ? `$${data.inventory!.approximateValueUSD!.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
                  : data.inventory?.reason === 'private' ? '🔒' : '—'}
              </div>
              {data.inventory?.totalItems != null && (
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                  {data.inventory.totalItems} items{data.inventory.isPartial ? ' (partial)' : ''}
                </div>
              )}
            </div>
          </div>

          {/* ── Purchased Account Risk ──────────────────────────────── */}
          <PurchasedAccountRisk steamId={data.profile.steamId} />

          {/* ── Grid principal ──────────────────────────────────────── */}
          <div className="page-grid">

            {/* Columna izquierda */}
            <div className="left-column">
              <div className="card">
                <div className="stat-label">Account Age</div>
                <div style={{ fontSize: 15, fontWeight: 600, marginTop: 4, color: '#fff' }}>
                  {data.profile.memberSince || 'Unknown'}
                </div>
              </div>

              <div className="card">
                <div className="stat-label">Cheater Risk</div>
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: riskColor(data.risk), fontWeight: 700 }}>{riskLabel(data.risk)}</span>
                  </div>
                  <div className="risk-bar">
                    <div className="risk-bar-inner" style={{ width: riskPct(data.risk), background: riskColor(data.risk) }} />
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{data.risk}</div>
                </div>
              </div>

              <div className="card" style={{ borderLeft: data.bans?.vacBanned || (data.bans?.numberOfGameBans ?? 0) > 0 ? '3px solid var(--danger)' : undefined }}>
                <div className="stat-label">Ban History</div>
                {data.bans && !data.bans.reason ? (
                  <div style={{ marginTop: 6 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: data.bans.vacBanned || (data.bans.numberOfGameBans ?? 0) > 0 ? 'var(--danger)' : 'var(--success)' }}>
                      {data.bans.vacBanned || (data.bans.numberOfGameBans ?? 0) > 0 ? 'BANNED' : 'Clean'}
                    </div>
                    {(data.bans.numberOfVACBans ?? 0) > 0 && (
                      <div style={{ fontSize: 12, color: '#f87171', marginTop: 4 }}>VAC Bans: {data.bans.numberOfVACBans}</div>
                    )}
                    {(data.bans.numberOfGameBans ?? 0) > 0 && (
                      <div style={{ fontSize: 12, color: '#f87171', marginTop: 2 }}>Game Bans: {data.bans.numberOfGameBans}</div>
                    )}
                    {((data.bans.numberOfVACBans ?? 0) > 0 || (data.bans.numberOfGameBans ?? 0) > 0) && (
                      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                        Last ban: {data.bans.daysSinceLastBan} days ago
                      </div>
                    )}
                    {data.bans.economyBan && data.bans.economyBan !== 'none' && (
                      <div style={{ fontSize: 11, color: '#fbbf24', marginTop: 2 }}>Trade: {data.bans.economyBan}</div>
                    )}
                  </div>
                ) : (
                  <div style={{ marginTop: 4, fontSize: 15, fontWeight: 700, color: data.profile.vacBanned ? 'var(--danger)' : 'var(--success)' }}>
                    {data.profile.vacBanned ? 'Banned' : 'Clean'}
                  </div>
                )}
              </div>

              {/* FACEIT card */}
              {hasFaceit ? (
                <div className="card" style={{ borderLeft: '3px solid #ff7a18' }}>
                  <div className="stat-label">FACEIT</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10 }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: 10,
                      background: 'linear-gradient(135deg, #ff7a18, #ffba18)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 22, fontWeight: 800, color: '#fff', flexShrink: 0,
                    }}>{faceitLevel}</div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#fff' }}>{faceitName || '—'}</div>
                      {faceitElo && <div style={{ fontSize: 12, color: '#ff7a18' }}>{faceitElo} ELO</div>}
                      {faceitName && (
                        <a href={`https://www.faceit.com/en/players/${faceitName}`} target="_blank" rel="noreferrer" style={{ fontSize: 12 }}>
                          View on FACEIT →
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="card" style={{ opacity: 0.5 }}>
                  <div className="stat-label">FACEIT</div>
                  <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 6 }}>
                    {data.faceit?.reason === 'no_api_key'
                      ? 'Set FACEIT_API_KEY to enable this'
                      : 'Not found on FACEIT'}
                  </div>
                </div>
              )}

            </div>

            {/* Columna derecha */}
            <div>
              {/* CS2 Hours + recent matches from Leetify */}
              <div className="card" style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <div className="stat-label" style={{ margin: '0 0 4px 0' }}>CS2 Hours</div>
                    <div style={{ fontSize: 32, fontWeight: 800, color: '#fff', lineHeight: 1 }}>
                      {data.cs2.ok ? data.cs2.hours : '—'}
                    </div>
                    {!data.cs2.ok && (
                      <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
                        {data.cs2.reason || 'Private profile or no data'}
                      </div>
                    )}
                  </div>
                  {data.leetify?.recentMatches && data.leetify.recentMatches.length > 0 && (
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>Recent matches</div>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {(data.leetify.recentMatches as string[]).slice(0, 8).map((r: string, i: number) => (
                          <div key={i} style={{
                            width: 26, height: 26, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 11, fontWeight: 700,
                            background: r === 'win' ? 'rgba(74,222,128,0.12)' : 'rgba(248,113,113,0.12)',
                            color: r === 'win' ? '#4ade80' : '#f87171',
                            border: `1px solid ${r === 'win' ? 'rgba(74,222,128,0.25)' : 'rgba(248,113,113,0.25)'}`,
                          }}>
                            {r === 'win' ? 'W' : 'L'}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* CS2 In-Game Stats */}
              {(() => {
                const officialOk = data.cs2Stats && !data.cs2Stats.reason
                const matches = data.matchHistory?.matches ?? []
                const faceitOk = !officialOk && matches.length > 0
                const faceitKd   = faceitOk ? Math.round((matches.reduce((a, m) => a + m.kd, 0) / matches.length) * 100) / 100 : null
                const faceitHs   = faceitOk ? Math.round(matches.reduce((a, m) => a + m.hsPercent, 0) / matches.length) : null
                const faceitWr   = faceitOk ? Math.round((matches.filter(m => m.win).length / matches.length) * 100) : null
                const faceitAdr  = faceitOk && matches.some(m => m.adr > 0) ? Math.round(matches.reduce((a, m) => a + m.adr, 0) / matches.length) : null
                const faceitKills = faceitOk ? matches.reduce((a, m) => a + m.kills, 0) : null
                return (
                  <div className="card" style={{ marginTop: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
                      <div className="stat-label" style={{ margin: 0 }}>CS2 Statistics</div>
                      <span style={{ padding: '2px 8px', borderRadius: 6, background: officialOk ? 'rgba(99,179,237,0.12)' : 'rgba(255,122,24,0.12)', color: officialOk ? '#63b3ed' : '#ff7a18', fontSize: 11, fontWeight: 600 }}>
                        {officialOk ? 'OFFICIAL' : faceitOk ? `FACEIT · last ${matches.length} matches` : 'OFFICIAL'}
                      </span>
                    </div>
                    {officialOk ? (
                      <>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                          {[
                            { label: 'K/D Ratio',   val: data.cs2Stats!.kd,                    color: (data.cs2Stats!.kd ?? 0) > 4 ? '#f87171' : '#fff',   flag: (data.cs2Stats!.kd ?? 0) > 4 },
                            { label: 'Headshot %',  val: `${data.cs2Stats!.hsPct}%`,            color: (data.cs2Stats!.hsPct ?? 0) > 65 ? '#f87171' : '#fff', flag: (data.cs2Stats!.hsPct ?? 0) > 65 },
                            { label: 'Accuracy',    val: `${data.cs2Stats!.accuracy}%`,         color: (data.cs2Stats!.accuracy ?? 0) > 35 ? '#f87171' : '#fff', flag: (data.cs2Stats!.accuracy ?? 0) > 35 },
                            { label: 'Win Rate',    val: `${data.cs2Stats!.winRate}%`,          color: '#fff', flag: false },
                            { label: 'Total Kills', val: data.cs2Stats!.kills?.toLocaleString(), color: '#fff', flag: false },
                            { label: 'MVPs',        val: data.cs2Stats!.mvps?.toLocaleString(),  color: '#fff', flag: false },
                          ].map((s) => (
                            <div key={s.label} style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${s.flag ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 10, padding: '10px 12px', textAlign: 'center' }}>
                              <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
                              <div style={{ fontSize: 18, fontWeight: 800, color: s.color, marginTop: 4 }}>
                                {s.flag && <span style={{ fontSize: 12, marginRight: 3 }}>⚠</span>}{s.val ?? '—'}
                              </div>
                            </div>
                          ))}
                        </div>
                        {((data.cs2Stats!.hsPct ?? 0) > 65 || (data.cs2Stats!.kd ?? 0) > 4 || (data.cs2Stats!.accuracy ?? 0) > 35) && (
                          <div style={{ marginTop: 10, padding: '8px 12px', borderRadius: 8, background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', fontSize: 12, color: '#f87171' }}>
                            ⚠ Suspicious stats detected — unusually high values flagged in red
                          </div>
                        )}
                      </>
                    ) : faceitOk ? (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                        {[
                          { label: 'Avg K/D',     val: faceitKd,           color: (faceitKd ?? 0) > 4 ? '#f87171' : '#fff' },
                          { label: 'Avg HS%',     val: faceitHs != null ? `${faceitHs}%` : null, color: (faceitHs ?? 0) > 65 ? '#f87171' : '#fff' },
                          { label: 'Win Rate',    val: faceitWr != null ? `${faceitWr}%` : null, color: '#fff' },
                          { label: 'Avg ADR',     val: faceitAdr,          color: '#fff' },
                          { label: 'Total Kills', val: faceitKills?.toLocaleString(), color: '#fff' },
                          { label: 'Matches',     val: matches.length,     color: '#fff' },
                        ].map((s) => (
                          <div key={s.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '10px 12px', textAlign: 'center' }}>
                            <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
                            <div style={{ fontSize: 18, fontWeight: 800, color: s.color, marginTop: 4 }}>{s.val ?? '—'}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ color: 'var(--muted)', fontSize: 13 }}>
                        {data.cs2Stats?.reason === 'private'
                          ? 'Stats are private and no FACEIT match history available'
                          : data.cs2Stats?.reason === 'no_api_key'
                          ? 'Steam API key not configured'
                          : 'No CS2 statistics available'}
                      </div>
                    )}
                  </div>
                )
              })()}

              {/* Métricas Leetify */}
              <div className="card" style={{ marginTop: 16 }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className="stat-label" style={{ margin: 0 }}>Leetify Performance</div>
                    <span style={{ padding: '2px 8px', borderRadius: 6, background: 'rgba(167,139,250,0.12)', color: '#a78bfa', fontSize: 11, fontWeight: 600 }}>
                      CS2
                    </span>
                    {data.leetify && !data.leetify.reason && (data.leetify.gameCount != null || data.leetify.roundCount != null) && (
                      <span style={{ fontSize: 11, color: 'var(--muted)' }}>
                        {data.leetify.gameCount != null ? `${data.leetify.gameCount} recent games` : ''}
                        {data.leetify.gameCount != null && data.leetify.roundCount != null ? ' · ' : ''}
                        {data.leetify.roundCount != null ? `${data.leetify.roundCount} rounds` : ''}
                      </span>
                    )}
                  </div>
                  {data.leetify && !data.leetify.reason && (
                    <a href={`https://leetify.com/app/profile/${data.profile.steamId}`} target="_blank" rel="noreferrer"
                       style={{ fontSize: 12, color: '#a78bfa' }}>
                      View on Leetify →
                    </a>
                  )}
                </div>

                {data.leetify && !data.leetify.reason ? (
                  <>
                    {/* Overall Leetify rating + CT/T + Premier ELO */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid rgba(255,255,255,0.06)', flexWrap: 'wrap' }}>
                      {data.leetify.overall != null && (
                        <div>
                          <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 2 }}>Leetify Rating</div>
                          <div style={{ fontSize: 28, fontWeight: 800, color: data.leetify.overall >= 0 ? '#a78bfa' : '#f87171', lineHeight: 1 }}>
                            {data.leetify.overall > 0 ? '+' : ''}{data.leetify.overall}
                          </div>
                          {(data.leetify.ctRating != null || data.leetify.tRating != null) && (
                            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4, display: 'flex', gap: 8 }}>
                              {data.leetify.ctRating != null && <span style={{ color: '#7dd3fc' }}>CT {data.leetify.ctRating > 0 ? '+' : ''}{data.leetify.ctRating}</span>}
                              {data.leetify.tRating != null && <span style={{ color: '#fca5a5' }}>T {data.leetify.tRating > 0 ? '+' : ''}{data.leetify.tRating}</span>}
                            </div>
                          )}
                        </div>
                      )}
                      {data.leetify.premierElo != null && (
                        <div>
                          <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 2 }}>Premier ELO</div>
                          <div style={{ fontSize: 28, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{data.leetify.premierElo.toLocaleString()}</div>
                        </div>
                      )}
                    </div>

                    {/* Percentile bars: Aim / Positioning / Utility — 3 columns */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px 16px', marginBottom: 14 }}>
                      {([
                        { label: 'Aim',         val: data.leetify.aim },
                        { label: 'Positioning', val: data.leetify.positioning },
                        { label: 'Utility',     val: data.leetify.utility },
                      ] as { label: string; val: number | null | undefined }[]).map((m) => (
                        <div key={m.label}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                            <span style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{m.label}</span>
                            <span style={{ fontSize: 14, fontWeight: 700, color: '#a78bfa' }}>
                              {m.val != null ? `${m.val}%` : '—'}
                            </span>
                          </div>
                          <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
                            <div style={{ height: '100%', borderRadius: 2, background: '#a78bfa', width: m.val != null ? `${Math.min(m.val, 100)}%` : '0%' }} />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Opening / Clutch — 2 columns, value badges */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px' }}>
                      {([
                        { label: 'Opening Duel', val: data.leetify.opening },
                        { label: 'Clutch',       val: data.leetify.clutch },
                      ] as { label: string; val: number | null | undefined }[]).map((m) => (
                        <div key={m.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{m.label}</span>
                          <span style={{ fontSize: 15, fontWeight: 700, color: m.val != null && m.val >= 0 ? '#4ade80' : '#f87171' }}>
                            {m.val != null ? (m.val > 0 ? `+${m.val}` : String(m.val)) : '—'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div style={{ color: 'var(--muted)', fontSize: 13 }}>
                    No Leetify data — profile may be private or not registered
                  </div>
                )}
              </div>

              {/* Debug */}
              {debug && (
                <div className="card" style={{ marginTop: 16 }}>
                  <div className="stat-label">Raw data (debug)</div>
                  <pre style={{
                    maxHeight: 300, overflow: 'auto', background: '#0b1220',
                    color: '#dbeafe', padding: 12, borderRadius: 8, fontSize: 11, marginTop: 8,
                  }}>
                    {JSON.stringify(data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* ── Performance Evolution ───────────────────────────────── */}
          <div style={{ marginTop: 32 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 16 }}>
              Performance Evolution
            </div>
            {data.matchHistory?.matches && data.matchHistory.matches.length > 0
              ? <PerformanceCharts matches={data.matchHistory.matches} />
              : (
                <div className="card">
                  <div style={{ color: 'var(--muted)', fontSize: 13 }}>
                    {data.matchHistory?.reason === 'no_faceit_account'
                      ? 'No FACEIT account linked — match history unavailable'
                      : 'No match history available'}
                  </div>
                </div>
              )
            }
          </div>

          {/* ── Map Performance ─────────────────────────────────────── */}
          <div style={{ marginTop: 24 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 16 }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>Map Performance</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>last 30 FACEIT matches</div>
            </div>
            {data.matchHistory?.matches && data.matchHistory.matches.length > 0
              ? <MapStatsTable matches={data.matchHistory.matches} />
              : (
                <div className="card">
                  <div style={{ color: 'var(--muted)', fontSize: 13 }}>No map statistics available</div>
                </div>
              )
            }
          </div>

          {/* ── Inventory Value ─────────────────────────────────────── */}
          {data.inventory && !data.inventory.reason && (data.inventory.topSkins?.length || (data.inventory.totalItems ?? 0) > 0) && (
            <div style={{ marginTop: 24 }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 16 }}>
                Inventory Value
              </div>
              <InventoryValue
                totalValue={data.inventory.approximateValueUSD ?? undefined}
                topSkins={data.inventory.topSkins}
                totalItems={data.inventory.totalItems}
                isPrivate={!!data.inventory.reason}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
