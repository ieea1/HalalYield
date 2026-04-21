import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWalletStore } from '../store/walletStore.js'

const OPTIONS = [
  { id: 'sukuk',       icon: '📜', title: 'Sukuk (Islamic bonds)',    desc: 'Asset-backed, profit-sharing structure' },
  { id: 'trade',       icon: '🏭', title: 'Trade finance',            desc: 'Real invoices, real businesses' },
  { id: 'realestate',  icon: '🏠', title: 'Ethical real estate',      desc: 'Rental income, no speculative leverage' },
  { id: 'esg',         icon: '🌍', title: 'Green Sukuk / ESG',        desc: 'Dual-impact: ethical + environmental' },
]

export default function EthicsScreen() {
  const navigate = useNavigate()
  const { setEthicsPreferences } = useWalletStore()
  const [selected, setSelected] = useState(new Set())

  function toggle(id) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function confirm() {
    setEthicsPreferences([...selected])
    navigate('/compliance')
  }

  return (
    <div className="screen">
      <button className="btn-back" onClick={() => navigate('/onboard')}>← Back</button>
      <span className="tag">Step 2 of 4 — Ethics Profile</span>
      <h2 style={{ marginBottom: 8 }}>Set your Shariah preferences</h2>
      <p style={{ marginBottom: 20 }}>HalalYield screens every asset. Tell us your priorities.</p>

      {OPTIONS.map((opt) => {
        const on = selected.has(opt.id)
        return (
          <div
            key={opt.id}
            onClick={() => toggle(opt.id)}
            className="card"
            style={{
              cursor: 'pointer', marginBottom: 8,
              border: `1px solid ${on ? 'var(--color-teal)' : 'rgba(0,201,167,0.15)'}`,
              background: on ? 'rgba(0,201,167,0.05)' : 'var(--color-card)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10, fontSize: 18,
                  background: 'rgba(0,201,167,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>{opt.icon}</div>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--color-white)', fontSize: 14 }}>{opt.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>{opt.desc}</div>
                </div>
              </div>
              <div style={{
                width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                border: `2px solid ${on ? 'var(--color-teal)' : 'rgba(0,201,167,0.3)'}`,
                background: on ? 'var(--color-teal)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--color-dark)', fontSize: 13, fontWeight: 700
              }}>
                {on ? '✓' : ''}
              </div>
            </div>
          </div>
        )
      })}

      <div style={{ flex: 1 }} />
      <button className="btn-primary" onClick={confirm}>
        Confirm preferences
      </button>
    </div>
  )
}
