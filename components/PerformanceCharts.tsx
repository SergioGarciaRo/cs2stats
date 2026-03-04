'use client'

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts'

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

interface ChartPoint {
  n: number
  map: string
  date: string
  value: number
}

function toPoints(
  matches: MatchStats[],
  fn: (m: MatchStats) => number,
): ChartPoint[] {
  return [...matches].reverse().map((m, i) => ({
    n: i + 1,
    map: m.map,
    date: m.date,
    value: fn(m),
  }))
}

const ttStyle: React.CSSProperties = {
  background: 'rgba(22,27,38,0.97)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 8,
  padding: '8px 12px',
  fontSize: 12,
  color: '#f3f4f6',
  boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
}

function Tip({ active, payload, suffix = '' }: any) {
  if (!active || !payload?.length) return null
  const p = payload[0]
  return (
    <div style={ttStyle}>
      <div style={{ color: '#71717a', marginBottom: 2, fontSize: 11 }}>
        {p.payload.map}
      </div>
      <div style={{ color: p.color, fontWeight: 700, fontSize: 14 }}>
        {typeof p.value === 'number' ? p.value.toFixed(suffix === '%' ? 0 : 2) : p.value}{suffix}
      </div>
    </div>
  )
}

const gridProps = {
  strokeDasharray: '3 3',
  stroke: 'rgba(255,255,255,0.05)',
  vertical: false,
}

const axStyle = { fontSize: 10, fill: '#71717a' }

const lineBase = {
  type: 'monotone' as const,
  dataKey: 'value',
  dot: false,
  strokeWidth: 2,
  activeDot: { r: 4, strokeWidth: 0 },
}

interface Props { matches: MatchStats[] }

export default function PerformanceCharts({ matches }: Props) {
  if (!matches.length) return null

  const hasAdr = matches.some(m => m.adr > 0)

  const charts: Array<{
    title: string
    data: ChartPoint[]
    color: string
    suffix: string
    refY?: number
    domain: [any, any]
  }> = [
    {
      title: 'K/D Evolution',
      data: toPoints(matches, m => m.kd),
      color: '#7dd3fc',
      suffix: '',
      refY: 1,
      domain: ['auto', 'auto'],
    },
    {
      title: hasAdr ? 'ADR Evolution' : 'Kills per Match',
      data: toPoints(matches, m => hasAdr ? m.adr : m.kills),
      color: '#fbbf24',
      suffix: '',
      refY: undefined,
      domain: [0, 'auto'],
    },
    {
      title: 'Headshot %',
      data: toPoints(matches, m => m.hsPercent),
      color: '#f87171',
      suffix: '%',
      refY: undefined,
      domain: [0, 100],
    },
    {
      title: 'Win / Loss',
      data: toPoints(matches, m => m.win ? 1 : 0),
      color: '#22c55e',
      suffix: '',
      refY: undefined,
      domain: [-0.1, 1.1],
    },
  ]

  const cardStyle: React.CSSProperties = {
    background: 'var(--card)',
    border: '1px solid var(--card-border)',
    borderRadius: 14,
    padding: '20px 16px',
  }

  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 700,
    color: 'var(--muted)',
    letterSpacing: '0.07em',
    textTransform: 'uppercase',
    marginBottom: 14,
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: 16,
    }}>
      {charts.map(c => (
        <div key={c.title} style={cardStyle}>
          <div style={labelStyle}>{c.title}</div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={c.data} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="n" tick={axStyle} tickLine={false} axisLine={false} />
              <YAxis tick={axStyle} tickLine={false} axisLine={false} domain={c.domain} />
              <Tooltip content={<Tip suffix={c.suffix} />} />
              {c.refY !== undefined && (
                <ReferenceLine y={c.refY} stroke="rgba(255,255,255,0.18)" strokeDasharray="4 4" />
              )}
              <Line {...lineBase} stroke={c.color} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ))}
    </div>
  )
}
