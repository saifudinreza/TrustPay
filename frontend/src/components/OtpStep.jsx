import { useEffect, useRef, useState } from 'react'
import { ChevronLeftIcon } from './icons.jsx'
import { prettyPhone } from '../lib/auth.js'

// Shared OTP entry step (used by Login & Register). Renders 6 single-digit boxes,
// a resend-with-countdown, a back link, and an optional dev-code hint.
export default function OtpStep({ phone, onVerify, onResend, onBack, submitting, error, devCode }) {
  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [seconds, setSeconds] = useState(45)
  const inputs = useRef([])

  useEffect(() => {
    inputs.current[0]?.focus()
  }, [])

  useEffect(() => {
    if (seconds <= 0) return
    const t = setInterval(() => setSeconds((s) => s - 1), 1000)
    return () => clearInterval(t)
  }, [seconds])

  const code = digits.join('')

  const setAt = (i, val) => {
    const v = val.replace(/\D/g, '').slice(-1)
    setDigits((prev) => {
      const next = [...prev]
      next[i] = v
      return next
    })
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

  const submit = () => {
    if (code.length === 6 && !submitting) onVerify(code)
  }

  const resend = async () => {
    if (seconds > 0) return
    await onResend()
    setSeconds(45)
    setDigits(['', '', '', '', '', ''])
    inputs.current[0]?.focus()
  }

  return (
    <div style={{ width: '100%', maxWidth: 400 }}>
      <button type="button" onClick={onBack} style={backBtn}>
        <ChevronLeftIcon size={16} /> Ubah nomor
      </button>

      <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 28, letterSpacing: '-0.02em', margin: '14px 0 6px', color: '#11203D' }}>
        Masukkan Kode OTP
      </h1>
      <div style={{ height: 3, width: 44, background: '#C98A2B', borderRadius: 2, marginBottom: 16 }} />
      <p style={{ fontSize: 14, color: '#5C6B73', margin: '0 0 22px', lineHeight: 1.5 }}>
        Kami mengirim 6 digit kode ke <strong style={{ color: '#11203D' }}>{prettyPhone(phone)}</strong>.
      </p>

      {devCode && (
        <div style={{ marginBottom: 18, padding: '10px 14px', borderRadius: 10, background: 'rgba(201,138,43,0.10)', border: '1px dashed rgba(201,138,43,0.5)', color: '#8a5e16', fontFamily: "'IBM Plex Mono',monospace", fontSize: 13 }}>
          Mode dev — kode OTP: <strong style={{ letterSpacing: '0.12em' }}>{devCode}</strong>
        </div>
      )}

      {error && (
        <div role="alert" style={{ marginBottom: 18, padding: '12px 14px', borderRadius: 10, background: 'rgba(122,49,66,0.08)', border: '1px solid rgba(122,49,66,0.25)', color: '#7A3142', fontSize: 14, fontWeight: 500 }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, marginBottom: 22 }} onPaste={onPaste}>
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => (inputs.current[i] = el)}
            value={d}
            onChange={(e) => setAt(i, e.target.value)}
            onKeyDown={(e) => onKeyDown(i, e)}
            inputMode="numeric"
            maxLength={1}
            aria-label={`Digit ${i + 1}`}
            style={otpBox}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={submit}
        disabled={code.length !== 6 || submitting}
        className={code.length === 6 && !submitting ? 'cta-gold' : undefined}
        style={{
          width: '100%',
          padding: '14px 0',
          borderRadius: 10,
          border: 'none',
          fontFamily: "'Plus Jakarta Sans',sans-serif",
          fontSize: 15,
          fontWeight: 700,
          cursor: code.length === 6 && !submitting ? 'pointer' : 'not-allowed',
          background: code.length === 6 && !submitting ? '#C98A2B' : 'rgba(92,107,115,0.18)',
          color: code.length === 6 && !submitting ? '#1a1205' : '#5C6B73',
          boxShadow: code.length === 6 && !submitting ? '0 10px 22px -10px rgba(201,138,43,0.7)' : 'none',
          transition: 'background .15s, transform .15s',
        }}
      >
        {submitting ? 'Memverifikasi…' : 'Verifikasi & Masuk'}
      </button>

      <p style={{ marginTop: 18, fontSize: 14, color: '#5C6B73', textAlign: 'center' }}>
        Tidak menerima kode?{' '}
        {seconds > 0 ? (
          <span style={{ color: '#5C6B73' }}>kirim ulang dalam {seconds}s</span>
        ) : (
          <button type="button" onClick={resend} style={{ background: 'none', border: 'none', color: '#C98A2B', fontWeight: 600, cursor: 'pointer', padding: 0, fontSize: 14 }}>Kirim ulang</button>
        )}
      </p>
    </div>
  )
}

const backBtn = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  background: 'none',
  border: 'none',
  color: '#5C6B73',
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
  padding: 0,
}
const otpBox = {
  width: '100%',
  height: 56,
  textAlign: 'center',
  borderRadius: 10,
  border: '1.5px solid rgba(17,32,61,0.18)',
  background: '#fbfcf9',
  outline: 'none',
  fontFamily: "'IBM Plex Mono',monospace",
  fontSize: 24,
  fontWeight: 600,
  color: '#11203D',
}
