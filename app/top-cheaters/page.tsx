"use client"
import { useEffect, useState } from 'react'

interface SuspectedProfile {
  steamId: string
  name: string
  avatar: string
  yes: number
  no: number
}

export default function TopCheatersPage() {
  const [profiles, setProfiles] = useState<SuspectedProfile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/top-profiles')
      .then(r => r.json())
      .then(d => { setProfiles(d.mostReported || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 16px' }}>
      <a href="/" style={{ fontSize: 14, color: 'var(--muted)' }}>← Volver</a>

      <div style={{ marginTop: 24, marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', margin: '0 0 6px 0' }}>
          ⚠ Most Suspected Cheaters
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 14, margin: 0 }}>
          Profiles flagged by the community. Ranked by number of "cheater" votes.
        </p>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)' }}>Loading...</div>
      )}

      {!loading && profiles.length === 0 && (
        <div style={{
          padding: '48px 24px', textAlign: 'center', borderRadius: 14,
          background: 'var(--card)', border: '1px solid var(--card-border)',
          color: 'var(--muted)', fontSize: 15,
        }}>
          No reported profiles yet.<br />
          <span style={{ fontSize: 13 }}>Data resets when the server restarts.</span>
        </div>
      )}

      {!loading && profiles.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {profiles.map((p, i) => {
            const total = p.yes + p.no
            const yesPct = total > 0 ? Math.round((p.yes / total) * 100) : 0
            return (
              <a
                key={p.steamId}
                href={`/profiles/${p.steamId}`}
                style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  padding: '16px 20px', borderRadius: 14, textDecoration: 'none',
                  background: 'var(--card)',
                  border: p.yes >= 10 ? '1px solid rgba(239,68,68,0.35)' : '1px solid var(--card-border)',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#252b3a')}
                onMouseLeave={e => (e.currentTarget.style.background = 'var(--card)')}
              >
                {/* Rank */}
                <div style={{
                  width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                  background: i === 0 ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.05)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 800,
                  color: i === 0 ? '#f87171' : 'var(--muted)',
                }}>#{i + 1}</div>

                {/* Avatar */}
                {p.avatar ? (
                  <img src={p.avatar} alt="" style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
                ) : (
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(255,255,255,0.05)', flexShrink: 0 }} />
                )}

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, color: '#fff', fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.name}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'monospace', marginTop: 2 }}>{p.steamId}</div>

                  {/* Vote bar */}
                  {total > 0 && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ height: 5, borderRadius: 3, background: 'rgba(34,197,94,0.15)', overflow: 'hidden', width: '100%', maxWidth: 260 }}>
                        <div style={{ height: '100%', width: `${yesPct}%`, background: 'linear-gradient(90deg, #ef4444, #f87171)', borderRadius: 3 }} />
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>
                        {yesPct}% cheater · {total} votes
                      </div>
                    </div>
                  )}
                </div>

                {/* Vote count */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 26, fontWeight: 800, color: '#f87171', lineHeight: 1 }}>{p.yes}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>cheater votes</div>
                  {p.yes >= 10 && (
                    <div style={{
                      marginTop: 6, padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                      background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)',
                    }}>SUSPECTED</div>
                  )}
                </div>
              </a>
            )
          })}
        </div>
      )}

      <div style={{ marginTop: 32, fontSize: 12, color: '#3f3f46', textAlign: 'center' }}>
        Community votes do not constitute proof of cheating.
      </div>
    </div>
  )
}
