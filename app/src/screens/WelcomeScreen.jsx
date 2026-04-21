// WelcomeScreen.jsx
import { useNavigate } from 'react-router-dom'

export default function WelcomeScreen() {
  const navigate = useNavigate()
  return (
    <div className="screen" style={{ justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ fontSize: 72, marginBottom: 16 }}>🌙</div>
        <h1 style={{ fontSize: 36, marginBottom: 12 }}>
          Halal<span style={{ color: 'var(--color-teal)' }}>Yield</span>
        </h1>
        <p style={{ fontSize: 16, maxWidth: 280, margin: '0 auto' }}>
          The first Shariah-compliant RWA yield wallet. Institutional strategies. Retail simplicity.
        </p>
      </div>

      {[
        { icon: '✅', title: '100% Riba-free', sub: 'Every asset Shariah-screened' },
        { icon: '⚡', title: '0.001 ALGO fees', sub: 'Your yield stays yours' },
        { icon: '🏆', title: 'Earn while you learn', sub: 'Gamified financial health' },
      ].map((f) => (
        <div key={f.title} className="card" style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12, fontSize: 20,
              background: 'rgba(0,201,167,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>{f.icon}</div>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--color-white)', fontSize: 15 }}>{f.title}</div>
              <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>{f.sub}</div>
            </div>
          </div>
        </div>
      ))}

      <div style={{ flex: 1 }} />
      <button className="btn-primary" onClick={() => navigate('/onboard')}>
        Get started — 30 seconds
      </button>
      <button className="btn-secondary" style={{ marginTop: 10 }} onClick={() => navigate('/dashboard')}>
        View demo dashboard
      </button>
    </div>
  )
}
