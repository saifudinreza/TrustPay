// Auth helpers — token + user stored in localStorage after login.
// The API layer (api.js) reads the token to attach Bearer headers.

const TOKEN_KEY = 'trustpay.token.v2'
const USER_KEY  = 'trustpay.user.v2'

export const getToken       = ()      => localStorage.getItem(TOKEN_KEY)
export const isAuthenticated = ()     => !!getToken()

export function getCurrentUser() {
  try { return JSON.parse(localStorage.getItem(USER_KEY)) } catch { return null }
}

export function setSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export function emailShapeValid(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// Indonesian phone: accept 08xx / +62xx / 62xx; valid if 9–14 digits after norm.
export function phoneShapeValid(raw) {
  const d = String(raw || '').replace(/\D+/g, '')
  const norm = d.startsWith('62') ? d : d.startsWith('0') ? '62' + d.slice(1) : d.startsWith('8') ? '62' + d : d
  return norm.length >= 11 && norm.length <= 15
}

// Pretty +62 8xx-xxxx-xxxx-ish for display.
export function prettyPhone(raw) {
  const d = String(raw || '').replace(/\D+/g, '')
  const norm = d.startsWith('62') ? d : d.startsWith('0') ? '62' + d.slice(1) : d.startsWith('8') ? '62' + d : d
  return norm ? '+' + norm : ''
}
