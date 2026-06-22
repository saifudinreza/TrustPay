// lib/api.js — thin HTTP wrapper untuk semua panggilan ke Laravel API.
//
// Cara kerja:
//  - BASE URL dibaca dari .env (VITE_API_URL); default '/api' (proxy Vite ke backend)
//  - Setiap request menyertakan token Sanctum dari cookie 'trustpay_token' sebagai header Authorization
//  - Response non-2xx dilempar sebagai Error dengan properti .status dan .data
//    sehingga pemanggil (hook/page) bisa menangkap dan menampilkan pesannya

const BASE = import.meta.env.VITE_API_URL || '/api'

/**
 * Ambil token dari cookie 'trustpay_token' (httpOnly cookie tidak bisa dibaca JS;
 * token ini disimpan di cookie biasa sebagai langkah awal migrasi dari localStorage).
 * Untuk bonus httpOnly penuh, token harus dikirim oleh backend via Set-Cookie httpOnly
 * dan frontend cukup mengirim `credentials: 'include'` tanpa membaca token sama sekali.
 */
function getToken() {
  // Baca dari cookie (format: "key=value; key2=value2")
  const match = document.cookie.match(/(?:^|;\s*)trustpay_token=([^;]*)/)
  // Fallback ke localStorage untuk kompatibilitas mundur
  return match ? decodeURIComponent(match[1]) : localStorage.getItem('trustpay.token.v2')
}

/**
 * Fungsi inti HTTP — semua endpoint API memanggil ini.
 * @param {string} method   - GET | POST | DELETE
 * @param {string} path     - path relatif, mis. '/login', '/wallet'
 * @param {object} [body]   - body JSON (opsional, hanya untuk POST)
 * @returns {Promise<any>}  - data JSON dari respons, atau melempar Error
 */
async function request(method, path, body) {
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  }

  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(BASE + path, {
    method,
    headers,
    credentials: 'include', // kirim cookie (termasuk jika backend pakai cookie-based Sanctum)
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  // Coba parse JSON; jika gagal (respons kosong / bukan JSON), gunakan object kosong
  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    // Lempar Error dengan properti tambahan agar pemanggil bisa cek status & pesan spesifik
    const err = new Error(data?.message || `HTTP ${res.status}`)
    err.status = res.status   // mis. 401, 422, 400
    err.data = data           // body lengkap (mis. { errors: { field: [...] } } dari Laravel)
    throw err
  }

  return data
}

// Shortcut per metode HTTP
export const apiGet    = (path)        => request('GET',    path)
export const apiPost   = (path, body)  => request('POST',   path, body)
export const apiDelete = (path)        => request('DELETE', path)
