import './globals.css'
import DonateButton from './DonateButton'

export const metadata = {
  title: 'CS2 Stats',
  description: 'CS2 stats viewer — FACEIT Level, hours, medals, inventory value and more',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

        {/* ── Navigation bar ─────────────────────────────────────── */}
        <nav style={{
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          background: 'rgba(15,17,23,0.97)',
          backdropFilter: 'blur(8px)',
          position: 'sticky', top: 0, zIndex: 100,
          padding: '0 24px',
        }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', height: 52, display: 'flex', alignItems: 'center', gap: 4 }}>
            <a href="/" style={{
              display: 'flex', alignItems: 'center', gap: 8,
              textDecoration: 'none', marginRight: 16,
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: 7,
                background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, flexShrink: 0,
              }}>🎮</div>
              <span style={{ fontWeight: 800, fontSize: 15, color: '#fff', letterSpacing: '-0.01em' }}>CS2 Stats</span>
            </a>

            <a href="/" className="nav-link">🔍 Search</a>
            <a href="/top-viewed" className="nav-link viewed">👁 Most Viewed</a>
            <a href="/top-cheaters" className="nav-link suspected">⚠ Top Suspected</a>
            <div style={{ marginLeft: 'auto', fontSize: 12, color: '#fbbf24', fontFamily: 'monospace', fontWeight: 700 }}>v1.4.1</div>
          </div>
        </nav>

        <main style={{ flex: 1 }}>
          {children}
        </main>

        <footer style={{
          borderTop: '1px solid rgba(255,255,255,0.05)',
          marginTop: 48,
          padding: '24px 16px',
          textAlign: 'center',
        }}>
          <div style={{ maxWidth: 600, margin: '0 auto' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#a1a1aa', marginBottom: 6 }}>
              Buy me a coffee ☕
            </div>
            <div style={{ fontSize: 13, color: '#71717a', marginBottom: 16 }}>
              Every donation, no matter how small, keeps this project alive — thank you 🙏<br />
              <span style={{ fontSize: 12, color: '#52525b' }}>seryi.garcia@gmail.com</span>
            </div>
            <DonateButton />
            <div style={{ marginTop: 16, fontSize: 11, color: '#52525b' }}>
              CS2 Stats · Not affiliated with Valve or FACEIT · Data sourced from public APIs
            </div>

            <div style={{
              marginTop: 32,
              paddingTop: 24,
              borderTop: '1px solid rgba(255,255,255,0.05)',
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#71717a', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
                Collaborations & Business
              </div>
              <div style={{ fontSize: 13, color: '#52525b', marginBottom: 10 }}>
                Interested in sponsorships, partnerships, or advertising on this platform?
              </div>
              <a href="mailto:seryi.garcia@gmail.com" style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '8px 18px', borderRadius: 8,
                background: 'rgba(125,211,252,0.08)', border: '1px solid rgba(125,211,252,0.15)',
                color: '#7dd3fc', fontSize: 13, fontWeight: 600, textDecoration: 'none',
              }}>
                ✉ seryi.garcia@gmail.com
              </a>
            </div>

            {/* ── Legal disclaimer ───────────────────────────────── */}
            <div style={{
              marginTop: 32,
              paddingTop: 24,
              borderTop: '1px solid rgba(255,255,255,0.04)',
              textAlign: 'left',
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#3f3f46', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
                Legal Disclaimer
              </div>
              <p style={{ fontSize: 11, color: '#3f3f46', lineHeight: 1.7, margin: '0 0 8px 0' }}>
                CS2 Stats is an independent, community-driven platform and is not affiliated with, endorsed by, or
                associated with Valve Corporation, Steam, Counter-Strike 2, FACEIT, or any related trademarks or brands.
                All product names, logos, and trademarks are the property of their respective owners.
              </p>
              <p style={{ fontSize: 11, color: '#3f3f46', lineHeight: 1.7, margin: '0 0 8px 0' }}>
                All data displayed on this platform is retrieved exclusively from publicly available APIs and web pages.
                We do not store, sell, or share any personal data. Steam profile information is fetched directly from
                Valve's public endpoints and cached temporarily for performance purposes only.
              </p>
              <p style={{ fontSize: 11, color: '#3f3f46', lineHeight: 1.7, margin: '0 0 8px 0' }}>
                Community votes and cheater reports are user-generated opinions and do not constitute proof of any
                wrongdoing, cheating, or rule violation. The operator of this platform accepts no liability for
                inaccurate, misleading, or defamatory content submitted by users. Users are solely responsible
                for their own votes and reports.
              </p>
              <p style={{ fontSize: 11, color: '#3f3f46', lineHeight: 1.7, margin: 0 }}>
                This platform is provided "as is" without warranties of any kind. The operator shall not be liable
                for any direct, indirect, incidental, or consequential damages arising from the use of this service.
                Use of this platform is entirely at your own risk.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
