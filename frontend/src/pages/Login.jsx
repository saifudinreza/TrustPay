import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthShell from '../components/AuthShell.jsx'
import OtpStep from '../components/OtpStep.jsx'
import { UserIcon, LockIcon, PhoneIcon, EyeIcon, EyeOffIcon, GoogleIcon } from '../components/icons.jsx'
import useAuth from '../hooks/useAuth.js'
import { phoneShapeValid } from '../lib/auth.js'

const GOOGLE_AUTH_URL = (import.meta.env.VITE_API_URL || '/api') + '/auth/google/redirect'

// Halaman Login. METODE UTAMA (rubrik): email/username + password.
// METODE BONUS: OTP WhatsApp (toggle di bawah). State `mode` mengatur tampilannya.
export default function Login() {
  const navigate = useNavigate()
  const { login, requestLoginOtp, verifyOtp } = useAuth()
  const [mode, setMode] = useState('password') // 'password' | 'otp-phone' | 'otp-code'

  // ---- state form password ----
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)

  // ---- state OTP ----
  const [phone, setPhone] = useState('')
  const [devCode, setDevCode] = useState(null)

  const [error, setError] = useState(() => {
    // Tampilkan pesan jika Google OAuth gagal (redirect dari /masuk?error=google_gagal)
    const p = new URLSearchParams(window.location.search)
    return p.get('error') === 'google_gagal' ? 'Login dengan Google gagal. Silakan coba lagi.' : ''
  })
  const [submitting, setSubmitting] = useState(false)

  const canSubmitPwd = identifier.trim() !== '' && password !== '' && !submitting
  const phoneValid = phoneShapeValid(phone)

  // LOGIN dengan password
  const onPwdSubmit = async (e) => {
    e.preventDefault()
    if (!canSubmitPwd) return
    setError('')
    setSubmitting(true) // loading → cegah spam klik
    try {
      await login({ login: identifier, password })
      navigate('/dashboard')
    } catch (err) {
      setError(err?.data?.message || 'Email/username atau password salah.')
      setSubmitting(false)
    }
  }

  // BONUS: kirim OTP ke WhatsApp
  const sendOtp = async () => {
    setError('')
    setSubmitting(true)
    try {
      const data = await requestLoginOtp({ phone })
      setDevCode(data.dev_code || null)
      setMode('otp-code')
    } catch (err) {
      setError(err?.data?.message || 'Gagal mengirim OTP.')
    } finally {
      setSubmitting(false)
    }
  }

  // BONUS: verifikasi OTP
  const onVerify = async (code) => {
    setError('')
    setSubmitting(true)
    try {
      await verifyOtp({ phone, code })
      navigate('/dashboard')
    } catch (err) {
      setError(err?.data?.message || 'Kode OTP salah atau kedaluwarsa.')
      setSubmitting(false)
    }
  }

  return (
    <AuthShell tagline={'"Setiap rupiah tercatat,\nsetiap waktu."'}>
      {/* ===== METODE UTAMA: email/username + password ===== */}
      {mode === 'password' && (
        <form onSubmit={onPwdSubmit} className="auth-form-enter" style={{ width: '100%', maxWidth: 380 }}>
          <h1 style={titleStyle}>Masuk ke Wallet</h1>
          <div style={ruleStyle} />

          {error && <div role="alert" style={alertStyle}>{error}</div>}

          <label style={fieldLabel}>Email atau Username</label>
          <div style={{ position: 'relative' }}>
            <span style={leadIcon}><UserIcon size={18} /></span>
            <input value={identifier} onChange={(e) => { setIdentifier(e.target.value); setError('') }} placeholder="nama@email.com / @username" autoComplete="username" autoFocus style={{ ...inputStyle, paddingLeft: 44 }} />
          </div>

          <label style={{ ...fieldLabel, marginTop: 18 }}>Password</label>
          <div style={{ position: 'relative' }}>
            <span style={leadIcon}><LockIcon size={18} /></span>
            <input type={showPass ? 'text' : 'password'} value={password} onChange={(e) => { setPassword(e.target.value); setError('') }} placeholder="••••••••" autoComplete="current-password" style={{ ...inputStyle, paddingLeft: 44, paddingRight: 46 }} />
            <button type="button" onClick={() => setShowPass((s) => !s)} aria-label={showPass ? 'Sembunyikan' : 'Tampilkan'} style={eyeBtn}>
              {showPass ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
            </button>
          </div>

          <button type="submit" disabled={!canSubmitPwd} className={canSubmitPwd ? 'cta-gold' : undefined} style={primaryBtn(canSubmitPwd)}>
            {submitting ? 'Memproses…' : 'Masuk'}
          </button>

          <div style={dividerWrap}><span style={dividerLine} /><span style={dividerText}>atau</span><span style={dividerLine} /></div>

          <button type="button" onClick={() => { setMode('otp-phone'); setError('') }} style={altBtn}>
            <PhoneIcon size={16} /> Masuk dengan OTP WhatsApp
          </button>

          <a href={GOOGLE_AUTH_URL} style={{ ...altBtn, textDecoration: 'none', color: '#17191D' }}>
            <GoogleIcon size={18} /> Lanjutkan dengan Google
          </a>

          <p style={footStyle}>
            Belum punya akun?{' '}
            <Link to="/daftar" style={linkStyle}>Daftar</Link>
          </p>
        </form>
      )}

      {/* ===== BONUS: minta OTP via nomor HP ===== */}
      {mode === 'otp-phone' && (
        <form onSubmit={(e) => { e.preventDefault(); if (phoneValid && !submitting) sendOtp() }} style={{ width: '100%', maxWidth: 380 }}>
          <h1 style={titleStyle}>Masuk via WhatsApp</h1>
          <div style={ruleStyle} />
          <p style={{ fontSize: 14, color: '#5C6B73', margin: '0 0 22px' }}>Masukkan nomor HP terdaftar, kami kirim kode OTP via WhatsApp.</p>

          {error && <div role="alert" style={alertStyle}>{error}</div>}

          <label style={fieldLabel}>Nomor HP</label>
          <div style={{ position: 'relative' }}>
            <span style={leadIcon}><PhoneIcon size={18} /></span>
            <input value={phone} onChange={(e) => { setPhone(e.target.value); setError('') }} placeholder="0812-3456-7890" inputMode="tel" autoComplete="tel" autoFocus style={{ ...inputStyle, paddingLeft: 44 }} />
          </div>

          <button type="submit" disabled={!phoneValid || submitting} className={phoneValid && !submitting ? 'cta-gold' : undefined} style={primaryBtn(phoneValid && !submitting)}>
            {submitting ? 'Mengirim…' : 'Kirim Kode OTP'}
          </button>

          <button type="button" onClick={() => { setMode('password'); setError('') }} style={altBtn}>← Pakai password</button>
        </form>
      )}

      {/* ===== BONUS: input OTP ===== */}
      {mode === 'otp-code' && (
        <OtpStep
          phone={phone}
          devCode={devCode}
          error={error}
          submitting={submitting}
          onVerify={onVerify}
          onResend={sendOtp}
          onBack={() => { setMode('otp-phone'); setError(''); setDevCode(null) }}
        />
      )}
    </AuthShell>
  )
}

