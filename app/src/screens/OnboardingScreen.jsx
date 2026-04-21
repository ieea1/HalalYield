// OnboardingScreen.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWalletStore } from '../store/walletStore.js'

export default function OnboardingScreen() {
  const navigate = useNavigate()
  const { setAddress } = useWalletStore()
  const [selected, setSelected] = useState(null)

  const methods = [
    { id: 'google', icon: 'G', label: 'Continue with Google' },
    { id: 'apple',  icon: '🍎', label: 'Continue with Apple'  },
    { id: 'email',  icon: '✉️', label: 'Continue with Email'  },
  ]

  function handleLogin() {
    // Mock address — real implementation uses Web3Auth + Algorand Rekeying
    const mockAddr = 'UMAIR' + Math.random().toString(36).slice(2, 8).toUpperCase() + 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
    setAddress(mockAddr.slice(0, 58), selected)
    navigate('/ethics')
  }

  return (
    <div className="screen">
      <button className="btn-back" onClick={() => navigate('/')}>← Back</button>
      <span className="tag">Step 1 of 4 — Identity</span>
      <h2 style={{ marginBottom: 8 }}>Sign in — no seed phrase</h2>
      <p style={{ marginBottom: 24 }}>
        Powered by Algorand Rekeying. Your keys stay yours, secured by social recovery.
      </p>

      {methods.map((m) => (
        <div
          key={m.id}
          onClick={() => setSelected(m.id)}
          className="card"
          style={{
            cursor: 'pointer', marginBottom: 10,
            border: `1px solid ${selected === m.id ? 'var(--color-teal)' : 'rgba(0,201,167,0.15)'}`,
            background: selected === m.id ? 'rgba(0,201,167,0.05)' : 'var(--color-card)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ fontSize: 22 }}>{m.icon}</div>
              <div style={{ fontWeight: 600, color: 'var(--color-white)' }}>{m.label}</div>
            </div>
            {selected === m.id && <div style={{ color: 'var(--color-teal)', fontSize: 18 }}>✓</div>}
          </div>
        </div>
      ))}

      <div style={{ flex: 1 }} />
      <p style={{ fontSize: 12, textAlign: 'center', marginBottom: 10 }}>
        No seed phrase. Algorand Rekeying means your account recovers via your social login.
      </p>
      <button className="btn-primary" disabled={!selected} onClick={handleLogin}>
        Continue
      </button>
    </div>
  )
}
