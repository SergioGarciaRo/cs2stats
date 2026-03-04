import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'CS2 Legit Checker – Detect Smurfs, Cheaters & Purchased Accounts',
  description: 'Free CS2 legit checker tool. Paste any Steam profile URL or SteamID64 to detect cheaters, smurfs, VAC bans and purchased accounts instantly. No login required.',
  alternates: { canonical: 'https://cs2stats-68cc.vercel.app/cs2-legit-checker' },
  openGraph: {
    title: 'CS2 Legit Checker – Detect Smurfs, Cheaters & Purchased Accounts',
    description: 'Free CS2 legit checker tool. Paste any Steam profile URL or SteamID64 to detect cheaters, smurfs, VAC bans and purchased accounts instantly.',
    url: 'https://cs2stats-68cc.vercel.app/cs2-legit-checker',
    type: 'website',
  },
}

const CARD = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: 14,
  padding: '20px 24px',
} as const

const TAG = (color: string) => ({
  display: 'inline-block',
  padding: '2px 10px',
  borderRadius: 6,
  background: `${color}22`,
  border: `1px solid ${color}44`,
  color,
  fontSize: 12,
  fontWeight: 700,
  marginRight: 6,
  marginBottom: 4,
})

const signals = [
  { icon: '🚫', label: 'VAC Ban', color: '#ef4444', desc: 'Account has one or more VAC bans from Valve Anti-Cheat system.' },
  { icon: '⚡', label: 'Very New Account', color: '#f59e0b', desc: 'Account created less than 1 year ago — common in smurfs and purchased accounts.' },
  { icon: '🔒', label: 'Private Profile', color: '#71717a', desc: 'Hiding stats is a red flag; legitimate players rarely set profiles to private.' },
  { icon: '🎯', label: 'Abnormal HS%', color: '#f87171', desc: 'Headshot percentage above 65% consistently is statistically rare without assistance.' },
  { icon: '📈', label: 'Abnormal K/D', color: '#f87171', desc: 'K/D above 4.0 in matchmaking is a strong indicator of cheating or massive skill mismatch.' },
  { icon: '🔄', label: 'Purchased Account', color: '#a78bfa', desc: 'High-value inventory on a new account often indicates a purchased or boosted account.' },
]

const faqs = [
  {
    q: 'What is a CS2 legit checker?',
    a: 'A CS2 legit checker is a tool that analyzes a Counter-Strike 2 player\'s public data — VAC bans, account age, stats, inventory — to determine if they are likely cheating, smurfing, or using a purchased account.',
  },
  {
    q: 'How does the CS2 smurf detection work?',
    a: 'Our algorithm checks account age, hours played, Premier ELO, K/D ratio, headshot percentage, VAC ban history, and inventory value. Suspicious combinations of these signals increase the risk score.',
  },
  {
    q: 'Can I check if someone is VAC banned?',
    a: 'Yes. Enter any SteamID64 or Steam profile URL and we instantly show VAC ban status, number of bans, and days since the last ban via Valve\'s official API.',
  },
  {
    q: 'Is CS2 Stats free to use?',
    a: 'Yes, CS2 Stats is completely free. No account, no login, no limits — just paste a Steam ID or URL and get results instantly.',
  },
  {
    q: 'How accurate is the legit score?',
    a: 'The legit score uses publicly available data only. It cannot detect cheats at the game engine level — only Valve\'s VAC system can do that. It is best used as a risk indicator, not a definitive verdict.',
  },
]

