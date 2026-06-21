// Shared wallet helpers + validation. Frontend-only simulation, no real API.
// Data model mirrors PRD §6.4 (ledger per baris): every mutation is its own row
// with balance_after recorded, so the history is self-explanatory / audit-ready.

export const MAX_TX = 10000000
export const PER = 5

export const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
]

// Simulated user directory for transfer recipient lookup.
export const DIRECTORY = {
  budi: 'Budi S.',
  siti: 'Siti A.',
  reza: 'Saifudin R.',
  dewi: 'Dewi K.',
  rina: 'Rina W.',
}

export const SELF = ['aldi', '@aldi', 'saya', '@saya']

// Logged-in demo user (used for QR / profile).
export const ME = {
  name: 'Aldi P.',
  username: '@aldi',
  account: '8021 4455 4021',
  phone: '0812-3344-4021',
}

// ---- formatting ----
export const group = (n) =>
  Math.abs(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')

export const fmtRp = (n) => 'Rp ' + group(n)

export const fmtTime = (d) =>
  String(d.getHours()).padStart(2, '0') +
  ':' +
  String(d.getMinutes()).padStart(2, '0')

export const fmtDate = (d) =>
  d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear()

// Unique, human-readable transaction code (audit-ready, PRD theme).
export function genCode(ts = Date.now()) {
  const d = new Date(ts)
  const ymd =
    d.getFullYear().toString() +
    String(d.getMonth() + 1).padStart(2, '0') +
    String(d.getDate()).padStart(2, '0')
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `TRX-${ymd}-${rand}`
}

// Build a normalized transaction row.
export function makeTransaction({ type, amount, counterparty, balanceAfter, description = '', ts = Date.now() }) {
  const d = new Date(ts)
  const signed = type === 'KELUAR' ? -Math.abs(amount) : Math.abs(amount)
  return {
    id: ts,
    code: genCode(ts),
    ts,
    dateStr: fmtDate(d),
    timeStr: fmtTime(d),
    type,
    counterparty: counterparty || '—',
    amount: signed,
    balanceAfter,
    description,
  }
}

// ---- validation (mirrors PRD §9.2 microcopy, verbatim) ----
export function validateNominal(raw) {
  const v = (raw || '').trim()
  if (v === '') return { err: 'Nominal tidak boleh kosong.' }
  if (/^-/.test(v)) return { err: 'Nominal tidak boleh negatif.' }
  const noThousand = v.replace(/[.\s]/g, '')
  if (/,/.test(noThousand)) return { err: 'Nominal harus berupa bilangan bulat.' }
  if (!/^[0-9]+$/.test(noThousand)) return { err: 'Nominal harus berupa angka.' }
  const n = parseInt(noThousand, 10)
  if (n <= 0) return { err: 'Nominal tidak boleh negatif.' }
  if (n > MAX_TX) return { err: 'Nominal melebihi batas maksimum transaksi.' }
  return { n }
}

export function recipientStatus(raw) {
  const v = (raw || '').trim().toLowerCase().replace(/^@/, '')
  if (v === '') return { status: 'empty' }
  if (SELF.includes(v) || SELF.includes('@' + v)) return { status: 'self' }
  const name = DIRECTORY[v]
  if (name) return { status: 'found', name }
  return { status: 'notfound' }
}

// Seed transactions for first run (matches the design's initial state, with ts + codes).
function seedTs(y, mo, d, h, mi) {
  return new Date(y, mo, d, h, mi).getTime()
}
export const SEED_TRANSACTIONS = [
  makeTransaction({ type: 'MASUK', amount: 500000, counterparty: 'dari Budi S.', balanceAfter: 2450000, ts: seedTs(2026, 5, 21, 9, 12), description: 'Transfer masuk' }),
  makeTransaction({ type: 'KELUAR', amount: 150000, counterparty: 'ke Siti A.', balanceAfter: 1950000, ts: seedTs(2026, 5, 20, 14, 30), description: 'bayar makan siang' }),
  makeTransaction({ type: 'TOPUP', amount: 1000000, counterparty: '—', balanceAfter: 2100000, ts: seedTs(2026, 5, 18, 8, 0), description: 'Top up saldo' }),
  makeTransaction({ type: 'KELUAR', amount: 75000, counterparty: 'ke Reza P.', balanceAfter: 1100000, ts: seedTs(2026, 5, 15, 19, 45), description: 'patungan' }),
  makeTransaction({ type: 'MASUK', amount: 300000, counterparty: 'dari Dewi K.', balanceAfter: 1175000, ts: seedTs(2026, 5, 12, 10, 20), description: 'Transfer masuk' }),
  makeTransaction({ type: 'TOPUP', amount: 500000, counterparty: '—', balanceAfter: 875000, ts: seedTs(2026, 5, 10, 16, 5), description: 'Top up saldo' }),
]

export const SEED_BALANCE = 2450000

// Accent + label derivation for a transaction row.
export function rowMeta(t) {
  const masuk = t.amount > 0
  const accent = t.type === 'TOPUP' ? '#C98A2B' : masuk ? '#2F6F4E' : '#7A3142'
  const typeLabel = t.type === 'TOPUP' ? 'Top Up' : masuk ? 'Masuk' : 'Keluar'
  const sign = masuk ? '+' : '−'
  return {
    accent,
    typeLabel,
    counterparty: t.counterparty || '—',
    amountStr: sign + ' ' + fmtRp(t.amount),
    balanceAfterStr: fmtRp(t.balanceAfter),
  }
}

// ---- monthly summary (Ringkasan bulanan) ----
export function monthlySummary(transactions, ref = new Date()) {
  const y = ref.getFullYear()
  const m = ref.getMonth()
  let masuk = 0
  let keluar = 0
  let count = 0
  for (const t of transactions) {
    const d = new Date(t.ts)
    if (d.getFullYear() === y && d.getMonth() === m) {
      count++
      if (t.amount > 0) masuk += t.amount
      else keluar += Math.abs(t.amount)
    }
  }
  return { masuk, keluar, net: masuk - keluar, count, label: `${MONTHS[m]} ${y}` }
}

// ---- filter & search (Filter & cari riwayat) ----
// filters: { type: 'ALL'|'MASUK'|'KELUAR'|'TOPUP', from: 'YYYY-MM-DD'|'', to: '...', q: '' }
export function filterTransactions(transactions, filters) {
  const { type = 'ALL', from = '', to = '', q = '' } = filters || {}
  const fromTs = from ? new Date(from + 'T00:00:00').getTime() : null
  const toTs = to ? new Date(to + 'T23:59:59').getTime() : null
  const needle = q.trim().toLowerCase()
  return transactions.filter((t) => {
    if (type !== 'ALL' && t.type !== type) return false
    if (fromTs !== null && t.ts < fromTs) return false
    if (toTs !== null && t.ts > toTs) return false
    if (needle) {
      const hay = (t.counterparty + ' ' + (t.description || '') + ' ' + t.code).toLowerCase()
      if (!hay.includes(needle)) return false
    }
    return true
  })
}

// ---- CSV export (Export riwayat) ----
export function toCSV(transactions) {
  const header = ['Kode', 'Tanggal', 'Waktu', 'Tipe', 'Lawan Transaksi', 'Nominal', 'Saldo Setelah', 'Catatan']
  const rows = transactions.map((t) => [
    t.code,
    t.dateStr,
    t.timeStr,
    t.type,
    t.counterparty,
    t.amount,
    t.balanceAfter,
    (t.description || '').replace(/"/g, '""'),
  ])
  const esc = (v) => {
    const s = String(v)
    return /[",\n]/.test(s) ? `"${s}"` : s
  }
  return [header, ...rows].map((r) => r.map(esc).join(',')).join('\n')
}

export function downloadCSV(transactions, filename = 'mutasi-trustpay.csv') {
  const blob = new Blob(['﻿' + toCSV(transactions)], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