// Tombol primer (dipakai juga oleh Register). enabled → emas; disabled → abu.
export function primaryBtn(enabled) {
  return {
    width: '100%', marginTop: 24, padding: '14px 0', borderRadius: 10, border: 'none',
    fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 15, fontWeight: 700,
    cursor: enabled ? 'pointer' : 'not-allowed',
    background: enabled ? '#BEF264' : 'rgba(92,107,115,0.18)',
    color: enabled ? '#16210A' : '#5C6B73',
    boxShadow: enabled ? '0 10px 22px -10px rgba(190,242,100,0.7)' : 'none',
    transition: 'background .15s, transform .15s',
  }
}

const titleStyle = { fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 28, letterSpacing: '-0.02em', margin: '0 0 6px', color: '#17191D' }
const ruleStyle = { height: 3, width: 44, background: '#BEF264', borderRadius: 2, marginBottom: 24 }
const fieldLabel = { display: 'block', fontSize: 14, fontWeight: 600, color: '#17191D', marginBottom: 8 }
const inputStyle = { width: '100%', height: 50, padding: '0 14px', borderRadius: 10, border: '1.5px solid rgba(23,25,29,0.18)', background: '#fbfcf9', outline: 'none', fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 15, color: '#17191D' }
const leadIcon = { position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#5C6B73', display: 'flex' }
const eyeBtn = { position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', height: 38, width: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', cursor: 'pointer', color: '#5C6B73', borderRadius: 8 }
const alertStyle = { marginBottom: 20, padding: '12px 14px', borderRadius: 10, background: 'rgba(122,49,66,0.08)', border: '1px solid rgba(122,49,66,0.25)', color: '#7A3142', fontSize: 14, fontWeight: 500 }
const footStyle = { marginTop: 18, fontSize: 14, color: '#5C6B73', textAlign: 'center' }
const linkStyle = { color: '#4D7C0F', fontWeight: 600, textDecoration: 'none' }
const altBtn = { width: '100%', marginTop: 12, padding: '12px 0', borderRadius: 10, border: '1.5px solid rgba(23,25,29,0.18)', background: 'transparent', color: '#17191D', fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }
const dividerWrap = { display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0 4px' }
const dividerLine = { flex: 1, height: 1, background: 'rgba(23,25,29,0.12)' }
const dividerText = { fontFamily: "'IBM Plex Mono',monospace", fontSize: 12, color: '#5C6B73' }
