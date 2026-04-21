import { useNavigate } from 'react-router-dom'
import { useWalletStore } from '../store/walletStore.js'
import { formatAPY, formatTVL } from '../lib/pools.js'
import { getLevelFromXP, getXPProgress, BADGES } from '../lib/gamification.js'
import { shortenAddress } from '../lib/algorand.js'

export default function DashboardScreen() {
  const navigate = useNavigate()
  const { address, positions, xp, streakDays, badges, getTotalValue, getMonthlyYield } = useWalletStore()

  const totalValue = getTotalValue()
  const monthlyYield = getMonthlyYield()
  const level = getLevelFromXP(xp)
  const progress = getXPProgress(xp)

  return (
    <div className="screen" style={{ paddingTop: 12 }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-white)' }}>
            Halal<span style={{ color: 'var(--color-teal)' }}>Yield</span>
          </div>
          {address && (
            <div style={{ fontSize: 11, color: 'var(--color-muted)', marginTop: 2 }}>
              {shortenAddress(address)}
            </div>
          )}
        </div>
        <div style={{
          fontSize: 11, fontWeight: 700, letterSpacing: '0.05em',
          background: 'rgba(0,201,167,0.1)', color: 'var(--color-teal)',
          border: '1px solid rgba(0,201,167,0.25)', padding: '5px 12px', borderRadius: 99
        }}>
          🔥 {streakDays || 14}-day streak
        </div>
      </div>

      {/* Portfolio value */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: 'var(--color-muted)', marginBottom: 4 }}>Total portfolio value</div>
        <div style={{ fontSize: 40, fontWeight: 700, color: 'var(--color-white)', lineHeight: 1 }}>
          ${totalValue > 0 ? totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '2,847.32'}
        </div>
        <div style={{ fontSize: 14, color: 'var(--color-teal)', fontWeight: 600, marginTop: 4 }}>
          ↑ +${monthlyYield > 0 ? monthlyYield.toFixed(2) : '23.14'}/mo avg yield
        </div>
      </div>

      {/* Positions */}
      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-white)', marginBottom: 10 }}>
        Active positions
      </div>

      {positions.length > 0 ? positions.map((pos) => (
        <div key={pos.id} className="card" style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-white)', marginBottom: 2 }}>
                {pos.poolName}
              </div>
              <div>
                <span className="halal-badge">✓ Halal</span>
                <span style={{ fontSize: 11, color: 'var(--color-muted)', marginLeft: 8 }}>
                  {formatAPY(pos.apy)} APY
                </span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 700, color: 'var(--color-white)' }}>
                ${pos.amount.toLocaleString()}
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-teal)' }}>
                +${((pos.amount * pos.apy) / 12).toFixed(2)}/mo
              </div>
            </div>
          </div>
        </div>
      )) : (
        <>
          <MockPosition name="Centrifuge Trade Finance" amount={1500} apy={0.084} />
          <MockPosition name="Ondo US T-Bills" amount={847} apy={0.051} />
        </>
      )}

      <div className="divider" />

      {/* Gamification */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(245,200,66,0.07), rgba(245,200,66,0.02))',
        border: '1px solid rgba(245,200,66,0.2)',
        borderRadius: 16, padding: 16, marginBottom: 12
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-gold)' }}>Your progress</div>
          <div style={{
            fontSize: 12, fontWeight: 700, background: 'rgba(0,201,167,0.1)',
            color: 'var(--color-teal)', border: '1px solid rgba(0,201,167,0.2)',
            padding: '4px 12px', borderRadius: 99
          }}>
            {level.name}
          </div>
        </div>

        <div className="xp-track" style={{ marginBottom: 6 }}>
          <div className="xp-fill" style={{ width: `${progress.pct}%` }} />
        </div>
        <div style={{ fontSize: 11, color: 'var(--color-muted)', marginBottom: 14 }}>
          {xp || 350} XP · {progress.current} / {progress.needed || 1000} to {progress.nextLevelName || 'Strategist'}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {BADGES.slice(0, 4).map((badge) => {
            const earned = badges.includes(badge.id) || ['first_deposit', 'streak_7', 'defi_learner'].includes(badge.id)
            return (
              <div key={badge.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{
                  width: 46, height: 46, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20,
                  background: earned ? 'rgba(0,201,167,0.12)' : 'rgba(139,160,184,0.06)',
                  border: `2px solid ${earned ? 'var(--color-teal)' : 'rgba(139,160,184,0.15)'}`,
                  filter: earned ? 'none' : 'grayscale(1) opacity(0.4)',
                }}>
                  {badge.icon}
                </div>
                <div style={{ fontSize: 10, color: 'var(--color-muted)', textAlign: 'center' }}>
                  {badge.name}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <button className="btn-primary" onClick={() => navigate('/discover')}>
        + Add position
      </button>
    </div>
  )
}

function MockPosition({ name, amount, apy }) {
  return (
    <div className="card" style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-white)', marginBottom: 2 }}>{name}</div>
          <span className="halal-badge">✓ Halal</span>
          <span style={{ fontSize: 11, color: 'var(--color-muted)', marginLeft: 8 }}>{formatAPY(apy)} APY</span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: 700, color: 'var(--color-white)' }}>${amount.toLocaleString()}</div>
          <div style={{ fontSize: 12, color: 'var(--color-teal)' }}>+${((amount * apy) / 12).toFixed(2)}/mo</div>
        </div>
      </div>
    </div>
  )
}
