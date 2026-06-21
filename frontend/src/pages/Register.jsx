import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthShell from '../components/AuthShell.jsx'
import { primaryBtn } from './Login.jsx'
import { UserIcon, MailIcon, PhoneIcon, LockIcon, EyeIcon, EyeOffIcon } from '../components/icons.jsx'
import useAuth from '../hooks/useAuth.js'
import { emailShapeValid, phoneShapeValid } from '../lib/auth.js'

// Halaman Register (utama, sesuai rubrik): nama, username, email, no HP (opsional),
// password + konfirmasi → langsung dapat token & masuk dashboard.
export default function Register() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [form, setForm] = useState({ name: '', username: '', email: '', phone: '', password: '', confirm: '' })
  const [showPass, setShowPass] = useState(false)
  const [touched, setTouched] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // helper: update 1 field + reset error tiap kali user mengetik
  const set = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); setError('') }

  // validasi sisi-klien (mirror dari aturan backend) → tombol disabled sebelum valid
  const nameValid = form.name.trim().length >= 2
  const usernameValid = /^[a-z0-9_]{3,30}$/i.test(form.username.trim())
  const emailValid = emailShapeValid(form.email.trim())
  const phoneValid = form.phone.trim() === '' || phoneShapeValid(form.phone) // opsional
  const passValid = form.password.length >= 8
  const confirmValid = form.confirm === form.password && form.confirm !== ''
  const canSubmit = nameValid && usernameValid && emailValid && phoneValid && passValid && confirmValid && !submitting

  const onSubmit = async (e) => {
    e.preventDefault()
    setTouched(true)
    if (!canSubmit) return
    setError('')
    setSubmitting(true) // loading state → cegah double submit
    try {
      await register({ name: form.name, username: form.username, email: form.email, phone: form.phone, password: form.password })
      navigate('/dashboard')
    } catch (err) {
      // backend balas 422 → tampilkan pesan spesifik (mis. "Username sudah digunakan.")
      setError(err?.data?.message || firstError(err) || 'Gagal mendaftar. Coba lagi.')
      setSubmitting(false)
    }
  }

  const fieldErr = (cond) => (touched && cond ? '#7A3142' : 'rgba(17,32,61,0.18)')

  return (
    <AuthShell tagline={'Buka buku tabungan\ndigitalmu — gratis\n& tercatat rapi.'}>
      <form onSubmit={onSubmit} style={{ width: '100%', maxWidth: 400 }}>
        <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 28, letterSpacing: '-0.02em', margin: '0 0 6px', color: '#11203D' }}>
          Daftar Akun
        </h1>
        <div style={{ height: 3, width: 44, background: '#C98A2B', borderRadius: 2, marginBottom: 20 }} />

        {error && (
          <div role="alert" style={alertStyle}>{error}</div>
        )}

        <label style={fieldLabel}>Nama Lengkap</label>
        <Field icon={<UserIcon size={18} />}>
          <input value={form.name} onChange={set('name')} placeholder="mis. Aldi Pratama" autoComplete="name" style={input(fieldErr(!nameValid))} />
        </Field>
        {touched && !nameValid && <Hint>Nama minimal 2 karakter.</Hint>}

        <label style={{ ...fieldLabel, marginTop: 14 }}>Username</label>
        <Field icon={<span style={{ fontFamily: "'IBM Plex Mono',monospace", fontWeight: 700 }}>@</span>}>
          <input value={form.username} onChange={set('username')} placeholder="aldi_p" autoComplete="username" style={input(fieldErr(!usernameValid))} />
        </Field>
        {touched && !usernameValid && <Hint>Username 3–30 karakter (huruf, angka, underscore).</Hint>}

        <label style={{ ...fieldLabel, marginTop: 14 }}>Email</label>
        <Field icon={<MailIcon size={18} />}>
          <input value={form.email} onChange={set('email')} placeholder="nama@email.com" autoComplete="email" style={input(fieldErr(!emailValid))} />
        </Field>
        {touched && !emailValid && <Hint>Format email tidak valid.</Hint>}

        <label style={{ ...fieldLabel, marginTop: 14 }}>Nomor HP <span style={{ fontWeight: 400, color: '#5C6B73' }}>(opsional, untuk transfer &amp; OTP)</span></label>
        <Field icon={<PhoneIcon size={18} />}>
          <input value={form.phone} onChange={set('phone')} placeholder="0812-3456-7890" inputMode="tel" autoComplete="tel" style={input(fieldErr(!phoneValid))} />
        </Field>
        {touched && !phoneValid && <Hint>Nomor HP tidak valid.</Hint>}

        <label style={{ ...fieldLabel, marginTop: 14 }}>Password</label>
        <Field icon={<LockIcon size={18} />}>
          <input
            type={showPass ? 'text' : 'password'}
            value={form.password}
            onChange={set('password')}
            placeholder="minimal 8 karakter"
            autoComplete="new-password"
            style={{ ...input(fieldErr(!passValid)), paddingRight: 44 }}
          />
          <button type="button" onClick={() => setShowPass((s) => !s)} aria-label={showPass ? 'Sembunyikan' : 'Tampilkan'} style={eyeBtn}>
            {showPass ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
          </button>
        </Field>
        {touched && !passValid && <Hint>Password minimal 8 karakter.</Hint>}

        <label style={{ ...fieldLabel, marginTop: 14 }}>Konfirmasi Password</label>
        <Field icon={<LockIcon size={18} />}>
          <input
            type={showPass ? 'text' : 'password'}
            value={form.confirm}
            onChange={set('confirm')}
            placeholder="ulangi password"
            autoComplete="new-password"
            style={input(fieldErr(!confirmValid))}
          />
        </Field>
        {touched && !confirmValid && <Hint>Konfirmasi password tidak cocok.</Hint>}

        <button type="submit" disabled={!canSubmit} className={canSubmit ? 'cta-gold' : undefined} style={primaryBtn(canSubmit)}>
          {submitting ? 'Membuat akun…' : 'Daftar'}
        </button>

        <p style={{ marginTop: 18, fontSize: 14, color: '#5C6B73', textAlign: 'center' }}>
          Sudah punya akun?{' '}
          <Link to="/masuk" style={{ color: '#C98A2B', fontWeight: 600, textDecoration: 'none' }}>Masuk</Link>
        </p>
      </form>
    </AuthShell>
  )
}

