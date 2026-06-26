import { useCallback, useEffect, useState } from 'react'
import { getCurrentUser, setSession, clearSession, getToken } from '../lib/auth.js'
import { apiPost, apiPut } from '../lib/api.js'

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

    // Sinkronkan:
    //  - antar-TAB lewat event 'storage' (login/logout di tab lain)
    //  - antar-KOMPONEN di tab yang sama lewat event kustom 'trustpay:auth'
    //    (event 'storage' tidak menyala di tab yang menulis, jadi kita pakai event sendiri
    //     agar Profile & Dashboard ikut ter-update setelah edit profil / atur PIN).
    const sync = () => setUser(getCurrentUser())
    window.addEventListener('storage', sync)
    window.addEventListener('trustpay:auth', sync)
    return () => {
      window.removeEventListener('storage', sync)
      window.removeEventListener('trustpay:auth', sync)
    }
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
   * UPDATE PROFILE — perbarui nama/username/email/HP (PUT /me).
   * Backend mengembalikan user terbaru → simpan ulang ke sesi & state.
   */
  const updateProfile = useCallback(async ({ name, username, email, phone }) => {
    const data = await apiPut('/me', {
      name,
      username: String(username || '').replace(/^@/, ''), // kirim tanpa '@'
      email,
      phone: phone || undefined,
    })
    persistUser(data.user)
    return data.user
  }, [])

  /**
   * SET / CHANGE PIN — atur PIN 6 digit (POST /pin).
   * `currentPin` hanya wajib saat mengubah PIN yang sudah ada.
   */
  const setPin = useCallback(async ({ pin, currentPin }) => {
    const data = await apiPost('/pin', {
      pin,
      pin_confirmation: pin,
      current_pin: currentPin || undefined,
    })
    persistUser(data.user)
    return data.user
  }, [])

  // Simpan ulang data user (token tetap) ke cookie+localStorage dan state React,
  // lalu beri tahu komponen lain di tab yang sama (Dashboard/Profile) untuk re-sync.
  const persistUser = (u) => {
    const token = getToken()
    if (token) setSession(token, u)
    setUser(u)
    window.dispatchEvent(new Event('trustpay:auth'))
  }

  /**
   * LOGOUT — hapus token di backend (token Sanctum yang dipakai), lalu bersihkan sesi lokal.
   * Error API diabaikan (mis. token sudah kedaluwarsa) — tetap logout dari sisi klien.
   */
  const logout = useCallback(async () => {
    try { await apiPost('/logout') } catch { /* abaikan; tetap bersihkan sesi lokal */ }
    clearSession() // hapus cookie + localStorage
    setUser(null)
  }, [])

  return { user, ready, register, login, requestLoginOtp, verifyOtp, updateProfile, setPin, logout }
}
