import { Link } from 'react-router-dom'
import Logo from './Logo.jsx'
import { CheckIcon } from './icons.jsx'

// Shared two-column layout for Login / Register: navy "ink" panel on the left,
// form content (children) on the right.
export default function AuthShell({ tagline, children }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#EFF1EC' }}>
      <div className="login-shell" style={{ flex: 1, display: 'flex', alignItems: 'stretch' }}>
        {/* ===== INK PANEL ===== */}
        <div
          className="login-panel"
          style={{
            position: 'relative',
            width: '40%',
            background: 'linear-gradient(160deg,#1f3560 0%,#11203D 60%,#0d1830 100%)',
            color: '#EFF1EC',
            padding: '44px 40px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', right: -50, bottom: 80, width: 260, height: 260, border: '2px solid rgba(201,138,43,0.16)', borderRadius: '50%', transform: 'rotate(-8deg)' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              <Logo size={40} textSize={19} />
            </Link>
          </div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ width: 88, height: 88, border: '2.5px solid rgba(201,138,43,0.8)', borderRadius: '50%', transform: 'rotate(-8deg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: 26 }}>
              <span style={{ color: '#C98A2B', display: 'flex' }}><CheckIcon size={24} strokeWidth={2.6} /></span>
              <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, letterSpacing: '0.16em', color: '#C98A2B', textTransform: 'uppercase', marginTop: 4 }}>Tercatat</span>
            </div>
            <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 500, fontSize: 24, lineHeight: 1.3, margin: 0, maxWidth: 320, whiteSpace: 'pre-line' }}>
              {tagline}
            </p>
          </div>
        </div>

        {/* ===== FORM AREA ===== */}
        <div className="login-form-wrap" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 28px' }}>
          {children}
        </div>
      </div>
    </div>
  )
}
