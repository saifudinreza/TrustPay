// lib/wallet.js — utilitas bersama untuk format, validasi, filter, dan export.
// Fungsi-fungsi di sini murni (pure) dan tidak bergantung pada state React,
// sehingga bisa diuji dan dipakai di mana saja (hooks, komponen, lib lain).

// Batas nominal transaksi per kali (mirror dari config backend wallet.max_transaction_amount)
export const MAX_TX = 10000000
// Jumlah baris per halaman di tabel riwayat
export const PER = 5

// Singkatan bulan dalam Bahasa Indonesia untuk format tanggal
export const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
]

// Direktori kontak simulasi — dipakai oleh recipientStatus() di TransferModal.
// Dalam produksi, pencarian penerima dilakukan di backend via email/username/HP.
export const DIRECTORY = {
  budi: 'Budi S.',
  siti: 'Siti A.',
  reza: 'Saifudin R.',
  dewi: 'Dewi K.',
  rina: 'Rina W.',
}

// Username yang dianggap "diri sendiri" — untuk validasi transfer ke diri sendiri
export const SELF = ['aldi', '@aldi', 'saya', '@saya']

// Data user demo statis (dipakai oleh ReceiveQRModal sebagai fallback sebelum API load)
export const ME = {
  name: 'Aldi P.',
  username: '@aldi',
  account: '8021 4455 4021',
  phone: '0812-3344-4021',
}

// ---- format angka & tanggal ----

