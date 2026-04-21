import { useNavigate } from 'react-router-dom'

const CHECKS = [
  { icon: '🇺🇸', title: 'United States detected',      sub: 'Available pools filtered for your jurisdiction', done: true },
  { icon: '🔒', title: 'ZK-proof generated',            sub: 'Identity verified. Zero data shared.',           done: true },
  { icon: '📜', title: 'Shariah compliance confirmed',  sub: 'All pools audited by certified scholars',        done: true },
]

export default function ComplianceScreen() {
  const navigate = useNavigate()

  return (
    <div className="screen">
      <button className="btn-back" onClick={() => navigate('/ethics')}>← Back</button>
      <span className="tag">Step 3 of 4 — Compliance</span>
      <h2 style={{ marginBottom: 8 }}>Jurisdiction verified ✓</h2>
      <p style={{ marginBottom: 20 }}>
        ZK-KYC checks eligibility without exposing your personal data. You never interact
        with regional securities law — HalalYield handles it.
      </p>

      {CHECKS.map((c) => (
        <div key={c.title} className="card" style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 22 }}>{c.icon}</div>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--color-white)', fontSize: 14 }}>{c.title}</div>
                <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>{c.sub}</div>
              </div>
            </div>
            {c.done && <div style={{ color: 'var(--color-teal)', fontSize: 20, fontWeight: 700 }}>✓</div>}
          </div>
        </div>
      ))}

      <div style={{
        background: 'rgba(0,201,167,0.05)', border: '1px solid rgba(0,201,167,0.2)',
        borderRadius: 12, padding: 14, margin: '4px 0 20px'
      }}>
        <p style={{ fontSize: 13, color: 'var(--color-text)' }}>
          Every transaction auto-checks compliance via Algorand Atomic Transfer.
          If a pool becomes non-compliant, you're protected before any trade executes.
        </p>
      </div>

      <div style={{ flex: 1 }} />
      <button className="btn-primary" onClick={() => navigate('/discover')}>
        Continue to yield pools
      </button>
    </div>
  )
}
