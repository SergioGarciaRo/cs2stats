export interface MatchStats {
  matchId: string
  date: string
  map: string
  kd: number
  adr: number
  hsPercent: number
  win: boolean
  kills: number
}

interface MapRow {
  map: string
  matches: number
  wins: number
  winrate: number
  avgKd: number
  avgHs: number
}

function groupByMap(matches: MatchStats[]): MapRow[] {
  const acc: Record<string, { wins: number; kds: number[]; hss: number[] }> = {}
  for (const m of matches) {
    if (!acc[m.map]) acc[m.map] = { wins: 0, kds: [], hss: [] }
    if (m.win) acc[m.map].wins++
    acc[m.map].kds.push(m.kd)
    acc[m.map].hss.push(m.hsPercent)
  }
  return Object.entries(acc)
    .map(([map, d]) => ({
      map,
      matches: d.kds.length,
      wins: d.wins,
      winrate: Math.round((d.wins / d.kds.length) * 100),
      avgKd:   Math.round((d.kds.reduce((a, b) => a + b, 0) / d.kds.length) * 100) / 100,
      avgHs:   Math.round(d.hss.reduce((a, b) => a + b, 0) / d.hss.length),
    }))
    .sort((a, b) => b.matches - a.matches)
}

function wrColor(wr: number) {
  if (wr > 60) return '#22c55e'
  if (wr < 40) return '#f87171'
  return '#f3f4f6'
}

interface Props { matches: MatchStats[] }

export default function MapStatsTable({ matches }: Props) {
  const rows = groupByMap(matches)

  const thStyle: React.CSSProperties = {
    padding: '10px 14px',
    fontSize: 11,
    fontWeight: 700,
    color: '#71717a',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    whiteSpace: 'nowrap',
  }

  const tdBase: React.CSSProperties = {
    padding: '11px 14px',
    fontSize: 13,
    borderBottom: '1px solid rgba(255,255,255,0.04)',
  }

  return (
    <div style={{
      background: 'var(--card)',
      border: '1px solid var(--card-border)',
      borderRadius: 14,
      overflow: 'hidden',
    }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
              <th style={{ ...thStyle, textAlign: 'left' }}>Map</th>
              <th style={{ ...thStyle, textAlign: 'center' }}>Matches</th>
              <th style={{ ...thStyle, textAlign: 'center' }}>Winrate</th>
              <th style={{ ...thStyle, textAlign: 'center' }}>Avg K/D</th>
              <th style={{ ...thStyle, textAlign: 'center' }}>Avg HS%</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.map} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                <td style={{ ...tdBase, fontWeight: 700, color: '#fff' }}>
                  <span style={{ marginRight: 8, opacity: 0.6 }}>🗺️</span>
                  {row.map}
                </td>
                <td style={{ ...tdBase, textAlign: 'center', color: '#a1a1aa' }}>{row.matches}</td>
                <td style={{ ...tdBase, textAlign: 'center' }}>
                  <span style={{ fontWeight: 700, color: wrColor(row.winrate) }}>{row.winrate}%</span>
                </td>
                <td style={{ ...tdBase, textAlign: 'center', fontWeight: 600, color: row.avgKd >= 1 ? '#7dd3fc' : '#f87171' }}>
                  {row.avgKd.toFixed(2)}
                </td>
                <td style={{ ...tdBase, textAlign: 'center', color: '#a1a1aa' }}>{row.avgHs}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
