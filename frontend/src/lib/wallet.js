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

export const SELF = ['saya', '@saya']

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



// ---- row meta (warna & label untuk tiap baris riwayat) ----

/**
 * Hitung warna aksen, label tipe, dan teks nominal untuk satu baris transaksi.
 * Dipakai oleh LedgerRow (Dashboard) dan ReceiptModal.
 */
export function rowMeta(t) {
  const masuk = t.amount > 0
  const isPending = t.status === 'PENDING'
  const isFailed = t.status === 'FAILED'

  // Warna rail kiri (tema Black + Gold): gold = topup/masuk, amber = keluar
  let accent = t.type === 'TOPUP' ? '#F5CE53' : masuk ? '#F5CE53' : '#C9952B'
  if (isPending) {
    accent = '#9C90B4'
  } else if (isFailed) {
    accent = '#C9952B'
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
