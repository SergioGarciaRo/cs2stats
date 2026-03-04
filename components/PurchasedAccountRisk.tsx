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
  Medium: '#fbbf24',
  Low:    '#22c55e',
}

const LEVEL_BG: Record<string, string> = {
  High:   'rgba(239,68,68,0.1)',
  Medium: 'rgba(251,191,36,0.1)',
  Low:    'rgba(34,197,94,0.1)',
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

  const card: React.CSSProperties = {
    background: 'var(--card)',
    border: '1px solid var(--card-border)',
    borderRadius: 14,
    padding: 20,
    marginTop: 16,
  }

  if (loading) return (
    <div style={card}>
      <div style={{ fontSize: 13, color: 'var(--muted)' }}>Analyzing account…</div>
    </div>
  )

  if (error || !data) return (
    <div style={card}>
      <div style={{ fontSize: 13, color: 'var(--muted)' }}>Unable to analyze this account right now.</div>
    </div>
  )

  const color = LEVEL_COLOR[data.level]
  const bg    = LEVEL_BG[data.level]
  const visibleReasons = data.reasons.slice(0, 5)
  const extra = data.reasons.length - visibleReasons.length

  const sigRows: [string, string][] = [
    ['Account age', data.signals.accountAgeDays != null ? `${data.signals.accountAgeDays} days` : 'unknown'],
    ['Profile public', data.signals.isProfilePublic != null ? (data.signals.isProfilePublic ? 'Yes' : 'No') : 'unknown'],
    ['VAC bans', data.signals.hasVACBans ? 'Yes' : 'No'],
    ['Game bans', data.signals.hasGameBans ? 'Yes' : 'No'],
    ['Last ban (days)', data.signals.daysSinceLastBan != null ? String(data.signals.daysSinceLastBan) : '—'],
    ['Total games', data.signals.totalGames != null ? String(data.signals.totalGames) : 'unknown'],
    ['CS2 hours', data.signals.cs2Hours != null ? `${data.signals.cs2Hours}h` : 'unknown'],
    ['2-week hours', data.signals.playtime2wHours != null ? `${data.signals.playtime2wHours}h` : 'unknown'],
    ['Inventory', data.signals.inventoryAccessible === false ? 'Private' : data.signals.inventoryItemCount != null ? `${data.signals.inventoryItemCount} items` : 'unknown'],
  ]

  return (
    <div style={{ ...card, borderLeft: `3px solid ${color}` }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
          Purchased Account Risk
        </div>
        <span style={{
          padding: '3px 10px', borderRadius: 20,
          background: bg, color, fontSize: 12, fontWeight: 700,
          border: `1px solid ${color}40`,
        }}>
          {data.level}
        </span>
      </div>

      {/* Score + message */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 40, fontWeight: 800, color, lineHeight: 1 }}>
            {data.score}
            <span style={{ fontSize: 18, color: 'var(--muted)', fontWeight: 500 }}>/100</span>
          </div>
        </div>
        <div style={{ fontSize: 13, color: '#d1d5db', paddingBottom: 4, lineHeight: 1.5 }}>
          {data.message}
        </div>
      </div>

      {/* Reasons */}
      {visibleReasons.length > 0 && (
        <ul style={{ margin: '8px 0 0 0', padding: '0 0 0 18px', fontSize: 13, color: 'var(--muted)', lineHeight: 1.8 }}>
          {visibleReasons.map((r, i) => <li key={i}>{r}</li>)}
          {extra > 0 && <li style={{ color: '#52525b' }}>+{extra} more signal{extra > 1 ? 's' : ''}</li>}
        </ul>
      )}

      {/* Collapsible signals */}
      <button
        onClick={() => setShowSignals(v => !v)}
        style={{
          marginTop: 14, background: 'none', border: 'none',
          color: 'var(--muted)', fontSize: 12, cursor: 'pointer',
          padding: 0, textDecoration: 'underline',
        }}
      >
        {showSignals ? 'Hide signals ▲' : 'Show raw signals ▼'}
      </button>

      {showSignals && (
        <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px' }}>
          {sigRows.map(([label, val]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '3px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ color: '#71717a' }}>{label}</span>
              <span style={{ color: '#a1a1aa', fontWeight: 600 }}>{val}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
