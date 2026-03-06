"use client"
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { normalizeSteamInput } from '../lib/validate'

interface TopProfile {
  steamId: string
  name: string
  avatar: string
  views?: number
  yes?: number
}

function ProfileCard({ profile, label, labelColor }: { profile: TopProfile; label: string; labelColor: string }) {
  return (
    <a href={`/profiles/${profile.steamId}`} style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '10px 12px', borderRadius: 10,
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.06)',
      textDecoration: 'none', transition: 'background 0.15s',
    }}
    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
    >
      {profile.avatar ? (
        <img src={profile.avatar} alt="" style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
      ) : (
        <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(255,255,255,0.05)', flexShrink: 0 }} />
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {profile.name}
        </div>
        <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'monospace' }}>
          {profile.steamId.slice(0, 8)}…
        </div>
      </div>
      <span style={{
        padding: '2px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700,
        background: `${labelColor}22`, color: labelColor, flexShrink: 0,
        border: `1px solid ${labelColor}44`,
      }}>
        {label}
      </span>
    </a>
  )
}

export default function Home() {
  const [id, setId] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const [topViewed, setTopViewed] = useState<TopProfile[]>([])
  const [topReported, setTopReported] = useState<TopProfile[]>([])
  const router = useRouter()

  useEffect(() => {
    fetch('/api/top-profiles')
      .then(r => r.json())
      .then(d => {
        setTopViewed(d.mostViewed || [])
        setTopReported(d.mostReported || [])
      })
      .catch(() => {})
  }, [])

  function go() {
    setErr(null)
    const nid = normalizeSteamInput(id.trim())
    if (!nid) {
      setErr('Invalid ID. Enter a SteamID64 (17 digits) or paste the full profile URL.')
      return
    }
    router.push(`/profiles/${nid}`)
  }

  return (
    <div className="home-container">
      <div style={{ width: '100%', maxWidth: 900, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}>

        {/* Search card */}
        <div className="home-card">
          <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20,
            }}>🎮</div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h1 className="home-title" style={{ margin: 0 }}>CS2 Stats</h1>
                <span style={{
                  fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase',
                  background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.35)',
                  color: '#fbbf24', borderRadius: 5, padding: '3px 7px', lineHeight: 1,
                  alignSelf: 'center',
                }}>BETA</span>
              </div>
              <p className="home-subtitle" style={{ margin: 0 }}>Look up any CS2 player</p>
            </div>
          </div>

          <input
            className="home-input"
            value={id}
            onChange={(e) => setId(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && go()}
            placeholder="SteamID64 or profile URL..."
            autoFocus
          />

          <button className="home-btn" onClick={go} disabled={!id.trim()}>
            View profile →
          </button>

          {err && <div className="home-error">{err}</div>}

          <div style={{ marginTop: 20, borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 16 }}>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>Examples:</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                '76561198261520885',
                'https://steamcommunity.com/profiles/76561198260035986',
              ].map((ex) => (
                <button
                  key={ex}
                  onClick={() => { setId(ex); setErr(null) }}
                  style={{
                    background: 'transparent', border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 8, padding: '6px 12px', color: 'var(--accent)',
                    cursor: 'pointer', fontSize: 12, textAlign: 'left', fontFamily: 'monospace',
                  }}
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Top tables */}
        {(topViewed.length > 0 || topReported.length > 0) && (
          <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

            {topViewed.length > 0 && (
              <div style={{ background: 'var(--card)', border: '1px solid var(--card-border)', borderRadius: 14, padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    👁 Most Viewed
                  </div>
                  <a href="/top-viewed" style={{ fontSize: 11, color: 'var(--muted)', textDecoration: 'none' }}>View all →</a>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {topViewed.slice(0, 5).map(p => (
                    <ProfileCard key={p.steamId} profile={p} label={`${p.views} views`} labelColor="#7dd3fc" />
                  ))}
                </div>
              </div>
            )}

            {topReported.length > 0 && (
              <div style={{ background: 'var(--card)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 14, padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#f87171', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    ⚠ Most Suspected
                  </div>
                  <a href="/top-cheaters" style={{ fontSize: 11, color: 'var(--muted)', textDecoration: 'none' }}>View all →</a>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {topReported.slice(0, 5).map(p => (
                    <ProfileCard key={p.steamId} profile={p} label={`${p.yes ?? 0} votes`} labelColor="#f87171" />
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {/* SEO feature section */}
        <div style={{ width: '100%', paddingTop: 8 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 28 }}>
            {[
              { icon: '📊', title: 'Premier ELO & FACEIT Level', desc: 'Instantly see CS2 Premier rating and FACEIT skill level side by side.' },
              { icon: '🎯', title: 'K/D, HS% & Win Rate', desc: 'Full CS2 competitive stats pulled directly from Steam and Leetify.' },
              { icon: '🚫', title: 'VAC Ban & Risk Score', desc: 'Detect cheaters, smurfs and purchased accounts with our legit score.' },
              { icon: '💰', title: 'Steam Inventory Value', desc: 'Live market prices for CS2 skins and inventory worth in USD.' },
            ].map(f => (
              <div key={f.title} style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 12, padding: '16px 18px',
              }}>
                <div style={{ fontSize: 22, marginBottom: 8 }}>{f.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{f.title}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>{f.desc}</div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center', lineHeight: 1.6, maxWidth: 600, margin: '0 auto' }}>
            CS2 Stats is a free CS2 player lookup tool. Enter any <strong style={{ color: '#a1a1aa' }}>SteamID64</strong>, <strong style={{ color: '#a1a1aa' }}>vanity URL</strong>, or <strong style={{ color: '#a1a1aa' }}>steamcommunity.com link</strong> to instantly view Premier ELO, FACEIT level, K/D ratio, headshot %, inventory value, VAC ban history and more. No login required.{' '}
            <a href="/cs2-legit-checker" style={{ color: 'var(--accent)' }}>Learn about our CS2 legit checker →</a>
          </p>
        </div>

      </div>
    </div>
  )
}