/** Pisahkan ribuan dengan titik: 1500000 → "1.500.000" */
export const group = (n) =>
  Math.abs(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')

/** Format Rupiah: 1500000 → "Rp 1.500.000" */
export const fmtRp = (n) => 'Rp ' + group(n)

/** Format waktu HH:MM dari objek Date */
export const fmtTime = (d) =>
  String(d.getHours()).padStart(2, '0') +
  ':' +
  String(d.getMinutes()).padStart(2, '0')

/** Format tanggal "21 Jun 2026" dari objek Date */
export const fmtDate = (d) =>
  d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear()

/**
 * Generate kode transaksi unik, format TRX-YYYYMMDD-XXXX.
 * Dipakai di sisi frontend untuk data lokal/simulasi; backend punya generateCode() sendiri.
 */
export function genCode(ts = Date.now()) {
  const d = new Date(ts)
  const ymd =
    d.getFullYear().toString() +
    String(d.getMonth() + 1).padStart(2, '0') +
    String(d.getDate()).padStart(2, '0')
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `TRX-${ymd}-${rand}`
}

/**
 * Buat objek transaksi ternormalisasi (dipakai untuk data seed/simulasi lokal).
 * Transaksi nyata dari API sudah diformat oleh normalizeTx() di useWallet.js.
 */
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

// ---- validasi nominal (sisi klien, mirror aturan backend) ----

/**
 * Validasi input nominal dari user. Mengembalikan { err } jika invalid,
 * atau { n } (angka integer) jika valid.
 * Pesan error sengaja identik dengan pesan backend (lihat TopUpRequest.php).
 */
export function validateNominal(raw) {
  const v = (raw || '').trim()
  if (v === '') return { err: 'Nominal tidak boleh kosong.' }
  if (/^-/.test(v)) return { err: 'Nominal tidak boleh negatif.' }
  const noThousand = v.replace(/[.\s]/g, '') // hapus pemisah ribuan yang mungkin diketik user
  if (/,/.test(noThousand)) return { err: 'Nominal harus berupa bilangan bulat.' }
  if (!/^[0-9]+$/.test(noThousand)) return { err: 'Nominal harus berupa angka.' }
  const n = parseInt(noThousand, 10)
  if (n <= 0) return { err: 'Nominal tidak boleh negatif.' }
  if (n > MAX_TX) return { err: 'Nominal melebihi batas maksimum transaksi.' }
  return { n }
}

/**
 * Cek status penerima transfer di direktori lokal (simulasi).
 * Untuk transfer nyata, validasi penerima ada di backend (WalletService.transfer).
 */
export function recipientStatus(raw) {
  const v = (raw || '').trim().toLowerCase().replace(/^@/, '')
  if (v === '') return { status: 'empty' }
  if (SELF.includes(v) || SELF.includes('@' + v)) return { status: 'self' }
  const name = DIRECTORY[v]
  if (name) return { status: 'found', name }
  return { status: 'notfound' }
}

// ---- data seed (tampilan awal sebelum ada transaksi nyata) ----

/** Helper untuk timestamp seed yang presisi */
function seedTs(y, mo, d, h, mi) {
  return new Date(y, mo, d, h, mi).getTime()
}

/** Transaksi contoh yang ditampilkan di Dashboard saat riwayat masih kosong */
export const SEED_TRANSACTIONS = [
  makeTransaction({ type: 'MASUK', amount: 500000, counterparty: 'dari Budi S.', balanceAfter: 2450000, ts: seedTs(2026, 5, 21, 9, 12), description: 'Transfer masuk' }),
  makeTransaction({ type: 'KELUAR', amount: 150000, counterparty: 'ke Siti A.', balanceAfter: 1950000, ts: seedTs(2026, 5, 20, 14, 30), description: 'bayar makan siang' }),
  makeTransaction({ type: 'TOPUP', amount: 1000000, counterparty: '—', balanceAfter: 2100000, ts: seedTs(2026, 5, 18, 8, 0), description: 'Top up saldo' }),
  makeTransaction({ type: 'KELUAR', amount: 75000, counterparty: 'ke Reza P.', balanceAfter: 1100000, ts: seedTs(2026, 5, 15, 19, 45), description: 'patungan' }),
  makeTransaction({ type: 'MASUK', amount: 300000, counterparty: 'dari Dewi K.', balanceAfter: 1175000, ts: seedTs(2026, 5, 12, 10, 20), description: 'Transfer masuk' }),
  makeTransaction({ type: 'TOPUP', amount: 500000, counterparty: '—', balanceAfter: 875000, ts: seedTs(2026, 5, 10, 16, 5), description: 'Top up saldo' }),
]

export const SEED_BALANCE = 2450000

// ---- row meta (warna & label untuk tiap baris riwayat) ----

/**
 * Hitung warna aksen, label tipe, dan teks nominal untuk satu baris transaksi.
 * Dipakai oleh LedgerRow (Dashboard) dan ReceiptModal.
 */
export function rowMeta(t) {
  const masuk = t.amount > 0
  const isPending = t.status === 'PENDING'
  const isFailed = t.status === 'FAILED'

  // Warna rail kiri: emas = topup, hijau = masuk, merah = keluar; abu = pending
  let accent = t.type === 'TOPUP' ? '#BEF264' : masuk ? '#2F6F4E' : '#7A3142'
  if (isPending) {
    accent = '#7B8890'
  } else if (isFailed) {
    accent = '#7A3142'
  }

  let typeLabel = t.type === 'TOPUP' ? 'Top Up' : masuk ? 'Masuk' : 'Keluar'
  if (isPending) {
    typeLabel = 'Top Up (Pending)'
  } else if (isFailed) {
    typeLabel = 'Top Up (Gagal)'
  }

  const sign = masuk ? '+' : '−'
  return {
    accent,
    typeLabel,
    counterparty: t.counterparty || '—',
    amountStr: sign + ' ' + fmtRp(t.amount),
    // Saldo setelah tidak ditampilkan jika transaksi masih PENDING atau FAILED
    balanceAfterStr: isPending ? '—' : isFailed ? '—' : fmtRp(t.balanceAfter),
  }
}

// ---- ringkasan bulanan ----

/**
 * Hitung total masuk, keluar, dan selisih bersih untuk bulan `ref` (default bulan ini).
 * Dipakai oleh komponen MonthlySummary.
 */
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

// ---- filter & pencarian riwayat ----

/**
 * Filter daftar transaksi berdasarkan tipe, rentang tanggal, dan kata kunci.
 * `filters` = { type: 'ALL'|'MASUK'|'KELUAR'|'TOPUP', from: 'YYYY-MM-DD', to: '...', q: '' }
 */
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
      // Cari di counterparty + catatan + kode transaksi
      const hay = (t.counterparty + ' ' + (t.description || '') + ' ' + t.code).toLowerCase()
      if (!hay.includes(needle)) return false
    }
    return true
  })
}

// ---- export CSV ----

/** Ubah array transaksi menjadi string CSV (UTF-8 dengan BOM agar Excel terbaca). */
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
    (t.description || '').replace(/"/g, '""'), // escape kutip ganda dalam CSV
  ])
  const esc = (v) => {
    const s = String(v)
    return /[",\n]/.test(s) ? `"${s}"` : s
  }
  return [header, ...rows].map((r) => r.map(esc).join(',')).join('\n')
}

/** Trigger download file CSV ke browser user. */
export function downloadCSV(transactions, filename = 'mutasi-trustpay.csv') {
  // BOM (﻿) di awal memastikan Excel Windows membaca UTF-8 dengan benar
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
