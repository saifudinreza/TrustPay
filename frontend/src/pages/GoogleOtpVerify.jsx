import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiPost } from '../lib/api.js'
import { setSession } from '../lib/auth.js'
import { T, FONT } from '../lib/theme.js'
import Logo from '../components/Logo.jsx'

/**
 * GoogleOtpVerify — verifikasi OTP yang dikirim ke Gmail setelah Google OAuth.
 *
 * Alur:
 *  1. Backend redirect ke /auth/google/verifikasi?email=xxx&dev_code=yyy (dev only)
 *  2. User masukkan 6-digit OTP dari Gmail
 *  3. POST /api/auth/google/verify-otp → dapat token + user
 *  4. Simpan sesi → redirect ke /dashboard
 */
export default function GoogleOtpVerify() {
  const navigate = useNavigate()
  const [email, setEmail]       = useState('')
  const [devCode, setDevCode]   = useState('')
  const [digits, setDigits]     = useState(['', '', '', '', '', ''])
  const [submitting, setSubmitting] = useState(false)
  const [resending, setResending]   = useState(false)
  const [error, setError]       = useState(null)
  const [countdown, setCountdown]   = useState(45)
  const inputs = useRef([])
  const timerRef = useRef(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const em = params.get('email') || ''
    const dc = params.get('dev_code') || ''
    setEmail(em)
    setDevCode(dc)
    if (!em) navigate('/masuk', { replace: true })
    inputs.current[0]?.focus()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Countdown sebelum boleh resend
  useEffect(() => {
    if (countdown <= 0) return
    timerRef.current = setInterval(() => setCountdown(c => c - 1), 1000)
    return () => clearInterval(timerRef.current)
  }, [countdown])

  const code = digits.join('')

  const setAt = (i, val) => {
    const v = val.replace(/\D/g, '').slice(-1)
    setDigits(prev => { const n = [...prev]; n[i] = v; return n })
    if (v && i < 5) inputs.current[i + 1]?.focus()
  }

  const onKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) inputs.current[i - 1]?.focus()
    if (e.key === 'Enter' && code.length === 6) submit()
  }

  const onPaste = (e) => {
    const text = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, 6)
    if (!text) return
    e.preventDefault()
    const next = ['', '', '', '', '', '']
    for (let i = 0; i < text.length; i++) next[i] = text[i]
    setDigits(next)
    inputs.current[Math.min(text.length, 5)]?.focus()
  }

  const submit = async () => {
    if (code.length !== 6 || submitting) return
    setError(null)
    setSubmitting(true)
    try {
      const res = await apiPost('/auth/google/verify-otp', { email, otp: code })
      setSession(res.token, res.user)
      navigate('/dashboard', { replace: true })
    } catch (e) {
      setError(e?.data?.message || 'Verifikasi gagal. Periksa kode OTP kamu.')
      setSubmitting(false)
    }
  }

  const resend = async () => {
    if (countdown > 0 || resending) return
    setResending(true)
    setError(null)
    try {
      const res = await apiPost('/auth/google/resend-otp', { email })
      if (res.dev_code) setDevCode(res.dev_code)
      setDigits(['', '', '', '', '', ''])
      setCountdown(45)
      inputs.current[0]?.focus()
    } catch (e) {
      setError(e?.data?.message || 'Gagal mengirim ulang OTP.')
    } finally {
      setResending(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: T.pageGrad, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Logo size={40} textSize={20} />
        </div>

        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 24, overflow: 'hidden', boxShadow: '0 32px 80px -24px rgba(0,0,0,0.85)' }}>
          <div style={{ height: 4, background: T.btnGrad }} />

          <div style={{ padding: '30px 28px 36px' }}>
            {/* Google icon + judul */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: T.surface2, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="22" height="22" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
              </div>
              <div>
                <h1 style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 20, color: T.ink, margin: 0 }}>Verifikasi Google</h1>
                <p style={{ fontSize: 13, color: T.muted, margin: 0 }}>Masukkan kode OTP dari Gmail kamu</p>
              </div>
            </div>

            {/* Info email */}
            <div style={{ background: T.surface2, border: `1px solid ${T.border}`, borderRadius: 12, padding: '12px 14px', marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: T.muted, marginBottom: 3, letterSpacing: '0.04em' }}>Kode dikirim ke</div>
              <div style={{ fontSize: 14, color: T.goldBright, fontFamily: FONT.mono, fontWeight: 500, wordBreak: 'break-all' }}>{email}</div>
            </div>

            {/* Dev badge */}
            {devCode && (
              <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 12, background: T.goldSoft, border: `1px dashed ${T.border2}`, color: T.goldBright, fontFamily: FONT.mono, fontSize: 13 }}>
                Mode dev — kode OTP: <strong style={{ letterSpacing: '0.12em' }}>{devCode}</strong>
              </div>
            )}

            {/* Error */}
            {error && (
              <div style={{ marginBottom: 16, padding: '12px 14px', borderRadius: 12, background: 'rgba(251,113,133,0.12)', border: '1px solid rgba(251,113,133,0.3)', color: '#FB7185', fontSize: 14, fontWeight: 500 }}>
                {error}
              </div>
            )}

            {/* 6-digit OTP input */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8, marginBottom: 22 }} onPaste={onPaste}>
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={el => (inputs.current[i] = el)}
                  value={d}
                  onChange={e => setAt(i, e.target.value)}
                  onKeyDown={e => onKeyDown(i, e)}
                  inputMode="numeric"
                  maxLength={1}
                  aria-label={`Digit ${i + 1}`}
                  style={{
                    width: '100%', height: 56, textAlign: 'center',
                    boxSizing: 'border-box',
                    borderRadius: 12, border: `1.5px solid ${d ? T.border2 : T.border}`,
                    background: T.surface2, outline: 'none',
                    fontFamily: FONT.mono, fontSize: 22, fontWeight: 600, color: T.ink,
                    transition: 'border-color .15s',
                  }}
                />
              ))}
            </div>

            {/* Submit */}
            <button
              onClick={submit}
              disabled={code.length !== 6 || submitting}
              style={{
                width: '100%', padding: '15px 0', borderRadius: 14, border: 'none',
                fontFamily: FONT.display, fontSize: 15, fontWeight: 700,
                cursor: code.length === 6 && !submitting ? 'pointer' : 'not-allowed',
                background: code.length === 6 && !submitting ? T.btnGrad : 'rgba(255,255,255,0.06)',
                color: code.length === 6 && !submitting ? T.onGold : T.mutedDim,
                boxShadow: code.length === 6 && !submitting ? '0 12px 28px -10px rgba(201,149,43,0.65)' : 'none',
                transition: 'background .15s',
              }}
            >
              {submitting ? 'Memverifikasi…' : 'Verifikasi & Masuk'}
            </button>

            {/* Resend */}
            <p style={{ marginTop: 18, fontSize: 14, color: T.muted, textAlign: 'center' }}>
              Tidak menerima kode?{' '}
              {countdown > 0 ? (
                <span style={{ color: T.mutedDim }}>kirim ulang dalam {countdown}d</span>
              ) : (
                <button
                  onClick={resend}
                  disabled={resending}
                  style={{ background: 'none', border: 'none', color: T.goldBright, fontWeight: 600, cursor: 'pointer', padding: 0, fontSize: 14 }}
                >
                  {resending ? 'Mengirim…' : 'Kirim ulang'}
                </button>
              )}
            </p>

            {/* Back */}
            <div style={{ marginTop: 20, textAlign: 'center', borderTop: `1px solid ${T.border}`, paddingTop: 16 }}>
              <a href="/masuk" style={{ fontSize: 13, color: T.muted, textDecoration: 'none' }}>
                ← Kembali ke halaman login
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
