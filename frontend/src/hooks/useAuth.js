import { useCallback, useEffect, useState } from 'react'
import { getCurrentUser, setSession, clearSession } from '../lib/auth.js'
import { apiPost } from '../lib/api.js'

/**
 * useAuth — hook autentikasi global.
 *
 * Mengelola state `user` dan menyediakan fungsi login/register/logout/OTP.
 * State disinkronkan antar-tab lewat event 'storage' (logout di tab A →
 * tab B ikut logout karena user key di localStorage hilang).
 *
 * Semua fungsi async melempar error saat API gagal — pemanggil (Login/Register)
 * menangkap dan menampilkan pesan error di UI.
 */
export default function useAuth() {
  // Inisialisasi dari cookie/localStorage sehingga tidak perlu refetch saat hard refresh
  const [user, setUser] = useState(() => getCurrentUser())
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setUser(getCurrentUser())
    setReady(true) // sinyal bahwa state sudah tersinkron dengan storage

    // Sinkronkan antar-tab: jika tab lain login/logout, user key localStorage berubah
    const onStorage = () => setUser(getCurrentUser())
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  /**
   * REGISTER (metode utama, sesuai rubrik) — email/username + password.
   * Backend membuat akun, wallet awal (saldo 0), dan Sanctum token.
   * Langsung simpan sesi dan arahkan ke dashboard.
   */
  const register = useCallback(async ({ name, username, email, phone, password }) => {
    const data = await apiPost('/register', {
      name, username, email,
      phone: phone || undefined,   // undefined → tidak dikirim ke API (field opsional)
      password,
      password_confirmation: password, // dipakai aturan 'confirmed' di RegisterRequest.php
    })
    setSession(data.token, data.user) // simpan token ke cookie + user ke localStorage
    setUser(data.user)
    return data.user
  }, [])

  /**
   * LOGIN (metode utama) — email/username + password.
   * `login` adalah field generik yang bisa berisi email atau username.
   */
  const login = useCallback(async ({ login: identifier, password }) => {
    const data = await apiPost('/login', { login: identifier, password })
    setSession(data.token, data.user)
    setUser(data.user)
    return data.user
  }, [])

  /**
   * (BONUS) Minta OTP ke WhatsApp untuk nomor yang terdaftar.
   * Mengembalikan { message, dev_code? } — dev_code hanya ada di APP_ENV=local.
   */
  const requestLoginOtp = useCallback(async ({ phone }) => {
    return apiPost('/login/request-otp', { phone })
  }, [])

  /**
   * (BONUS) Verifikasi OTP 6 digit → terima token dari backend → simpan sesi.
   */
  const verifyOtp = useCallback(async ({ phone, code }) => {
    const data = await apiPost('/verify-otp', { phone, code })
    setSession(data.token, data.user)
    setUser(data.user)
    return data.user
  }, [])

  /**
   * LOGOUT — hapus token di backend (token Sanctum yang dipakai), lalu bersihkan sesi lokal.
   * Error API diabaikan (mis. token sudah kedaluwarsa) — tetap logout dari sisi klien.
   */
  const logout = useCallback(async () => {
    try { await apiPost('/logout') } catch { /* abaikan; tetap bersihkan sesi lokal */ }
    clearSession() // hapus cookie + localStorage
    setUser(null)
  }, [])

  return { user, ready, register, login, requestLoginOtp, verifyOtp, logout }
}
