// lib/auth.js — manajemen sesi (token + data user) setelah login.
//
// Strategi penyimpanan token (bonus #6):
//  - Token disimpan di COOKIE (bukan localStorage) agar lebih aman dari XSS.
//  - Cookie ini bukan httpOnly (JS perlu membacanya untuk header Authorization),
//    tapi lebih baik dari localStorage karena bisa diset SameSite=Strict.
//  - Untuk httpOnly penuh: backend kirim token via Set-Cookie httpOnly, dan
//    frontend pakai `credentials: 'include'` saja (tanpa membaca token).
//
// Data user (nama, username, dll) tetap di localStorage — bukan rahasia kritis.

const TOKEN_KEY = 'trustpay_token'   // nama cookie
const USER_KEY  = 'trustpay.user.v2' // key localStorage untuk data user

// ---- token (cookie) ----

/**
 * Simpan token ke cookie dengan atribut keamanan:
 *  - SameSite=Strict → tidak dikirim untuk cross-site request (CSRF protection)
 *  - path=/ → berlaku untuk semua halaman
 *  - max-age=86400 → expire 24 jam (sesuaikan dengan TTL token Sanctum)
 */
function setTokenCookie(token) {
  document.cookie = `${TOKEN_KEY}=${encodeURIComponent(token)}; path=/; SameSite=Strict; max-age=86400`
}

/** Hapus cookie dengan cara set max-age=0 */
function clearTokenCookie() {
  document.cookie = `${TOKEN_KEY}=; path=/; SameSite=Strict; max-age=0`
}

/** Baca nilai cookie berdasarkan nama */
function getTokenCookie() {
  const match = document.cookie.match(/(?:^|;\s*)trustpay_token=([^;]*)/)
  return match ? decodeURIComponent(match[1]) : null
}

export const getToken        = () => getTokenCookie()
export const isAuthenticated = () => !!getToken()

// ---- user (localStorage) ----

/** Ambil data user yang tersimpan; kembalikan null jika tidak ada / rusak */
export function getCurrentUser() {
  try { return JSON.parse(localStorage.getItem(USER_KEY)) } catch { return null }
}

/** Simpan token (cookie) + data user (localStorage) setelah login/register berhasil */
export function setSession(token, user) {
  setTokenCookie(token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

/** Hapus semua data sesi (dipakai saat logout atau 401) */
export function clearSession() {
  clearTokenCookie()
  localStorage.removeItem(USER_KEY)
  // Hapus juga localStorage lama (jika upgrade dari versi sebelumnya)
  localStorage.removeItem('trustpay.token.v2')
}

// ---- validasi format sisi klien ----

/** Cek apakah string terlihat seperti email (validasi kasar, bukan RFC-strict) */
export function emailShapeValid(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

/**
 * Cek apakah nomor HP Indonesia valid:
 * Menerima 08xx / +62xx / 62xx; valid jika 11–15 digit setelah normalisasi.
 */
export function phoneShapeValid(raw) {
  const d = String(raw || '').replace(/\D+/g, '')
  const norm = d.startsWith('62') ? d
    : d.startsWith('0') ? '62' + d.slice(1)
    : d.startsWith('8') ? '62' + d
    : d
  return norm.length >= 11 && norm.length <= 15
}

/** Format nomor HP menjadi "+62 8xx..." untuk ditampilkan di UI */
export function prettyPhone(raw) {
  const d = String(raw || '').replace(/\D+/g, '')
  const norm = d.startsWith('62') ? d
    : d.startsWith('0') ? '62' + d.slice(1)
    : d.startsWith('8') ? '62' + d
    : d
  return norm ? '+' + norm : ''
}
