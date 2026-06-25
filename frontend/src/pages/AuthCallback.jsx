import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { setSession } from '../lib/auth.js'

/**
 * AuthCallback — halaman penerima redirect dari OAuth Google.
 *
 * Alur:
 *  1. Backend redirect ke /auth/callback?token=xxx&user=yyy setelah Google auth sukses
 *  2. Halaman ini membaca param, menyimpan sesi, lalu redirect ke Dashboard
 *  3. Jika terjadi error (param missing / parse gagal), redirect ke /masuk dengan pesan error
 *
 * Route ini sengaja TIDAK dibungkus <Guest> karena token belum tersimpan saat halaman ini dimuat.
 */
export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const params  = new URLSearchParams(window.location.search)
    const token   = params.get('token')
    const userRaw = params.get('user')
    const error   = params.get('error')

    if (error || !token || !userRaw) {
      navigate('/masuk?error=google_gagal', { replace: true })
      return
    }

    try {
      const user = JSON.parse(decodeURIComponent(userRaw))
      setSession(token, user)
      navigate('/dashboard', { replace: true })
    } catch {
      navigate('/masuk?error=google_gagal', { replace: true })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{
      height: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 18,
      background: '#EFF1EC', color: '#17191D',
      fontFamily: "'Space Grotesk',sans-serif",
    }}>
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
      </svg>
      <span style={{ fontSize: 17, fontWeight: 600 }}>Memproses akun Google…</span>
    </div>
  )
}
