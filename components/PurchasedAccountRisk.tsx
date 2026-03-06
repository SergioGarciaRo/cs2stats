'use client'

import { useEffect, useState } from 'react'

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

const LEVEL_COLOR: Record<string, string> = {
  High:   '#ef4444',
  Medium: '#f59e0b',
  Low:    '#22c55e',
}
const LEVEL_GLOW: Record<string, string> = {
  High:   'rgba(239,68,68,0.18)',
  Medium: 'rgba(245,158,11,0.14)',
  Low:    'rgba(34,197,94,0.12)',
}
const LEVEL_ICON: Record<string, string> = {
  High:   '🚨',
  Medium: '⚠️',
  Low:    '✅',
}

interface Props { steamId: string }

export default function PurchasedAccountRisk({ steamId }: Props) {
  const [data, setData]       = useState<RiskResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(false)
  const [showSignals, setShowSignals] = useState(false)

  useEffect(() => {
    setLoading(true)
    setError(false)
    fetch(`/api/purchased-risk/${steamId}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [steamId])

  const skeletonCard: React.CSSProperties = {
    background: 'var(--card)', border: '1px solid var(--card-border)',
    borderRadius: 16, padding: '20px 24px', marginTop: 16,
  }

  if (loading) return (
    <div style={skeletonCard}>
      <div style={{ fontSize: 13, color: 'var(--muted)' }}>Analyzing account risk…</div>
    </div>
  )
  if (error || !data) return (
    <div style={skeletonCard}>
      <div style={{ fontSize: 13, color: 'var(--muted)' }}>Unable to analyze this account right now.</div>
    </div>
  )

  const color = LEVEL_COLOR[data.level]
  const glow  = LEVEL_GLOW[data.level]
  const icon  = LEVEL_ICON[data.level]
  const pct   = Math.min(data.score, 100)

  const sigRows: [string, string][] = [
    ['Account age',    data.signals.accountAgeDays != null ? `${data.signals.accountAgeDays} days` : 'unknown'],
    ['Profile public', data.signals.isProfilePublic != null ? (data.signals.isProfilePublic ? 'Yes' : 'No') : 'unknown'],
    ['VAC bans',       data.signals.hasVACBans ? 'Yes' : 'No'],
    ['Game bans',      data.signals.hasGameBans ? 'Yes' : 'No'],
    ['Last ban',       data.signals.daysSinceLastBan != null ? `${data.signals.daysSinceLastBan}d ago` : '—'],
    ['Total games',    data.signals.totalGames != null ? String(data.signals.totalGames) : 'unknown'],
    ['CS2 hours',      data.signals.cs2Hours != null ? `${data.signals.cs2Hours}h` : 'unknown'],
    ['2-week hours',   data.signals.playtime2wHours != null ? `${data.signals.playtime2wHours}h` : 'unknown'],
    ['Inventory',      data.signals.inventoryAccessible === false ? 'Private' : data.signals.inventoryItemCount != null ? `${data.signals.inventoryItemCount} items` : 'unknown'],
  ]

  return (
    <div style={{
      background: `linear-gradient(135deg, var(--card) 70%, ${glow})`,
      border: `1px solid ${color}55`,
      borderLeft: `4px solid ${color}`,
      borderRadius: 16,
      padding: '20px 24px',
      marginTop: 16,
      boxShadow: `0 0 24px ${glow}`,
    }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>{icon}</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.09em' }}>
            Purchased Account Risk
          </span>
        </div>
        <span style={{
          padding: '4px 14px', borderRadius: 20,
          background: `${color}22`, color, fontSize: 13, fontWeight: 800,
          border: `1px solid ${color}55`, letterSpacing: '0.04em',
        }}>
          {data.level.toUpperCase()} RISK
        </span>
      </div>

      {/* ── Score + bar + message ── */}
      <div style={{ display: 'flex', gap: 24, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
        {/* Big score */}
        <div style={{ flexShrink: 0, textAlign: 'center' }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: `conic-gradient(${color} ${pct * 3.6}deg, rgba(255,255,255,0.06) 0deg)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 0 16px ${glow}`,
          }}>
            <div style={{
              width: 62, height: 62, borderRadius: '50%',
              background: 'var(--bg)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: 22, fontWeight: 900, color, lineHeight: 1 }}>{data.score}</span>
              <span style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 500 }}>/100</span>
            </div>
          </div>
        </div>

        {/* Message + bar */}
        <div style={{ flex: 1, minWidth: 160 }}>
          <div style={{ fontSize: 14, color: '#e5e7eb', fontWeight: 600, marginBottom: 10, lineHeight: 1.4 }}>
            {data.message}
          </div>
          <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 3,
              width: `${pct}%`,
              background: `linear-gradient(90deg, ${color}aa, ${color})`,
              transition: 'width 0.6s ease',
            }} />
          </div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>Risk score: {data.score}/100</div>
        </div>
      </div>

      {/* ── Reasons as chips ── */}
      {data.reasons.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
          {data.reasons.map((r, i) => (
            <span key={i} style={{
              padding: '4px 10px', borderRadius: 20, fontSize: 12,
              background: `${color}12`, border: `1px solid ${color}30`,
              color: '#d1d5db',
            }}>
              {r}
            </span>
          ))}
        </div>
      )}

      {/* ── Collapsible signals ── */}
      <button
        onClick={() => setShowSignals(v => !v)}
        style={{
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 8, color: 'var(--muted)', fontSize: 12, cursor: 'pointer',
          padding: '5px 12px', display: 'flex', alignItems: 'center', gap: 5,
        }}
      >
        {showSignals ? '▲ Hide signals' : '▼ Show raw signals'}
      </button>

      {showSignals && (
        <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 20px' }}>
          {sigRows.map(([label, val]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ color: '#71717a' }}>{label}</span>
              <span style={{ color: '#a1a1aa', fontWeight: 600 }}>{val}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
