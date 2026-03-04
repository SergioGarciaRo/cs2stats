interface Skin {
  name: string
  price: number
  icon: string
}

interface Props {
  totalValue?: number
  topSkins?: Skin[]
  totalItems?: number
  isPrivate?: boolean
}

export default function InventoryValue({ totalValue, topSkins, totalItems, isPrivate }: Props) {
  const card: React.CSSProperties = {
    background: 'var(--card)',
    border: '1px solid var(--card-border)',
    borderRadius: 14,
    padding: 20,
  }

  if (isPrivate) {
    return (
      <div style={card}>
        <div style={{ fontSize: 13, color: 'var(--muted)' }}>
          Inventory is private or unavailable
        </div>
      </div>
    )
  }

  const thStyle: React.CSSProperties = {
    padding: '8px 12px',
    fontSize: 11,
    fontWeight: 700,
    color: '#71717a',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  }

  const tdBase: React.CSSProperties = {
    padding: '10px 12px',
    fontSize: 13,
    borderBottom: '1px solid rgba(255,255,255,0.04)',
    verticalAlign: 'middle',
  }

  return (
    <div style={card}>
      {/* Total value */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>
            Total Inventory Value
          </div>
          <div style={{ fontSize: 36, fontWeight: 800, color: '#f59e0b', lineHeight: 1 }}>
            ${(totalValue ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          {totalItems != null && (
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
              {totalItems} items in inventory
            </div>
          )}
        </div>
      </div>

      {/* Top skins */}
      {topSkins && topSkins.length > 0 && (
        <>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>
            Most Valuable Skins
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <th style={{ ...thStyle, textAlign: 'left' }}>Skin</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Price</th>
                </tr>
              </thead>
              <tbody>
                {topSkins.map((skin, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                    <td style={{ ...tdBase, display: 'flex', alignItems: 'center', gap: 10 }}>
                      {skin.icon ? (
                        <img
                          src={skin.icon}
                          alt={skin.name}
                          style={{ width: 48, height: 36, objectFit: 'contain', borderRadius: 4, flexShrink: 0 }}
                        />
                      ) : (
                        <div style={{ width: 48, height: 36, background: 'rgba(245,158,11,0.1)', borderRadius: 4, flexShrink: 0 }} />
                      )}
                      <span style={{ fontWeight: 600, color: '#fff' }}>{skin.name}</span>
                    </td>
                    <td style={{ ...tdBase, textAlign: 'right', fontWeight: 700, color: '#f59e0b', whiteSpace: 'nowrap' }}>
                      ${skin.price.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
