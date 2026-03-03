"use client"
import { useEffect, useState } from 'react'

interface ViewedProfile {
  steamId: string
  name: string
  avatar: string
  views: number
  lastSeen: number
}

export default function TopViewedPage() {
  const [profiles, setProfiles] = useState<ViewedProfile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/top-profiles')
      .then(r => r.json())
      .then(d => { setProfiles(d.mostViewed || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 16px' }}>
      <a href="/" style={{ fontSize: 14, color: 'var(--muted)' }}>← Back</a>

      <div style={{ marginTop: 24, marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', margin: '0 0 6px 0' }}>
          👁 Most Viewed Profiles
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 14, margin: 0 }}>
          Profiles viewed most often on this platform. Resets when the server restarts.
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
          No profiles viewed yet.<br />
          <span style={{ fontSize: 13 }}>Data populates as users search for profiles.</span>
        </div>
      )}

      {!loading && profiles.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {profiles.map((p, i) => (
            <a
              key={p.steamId}
              href={`/profiles/${p.steamId}`}
              style={{
                display: 'flex', alignItems: 'center', gap: 16,
                padding: '16px 20px', borderRadius: 14, textDecoration: 'none',
                background: 'var(--card)', border: '1px solid var(--card-border)',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#252b3a')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--card)')}
            >
              <div style={{
                width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                background: i === 0 ? 'rgba(125,211,252,0.15)' : 'rgba(255,255,255,0.05)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 800,
                color: i === 0 ? '#7dd3fc' : 'var(--muted)',
              }}>#{i + 1}</div>

              {p.avatar ? (
                <img src={p.avatar} alt="" style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
              ) : (
                <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(255,255,255,0.05)', flexShrink: 0 }} />
              )}

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, color: '#fff', fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {p.name}
                </div>
                <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'monospace', marginTop: 2 }}>{p.steamId}</div>
              </div>

              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 26, fontWeight: 800, color: '#7dd3fc', lineHeight: 1 }}>{p.views}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>view{p.views !== 1 ? 's' : ''}</div>
              </div>
            </a>
          ))}
        </div>
      )}

      <div style={{ marginTop: 32, fontSize: 12, color: '#3f3f46', textAlign: 'center' }}>
        View counts reset on server restart · Only profiles searched on this platform are tracked
      </div>
    </div>
  )
}
