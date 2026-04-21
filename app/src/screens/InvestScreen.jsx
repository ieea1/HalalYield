import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useWalletStore } from '../store/walletStore.js'
import { POOL_BY_ID, formatAPY } from '../lib/pools.js'
import { calculateXPForDeposit } from '../lib/gamification.js'

export default function InvestScreen() {
  const { poolId } = useParams()
  const navigate = useNavigate()
  const { addPosition } = useWalletStore()
  const pool = POOL_BY_ID[poolId] || POOL_BY_ID['centrifuge-trade-finance']

  const [raw, setRaw] = useState('')

  const amount = parseFloat(raw) || 0
  const monthly = ((amount * pool.apy) / 12).toFixed(2)
  const annual  = (amount * pool.apy).toFixed(2)

  function press(key) {
    if (key === 'del') { setRaw(r => r.slice(0, -1)); return }
    if (key === '.' && raw.includes('.')) return
    if (raw.length >= 7) return
    setRaw(r => r + key)
  }

  function quickSet(val) { setRaw(String(val)) }

  function confirm() {
    const xpGained = calculateXPForDeposit(amount)
    addPosition({ poolId: pool.id, poolName: pool.name, amount, apy: pool.apy, xpGained })
    navigate('/success', { state: { amount, poolName: pool.name, apy: pool.apy, xpGained } })
  }

  return (
    <div className="screen">
      <button className="btn-back" onClick={() => navigate('/discover')}>← Back</button>

      <div style={{ textAlign: 'center', padding: '4px 0 8px' }}>
        <span className="tag" style={{ textAlign: 'center' }}>
          Investing in <span style={{ color: 'var(--color-teal)' }}>{pool.name}</span>
        </span>
        <div style={{ fontSize: 52, fontWeight: 700, color: 'var(--color-white)', lineHeight: 1.1 }}>
          ${raw || '0'}
        </div>
        <div style={{ fontSize: 13, color: 'var(--color-muted)', marginTop: 4 }}>
          Available: $2,500.00 USDC
        </div>
      </div>

      {/* Quick amounts */}
      <div style={{ display: 'flex', gap: 8, margin: '12px 0' }}>
        {[100, 500, 1000].map(v => (
          <button key={v} onClick={() => quickSet(v)} style={{
            flex: 1, padding: '8px 0',
            background: 'var(--color-card)', border: '1px solid rgba(0,201,167,0.2)',
            borderRadius: 10, color: 'var(--color-teal)', fontSize: 13, fontWeight: 600, cursor: 'pointer'
          }}>${v}</button>
        ))}
        <button onClick={() => quickSet(2500)} style={{
          flex: 1, padding: '8px 0',
          background: 'var(--color-card)', border: '1px solid rgba(0,201,167,0.2)',
          borderRadius: 10, color: 'var(--color-teal)', fontSize: 13, fontWeight: 600, cursor: 'pointer'
        }}>Max</button>
      </div>

      {/* Numpad */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 14 }}>
        {['1','2','3','4','5','6','7','8','9','.','0','del'].map(k => (
          <button key={k} onClick={() => press(k)} style={{
            padding: '16px 0', borderRadius: 12,
            background: 'var(--color-card)', border: '1px solid rgba(139,160,184,0.1)',
            color: k === 'del' ? 'var(--color-muted)' : 'var(--color-white)',
            fontSize: k === 'del' ? 18 : 22, fontWeight: 500, cursor: 'pointer',
            transition: 'all 0.1s'
          }}>{k === 'del' ? '⌫' : k}</button>
        ))}
      </div>

      {/* Yield preview */}
      <div className="card" style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 13, color: 'var(--color-muted)' }}>Monthly yield</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-teal)' }}>${monthly}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 13, color: 'var(--color-muted)' }}>Annual yield ({formatAPY(pool.apy)})</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-teal)' }}>${annual}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, color: 'var(--color-muted)' }}>Transaction fee</span>
          <span style={{ fontSize: 13, color: 'var(--color-muted)' }}>0.001 ALGO (~$0.0002)</span>
        </div>
      </div>

      <button className="btn-primary" disabled={amount < 1} onClick={confirm}>
        Confirm investment
      </button>
    </div>
  )
}
