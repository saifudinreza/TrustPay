import { useCallback, useEffect, useState } from 'react'
import { getCurrentUser, setSession, clearSession } from '../lib/auth.js'
import { apiPost } from '../lib/api.js'

// Hook autentikasi. Menyimpan user aktif di state + sinkron antar-tab lewat event
// 'storage'. Semua fungsi async dan MELEMPAR error saat API gagal, sehingga
// pemanggil (halaman Login/Register) bisa menampilkan pesannya di UI.
export default function useAuth() {
  const [user, setUser] = useState(() => getCurrentUser())
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setUser(getCurrentUser())
    setReady(true)
    const onStorage = () => setUser(getCurrentUser()) // tab lain login/logout → ikut update
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  // REGISTER (utama) — email/username + password. Backend balas token + user.
  const register = useCallback(async ({ name, username, email, phone, password }) => {
    const data = await apiPost('/register', {
      name, username, email,
      phone: phone || undefined,
      password,
      password_confirmation: password, // dipakai aturan 'confirmed' di backend
    })
    setSession(data.token, data.user) // simpan token + user ke localStorage
    setUser(data.user)
    return data.user
  }, [])

  // LOGIN (utama) — email/username + password.
  const login = useCallback(async ({ login: identifier, password }) => {
    const data = await apiPost('/login', { login: identifier, password })
    setSession(data.token, data.user)
    setUser(data.user)
    return data.user
  }, [])

  // (BONUS) minta OTP WhatsApp untuk nomor terdaftar. Balas { message, dev_code? }.
  const requestLoginOtp = useCallback(async ({ phone }) => {
    return apiPost('/login/request-otp', { phone })
  }, [])

  // (BONUS) verifikasi OTP → session.
  const verifyOtp = useCallback(async ({ phone, code }) => {
    const data = await apiPost('/verify-otp', { phone, code })
    setSession(data.token, data.user)
    setUser(data.user)
    return data.user
  }, [])

  const logout = useCallback(async () => {
    try { await apiPost('/logout') } catch { /* abaikan — tetap bersihkan sesi lokal */ }
    clearSession()
    setUser(null)
  }, [])

  return { user, ready, register, login, requestLoginOtp, verifyOtp, logout }
}
