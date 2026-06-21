// Thin fetch wrapper around the Laravel API. All requests include the Sanctum
// Bearer token from localStorage. Throws { status, data } on non-2xx responses.

const BASE = import.meta.env.VITE_API_URL || '/api'

function getToken() {
  return localStorage.getItem('trustpay.token.v2')
}

async function request(method, path, body) {
  const headers = { Accept: 'application/json', 'Content-Type': 'application/json' }
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(BASE + path, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(data?.message || `HTTP ${res.status}`)
    err.status = res.status
    err.data = data
    throw err
  }
  return data
}

export const apiGet = (path) => request('GET', path)
export const apiPost = (path, body) => request('POST', path, body)
export const apiDelete = (path) => request('DELETE', path)
