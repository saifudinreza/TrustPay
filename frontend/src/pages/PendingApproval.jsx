import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { T, FONT } from '../lib/theme.js'
import Logo from '../components/Logo.jsx'

export default function PendingApproval() {
  const [email, setEmail] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setEmail(params.get('email') || '')
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: T.pageGrad, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
      <div style={{ width: '100%', maxWidth: 460 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Logo size={42} textSize={22} />
        </div>

        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 24, overflow: 'hidden', boxShadow: '0 32px 80px -24px rgba(0,0,0,0.85)' }}>
          <div style={{ height: 4, background: T.btnGrad }} />

          <div style={{ padding: '36px 32px 40px', textAlign: 'center' }}>
            {/* Icon jam / pending */}
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: T.goldSoft, border: `1.5px solid ${T.border2}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke={T.goldBright} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>

            <h1 style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 24, color: T.ink, margin: '0 0 12px' }}>
              Akun Menunggu Verifikasi
            </h1>

            <p style={{ fontFamily: FONT.sans, fontSize: 15, color: T.muted, lineHeight: 1.65, margin: '0 0 24px' }}>
              Akun Google kamu sudah terdaftar dan sedang dalam proses verifikasi oleh tim TrustPay.
            </p>

            {email && (
              <div style={{ background: T.surface2, border: `1px solid ${T.border2}`, borderRadius: 12, padding: '12px 16px', marginBottom: 24 }}>
                <div style={{ fontSize: 12, color: T.muted, marginBottom: 4, fontFamily: FONT.mono, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Email terdaftar</div>
                <div style={{ fontSize: 15, color: T.goldBright, fontFamily: FONT.mono, fontWeight: 500 }}>{email}</div>
              </div>
            )}

            <div style={{ background: T.goldSoft, border: `1px solid ${T.border2}`, borderRadius: 12, padding: '14px 16px', marginBottom: 32, textAlign: 'left' }}>
              <div style={{ fontSize: 13, color: T.inkSoft, lineHeight: 1.6 }}>
                <div style={{ fontWeight: 600, color: T.goldBright, marginBottom: 6 }}>Apa yang terjadi selanjutnya?</div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                  <span style={{ color: T.gold }}>1.</span>
                  <span>Tim kami akan memverifikasi identitas kamu dalam 1×24 jam.</span>
                </div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                  <span style={{ color: T.gold }}>2.</span>
                  <span>Setelah disetujui, kamu bisa login kembali menggunakan akun Google.</span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span style={{ color: T.gold }}>3.</span>
                  <span>Hubungi dukungan jika proses melebihi waktu yang ditentukan.</span>
                </div>
              </div>
            </div>

            <Link
              to="/masuk"
              style={{ display: 'block', padding: '14px 0', background: T.btnGrad, borderRadius: 14, fontFamily: FONT.display, fontWeight: 700, fontSize: 15, color: T.onGold, textDecoration: 'none', boxShadow: '0 8px 20px -8px rgba(201,149,43,0.6)' }}
            >
              Kembali ke Halaman Login
            </Link>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: T.mutedDim, fontFamily: FONT.sans }}>
          Butuh bantuan?{' '}
          <a href="mailto:support@trustpay.id" style={{ color: T.gold, textDecoration: 'none' }}>
            Hubungi Support
          </a>
        </p>
      </div>
    </div>
  )
}