// Ambil pesan error pertama dari respons validasi Laravel (errors: { field: [msg] }).
function firstError(err) {
  const errs = err?.data?.errors
  if (!errs) return null
  const first = Object.values(errs)[0]
  return Array.isArray(first) ? first[0] : null
}

function Field({ icon, children }) {
  return (
    <div style={{ position: 'relative' }}>
      <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#5C6B73', display: 'flex' }}>{icon}</span>
      {children}
    </div>
  )
}

function Hint({ children }) {
  return <div style={{ marginTop: 6, fontFamily: "'IBM Plex Mono',monospace", fontSize: 12, color: '#7A3142' }}>{children}</div>
}

const fieldLabel = { display: 'block', fontSize: 14, fontWeight: 600, color: '#11203D', marginBottom: 8 }
const alertStyle = { marginBottom: 18, padding: '12px 14px', borderRadius: 10, background: 'rgba(122,49,66,0.08)', border: '1px solid rgba(122,49,66,0.25)', color: '#7A3142', fontSize: 14, fontWeight: 500 }
const eyeBtn = { position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', height: 38, width: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', cursor: 'pointer', color: '#5C6B73', borderRadius: 8 }
function input(borderColor) {
  return {
    width: '100%', height: 50, padding: '0 14px 0 44px', borderRadius: 10,
    border: `1.5px solid ${borderColor}`, background: '#fbfcf9', outline: 'none',
    fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 15, color: '#11203D',
  }
}