export default function LegitCheckerPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        name: 'CS2 Legit Checker',
        url: 'https://cs2stats-68cc.vercel.app/cs2-legit-checker',
        applicationCategory: 'GameApplication',
        operatingSystem: 'Any',
        description: 'Free CS2 legit checker. Detect smurfs, cheaters, VAC bans and purchased accounts by Steam ID.',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        featureList: ['VAC Ban Check', 'Smurf Detection', 'Account Age Analysis', 'K/D & HS% Analysis', 'Purchased Account Detection', 'Inventory Value Check'],
      },
      {
        '@type': 'FAQPage',
        mainEntity: faqs.map(f => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://cs2stats-68cc.vercel.app' },
          { '@type': 'ListItem', position: 2, name: 'CS2 Legit Checker', item: 'https://cs2stats-68cc.vercel.app/cs2-legit-checker' },
        ],
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '40px 16px 80px' }}>

        {/* ── Hero ─────────────────────────────────────── */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 14px', borderRadius: 20, background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)', marginBottom: 16 }}>
            <span style={{ fontSize: 12, color: '#a78bfa', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Free Tool</span>
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 900, color: '#fff', margin: '0 0 14px', lineHeight: 1.2, letterSpacing: '-0.02em' }}>
            CS2 Legit Checker
          </h1>
          <p style={{ fontSize: 17, color: '#a1a1aa', maxWidth: 560, margin: '0 auto 28px', lineHeight: 1.6 }}>
            Detect <strong style={{ color: '#f87171' }}>cheaters</strong>, <strong style={{ color: '#f59e0b' }}>smurfs</strong> and <strong style={{ color: '#a78bfa' }}>purchased accounts</strong> in Counter-Strike 2. Paste any Steam ID or profile URL — results in seconds.
          </p>
          <a
            href="/"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '12px 28px', borderRadius: 10,
              background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
              color: '#fff', fontSize: 15, fontWeight: 700,
              textDecoration: 'none', letterSpacing: '-0.01em',
            }}
          >
            🔍 Check a CS2 Player Now →
          </a>
        </div>

        {/* ── How it works ──────────────────────────────── */}
        <section aria-labelledby="how-it-works" style={{ marginBottom: 48 }}>
          <h2 id="how-it-works" style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 20 }}>
            How Does CS2 Legit Checking Work?
          </h2>
          <p style={{ color: '#a1a1aa', lineHeight: 1.7, marginBottom: 16 }}>
            Our CS2 legit checker analyzes publicly available Steam data for any player. You don't need any special access — just paste a <strong style={{ color: '#fff' }}>SteamID64</strong> (17-digit number) or a full <strong style={{ color: '#fff' }}>steamcommunity.com</strong> URL.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
            {[
              { step: '1', title: 'Paste Steam ID or URL', desc: 'Enter a SteamID64, vanity URL, or paste the full profile link.' },
              { step: '2', title: 'We Analyze the Profile', desc: 'Our engine checks VAC bans, stats, account age, inventory and more.' },
              { step: '3', title: 'See the Legit Score', desc: 'Get a risk score from Low to High with specific reasons flagged.' },
            ].map(s => (
              <div key={s.step} style={{ ...CARD, display: 'flex', gap: 14 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#60a5fa', fontSize: 15, flexShrink: 0 }}>
                  {s.step}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: '#fff', fontSize: 14, marginBottom: 4 }}>{s.title}</div>
                  <div style={{ color: '#71717a', fontSize: 13, lineHeight: 1.5 }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Risk signals ─────────────────────────────── */}
        <section aria-labelledby="risk-signals" style={{ marginBottom: 48 }}>
          <h2 id="risk-signals" style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 8 }}>
            What Signals Does the Legit Checker Analyze?
          </h2>
          <p style={{ color: '#a1a1aa', lineHeight: 1.7, marginBottom: 20 }}>
            Each signal contributes to the overall risk score. No single signal is definitive — we look at the full picture.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
            {signals.map(s => (
              <div key={s.label} style={CARD}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 18 }}>{s.icon}</span>
                  <span style={TAG(s.color)}>{s.label}</span>
                </div>
                <p style={{ color: '#71717a', fontSize: 13, lineHeight: 1.5, margin: 0 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── What data we show ─────────────────────────── */}
        <section aria-labelledby="data-shown" style={{ marginBottom: 48 }}>
          <h2 id="data-shown" style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 16 }}>
            CS2 Stats Included in Each Player Profile
          </h2>
          <div style={{ ...CARD }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {[
                ['Premier ELO', '#60a5fa'],
                ['FACEIT Level & ELO', '#ff7a18'],
                ['K/D Ratio', '#4ade80'],
                ['Headshot %', '#f87171'],
                ['Win Rate', '#4ade80'],
                ['Hours Played', '#a78bfa'],
                ['Inventory Value (USD)', '#fbbf24'],
                ['VAC Ban History', '#ef4444'],
                ['Account Age', '#71717a'],
                ['CS2 Medals', '#a78bfa'],
                ['Leetify Rating', '#a78bfa'],
                ['Map Performance', '#60a5fa'],
                ['Match History', '#60a5fa'],
                ['Purchased Account Risk', '#f59e0b'],
                ['Community Legit Votes', '#71717a'],
              ].map(([label, color]) => (
                <span key={label as string} style={TAG(color as string)}>{label as string}</span>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────── */}
        <section aria-labelledby="faq">
          <h2 id="faq" style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 20 }}>
            Frequently Asked Questions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {faqs.map(f => (
              <details key={f.q} style={{ ...CARD, cursor: 'pointer' }}>
                <summary style={{ fontWeight: 700, color: '#fff', fontSize: 15, listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {f.q}
                  <span style={{ color: '#71717a', fontSize: 18, marginLeft: 12, flexShrink: 0 }}>+</span>
                </summary>
                <p style={{ color: '#a1a1aa', lineHeight: 1.7, marginTop: 12, marginBottom: 0, fontSize: 14 }}>{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────── */}
        <div style={{ textAlign: 'center', marginTop: 56, padding: '36px 24px', borderRadius: 16, background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)' }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 10 }}>Ready to check a CS2 player?</h2>
          <p style={{ color: '#71717a', marginBottom: 24, fontSize: 14 }}>Free, instant, no login required.</p>
          <a
            href="/"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '12px 28px', borderRadius: 10,
              background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
              color: '#fff', fontSize: 15, fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            🔍 Start Lookup →
          </a>
        </div>

      </div>
    </>
  )
}
