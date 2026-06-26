import { Link } from 'react-router-dom'
import Logo from './Logo.jsx'
import { CheckIcon } from './icons.jsx'
import { T, FONT } from '../lib/theme.js'

/**
 * AuthShell — layout dua kolom bersama untuk halaman Login dan Register.
 *
 * Kiri: panel navy "Ink" berisi logo, stempel "Tercatat", dan tagline.
 * Kanan: area form (children) — Login.jsx atau Register.jsx.
 *
 * Props:
 *  - tagline  → string multi-baris (whitespace-pre-line), ditampilkan di panel kiri
 *  - children → konten form (diteruskan apa adanya)
 */
export default function AuthShell({ tagline, children }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: T.bg }}>
      <div className="login-shell" style={{ flex: 1, display: 'flex', alignItems: 'stretch' }}>

        {/* ===== PANEL KIRI — merek & tagline ===== */}
        <div
          className="login-panel"
          style={{
            position: 'relative',
            width: '40%',
            background: T.cardGrad,
            color: '#fff',
            padding: '44px 40px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            overflow: 'hidden',
          }}
        >
          {/* Dekorasi lingkaran */}
          <div style={{ position: 'absolute', right: -50, bottom: 80, width: 260, height: 260, border: '2px solid rgba(255,255,255,0.18)', borderRadius: '50%', transform: 'rotate(-8deg)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(340px 220px at 80% -10%, rgba(255,255,255,0.2), transparent 65%)', pointerEvents: 'none' }} />

          {/* Logo — klik untuk kembali ke Landing */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              <Logo size={40} textSize={19} />
            </Link>
          </div>

          {/* Stempel + tagline */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ width: 88, height: 88, border: '2.5px solid rgba(255,255,255,0.85)', borderRadius: '50%', transform: 'rotate(-8deg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: 26 }}>
              <span style={{ color: '#fff', display: 'flex' }}><CheckIcon size={24} strokeWidth={2.6} /></span>
              <span style={{ fontFamily: FONT.mono, fontSize: 10, letterSpacing: '0.16em', color: '#fff', textTransform: 'uppercase', marginTop: 4 }}>Aman</span>
            </div>
            <p style={{ fontFamily: FONT.display, fontWeight: 500, fontSize: 24, lineHeight: 1.3, margin: 0, maxWidth: 320, whiteSpace: 'pre-line' }}>
              {tagline}
            </p>
          </div>
        </div>

        {/* ===== AREA FORM (kanan) ===== */}
        <div className="login-form-wrap" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 28px', background: T.bg }}>
          {children}
        </div>
      </div>
    </div>
  )
}
