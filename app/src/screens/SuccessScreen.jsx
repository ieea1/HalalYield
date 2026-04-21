import { useNavigate, useLocation } from 'react-router-dom'
import { getLevelFromXP, getXPProgress } from '../lib/gamification.js'
import { useWalletStore } from '../store/walletStore.js'

export default function SuccessScreen() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const { xp } = useWalletStore()

  const amount    = state?.amount    || 500
  const poolName  = state?.poolName  || 'Centrifuge Trade Finance'
  const apy       = state?.apy       || 0.084
  const xpGained  = state?.xpGained  || 250

  const level    = getLevelFromXP(xp)
  const progress = getXPProgress(xp)

  return (
    <div className="screen" style={{ alignItems: 'center' }}>
      {/* Success ring */}
      <div style={{
        width: 100, height: 100, borderRadius: '50%',
        background: 'rgba(0,201,167,0.1)', border: '3px solid var(--color-teal)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 44, margin: '24px auto 16px',
        animation: 'fadeUp 0.5s ease'
      }}>✓</div>

      <h2 style={{ textAlign: 'center', marginBottom: 8 }}>Investment confirmed!</h2>
      <p style={{ textAlign: 'center', marginBottom: 24 }}>
        Your Halal yield position is live. Algorand Atomic Transfer executed in 0.4s.
      </p>

      {/* Tx summary */}
      <div className="card" style={{ width: '100%', marginBottom: 12 }}>
        {[
          { label: 'Amount invested', value: `$${Number(amount).toLocaleString()}`, color: 'var(--color-white)' },
          { label: 'Pool',            value: poolName,                               color: 'var(--color-teal)'  },
          { label: 'Est. monthly',    value: `$${((amount * apy) / 12).toFixed(2)}`, color: 'var(--color-teal)' },
          { label: 'Tx fee',          value: '0.001 ALGO',                           color: 'var(--color-muted)' },
        ].map((row) => (
          <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: 'var(--color-muted)' }}>{row.label}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: row.color }}>{row.value}</span>
          </div>
        ))}
      </div>

      {/* XP card */}
      <div style={{
        width: '100%',
        background: 'linear-gradient(135deg, rgba(245,200,66,0.08), rgba(245,200,66,0.02))',
        border: '1px solid rgba(245,200,66,0.25)',
        borderRadius: 16, padding: 16, marginBottom: 16
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-gold)' }}>
              🏆 +{xpGained} XP earned!
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>
              {xpGained >= 500 ? 'First investment — Investor badge unlocked' : 'Keep investing to level up'}
            </div>
          </div>
          <div style={{
            fontSize: 12, fontWeight: 700,
            background: 'rgba(0,201,167,0.1)', color: 'var(--color-teal)',
            border: '1px solid rgba(0,201,167,0.2)',
            padding: '5px 12px', borderRadius: 99
          }}>
            {level.name}
          </div>
        </div>
        <div className="xp-track" style={{ marginBottom: 6 }}>
          <div className="xp-fill" style={{ width: `${progress.pct}%` }} />
        </div>
        <div style={{ fontSize: 11, color: 'var(--color-muted)' }}>
          {xp} XP · {progress.current} / {progress.needed || 1000} to {progress.nextLevelName || 'next level'}
        </div>
      </div>

      <div style={{ flex: 1 }} />
      <button className="btn-primary" style={{ width: '100%' }} onClick={() => navigate('/dashboard')}>
        View my portfolio
      </button>
    </div>
  )
}
