import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { POOLS, formatAPY, formatTVL, RISK_COLORS } from '../lib/pools.js'

export default function DiscoverScreen() {
  const navigate = useNavigate()
  const [selected, setSelected] = useState(null)

  return (
    <div className="screen">
      <button className="btn-back" onClick={() => navigate(-1)}>← Back</button>
      <span className="tag">Invest</span>
      <h2 style={{ marginBottom: 6 }}>Your compliant yield pools</h2>
      <p style={{ marginBottom: 20 }}>AI-matched to your ethics profile. All Shariah-screened.</p>

      {POOLS.map((pool) => {
        const risk = RISK_COLORS[pool.riskLevel]
        const isSelected = selected === pool.id
        return (
          <div
            key={pool.id}
            onClick={() => !pool.comingSoon && setSelected(pool.id)}
            style={{
              background: isSelected ? 'rgba(0,201,167,0.05)' : 'var(--color-card)',
              border: `1px solid ${isSelected ? 'var(--color-teal)' : 'rgba(0,201,167,0.15)'}`,
              borderRadius: 16,
              padding: 16,
              marginBottom: 10,
              cursor: pool.comingSoon ? 'default' : 'pointer',
              transition: 'all 0.2s',
              position: 'relative',
              opacity: pool.comingSoon ? 0.6 : 1,
            }}
          >
            {pool.comingSoon && (
              <div style={{
                position: 'absolute', top: 12, right: 12,
                fontSize: 10, fontWeight: 700,
                background: 'rgba(245,200,66,0.15)', color: 'var(--color-gold)',
                border: '1px solid rgba(245,200,66,0.3)',
                padding: '3px 8px', borderRadius: 99
              }}>Coming soon</div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ paddingRight: pool.comingSoon ? 80 : 0 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-white)', marginBottom: 2 }}>
                  {pool.name}
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>{pool.protocol}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-teal)' }}>
                  {formatAPY(pool.apy)}
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-muted)' }}>APY</div>
              </div>
            </div>

            <div style={{ marginBottom: 10 }}>
              <span className="halal-badge">✓ Halal verified</span>
              <span style={{
                fontSize: 10, fontWeight: 700,
                background: risk.bg, color: risk.text, border: `1px solid ${risk.border}`,
                padding: '3px 9px', borderRadius: 99, marginLeft: 6, display: 'inline-block'
              }}>
                {pool.riskLevel.charAt(0).toUpperCase() + pool.riskLevel.slice(1)} risk
              </span>
            </div>

            <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--color-muted)' }}>
              <span>TVL: {pool.tvl > 0 ? formatTVL(pool.tvl) : 'Launching'}</span>
              <span>Min: ${pool.minDeposit}</span>
              <span>{pool.lockupDays === 0 ? 'Liquid' : `${pool.lockupDays}d lockup`}</span>
            </div>

            {isSelected && (
              <div style={{
                marginTop: 10, paddingTop: 10,
                borderTop: '1px solid rgba(0,201,167,0.15)',
                fontSize: 12, color: 'var(--color-muted)', lineHeight: 1.6
              }}>
                <strong style={{ color: 'var(--color-text)' }}>Structure: </strong>
                {pool.shariahStructure} · {pool.description}
              </div>
            )}
          </div>
        )
      })}

      <div style={{ flex: 1 }} />
      <button
        className="btn-primary"
        disabled={!selected}
        onClick={() => navigate(`/invest/${selected}`)}
      >
        Invest in selected pool
      </button>
    </div>
  )
}
