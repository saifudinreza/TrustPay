import { useCallback, useEffect, useState } from 'react'
import { apiGet, apiPost } from '../lib/api.js'
import { clearSession } from '../lib/auth.js'
import { fmtDate, fmtTime } from '../lib/wallet.js'

/**
 * Normalisasi satu baris transaksi dari format backend (TRANSFER_IN/OUT/TOPUP)
 * ke format yang dipakai komponen frontend (MASUK/KELUAR/TOPUP + tanda +/-).
 *
 * Catatan: `amount` selalu positif dari backend; tanda diturunkan dari tipe.
 */
function normalizeTx(t) {
  const d = new Date(t.created_at)
  const typeMap = { TRANSFER_IN: 'MASUK', TRANSFER_OUT: 'KELUAR', TOPUP: 'TOPUP' }
  const type = typeMap[t.type] || t.type
  // Nominal: negatif untuk KELUAR, positif untuk MASUK dan TOPUP
  const amount = type === 'KELUAR' ? -Math.abs(Number(t.amount)) : Math.abs(Number(t.amount))
  const cu = t.counterpart_user
  // Label lawan transaksi: "dari Budi" untuk masuk, "ke Siti" untuk keluar
  const counterparty = cu
    ? type === 'MASUK' ? `dari ${cu.name}` : `ke ${cu.name}`
    : '—'
  return {
    id: t.id,
    code: t.code,
    ts: d.getTime(),          // timestamp ms untuk filter & sort
    dateStr: fmtDate(d),
    timeStr: fmtTime(d),
    type,
    counterparty,
    amount,
    balanceAfter: t.balance_after ? Number(t.balance_after) : null,
    description: t.description || '',
    status: t.status || 'SUCCESS', // PENDING | SUCCESS | FAILED (untuk TOPUP Midtrans)
  }
}

/**
 * useWallet — hook yang mengelola saldo dan riwayat transaksi dari API.
 *
 * State:
 *  - hydrated    → true setelah fetch awal selesai (untuk skeleton loading)
 *  - balance     → saldo saat ini (angka, bukan string)
 *  - transactions→ array transaksi ternormalisasi, terbaru dulu
 *  - lastUpdate  → waktu terakhir saldo diperbarui (hanya untuk tampilan)
 *
 * Mutasi (applyTransaction) mendukung TOPUP via Midtrans Snap dan TRANSFER real.
 * Pembayaran tagihan (Pulsa/PLN/dll) adalah simulasi UI saja — tidak menyentuh API.
 */
export default function useWallet() {
  const [hydrated, setHydrated] = useState(false)
  const [balance, setBalance] = useState(0)
  const [transactions, setTransactions] = useState([])
  const [lastUpdate, setLastUpdate] = useState('—')

  /** Jika API balas 401, bersihkan sesi dan redirect ke halaman login */
  const redirect401 = useCallback(() => {
    clearSession()
    window.location.href = '/masuk'
  }, [])

  /**
   * Fetch awal: ambil saldo + riwayat secara paralel saat mount.
   * Gagal 401 → redirect login; gagal lain → biarkan (hydrated tetap jadi true).
   */
  useEffect(() => {
    Promise.all([apiGet('/wallet'), apiGet('/transactions')])
      .then(([walletRes, txRes]) => {
        setBalance(Number(walletRes.balance))
        setTransactions((txRes.data ?? txRes).map(normalizeTx))
        setLastUpdate(fmtTime(new Date()))
      })
      .catch((e) => { if (e?.status === 401) redirect401() })
      .finally(() => setHydrated(true))
  }, [redirect401])

  /**
   * applyTransaction — eksekusi mutasi saldo.
   *
   * Kasus TOPUP:
   *  1. POST /topup → dapat snap_token + transaksi PENDING
   *  2. Buka Midtrans Snap popup
   *  3. Pada setiap callback Snap (sukses/pending/error/tutup) →
   *     POST /topup/confirm untuk sinkronkan status dari Midtrans API
   *
   * Kasus TRANSFER (KELUAR + recipient):
   *  - POST /transfer → saldo pengirim langsung diupdate oleh backend
   *
   * Kasus SIMULASI (tagihan Pulsa/PLN/Air/Internet):
   *  - Tidak menyentuh API; kembalikan objek dummy dengan flag `simulated: true`.
   *    Saldo dan riwayat TIDAK diubah agar tidak desync dengan server.
   */
  const applyTransaction = useCallback(async ({ type, amount, recipient, description = '', pin }) => {
    const now = new Date()

    if (type === 'TOPUP') {
      const res = await apiPost('/topup', { amount })

      // Direct topup (tanpa Midtrans) — langsung tambah saldo
      if (res.direct) {
        setBalance(Number(res.wallet.balance))
        setLastUpdate(fmtTime(new Date()))
        setTransactions((prev) => [normalizeTx(res.transaction), ...prev])
        return res.transaction
      }

      // Midtrans topup — butuh Snap popup
      const snapToken = res.snap_token
      const txCode = res.transaction.code

      return new Promise((resolve, reject) => {
        if (!window.snap) {
          reject(new Error('Midtrans Snap SDK tidak termuat.'))
          return
        }

        setTransactions((prev) => [normalizeTx(res.transaction), ...prev])

        window.snap.pay(snapToken, {
          onSuccess: async function () {
            try {
              const confirmRes = await apiPost('/topup/confirm', { code: txCode })
              setBalance(Number(confirmRes.wallet.balance))
              setLastUpdate(fmtTime(new Date()))
              setTransactions((prev) => {
                const filtered = prev.filter((tx) => tx.code !== txCode)
                return [normalizeTx(confirmRes.transaction), ...filtered]
              })
              resolve(confirmRes.transaction)
            } catch (e) { reject(e) }
          },
          onPending: async function () {
            try {
              const confirmRes = await apiPost('/topup/confirm', { code: txCode })
              setBalance(Number(confirmRes.wallet.balance))
              setLastUpdate(fmtTime(new Date()))
              setTransactions((prev) => {
                const filtered = prev.filter((tx) => tx.code !== txCode)
                return [normalizeTx(confirmRes.transaction), ...filtered]
              })
              resolve(confirmRes.transaction)
            } catch (e) { reject(e) }
          },
          onError: async function () {
            try {
              const confirmRes = await apiPost('/topup/confirm', { code: txCode })
              setTransactions((prev) => {
                const filtered = prev.filter((tx) => tx.code !== txCode)
                return [normalizeTx(confirmRes.transaction), ...filtered]
              })
              reject(new Error('Pembayaran gagal.'))
            } catch (e) { reject(e) }
          },
          onClose: async function () {
            try {
              const confirmRes = await apiPost('/topup/confirm', { code: txCode })
              setBalance(Number(confirmRes.wallet.balance))
              setLastUpdate(fmtTime(new Date()))
              setTransactions((prev) => {
                const filtered = prev.filter((tx) => tx.code !== txCode)
                return [normalizeTx(confirmRes.transaction), ...filtered]
              })
              resolve(confirmRes.transaction)
            } catch (e) {
              resolve(res.transaction)
            }
          },
        })
      })
    }

    // Transfer ke user lain — POST /transfer (butuh PIN), saldo diupdate atomik di backend
    if (type === 'KELUAR' && recipient) {
      const res = await apiPost('/transfer', { recipient, amount, description, pin })
      setBalance(Number(res.wallet.balance))
      setLastUpdate(fmtTime(now))
      setTransactions((prev) => [normalizeTx(res.transaction), ...prev])
      return res.transaction
    }

    // Pembayaran tagihan (Pulsa/PLN/Air/Internet) — POST /pay (butuh PIN), potong saldo di backend
    if (type === 'KELUAR') {
      const res = await apiPost('/pay', { amount, description, pin })
      setBalance(Number(res.wallet.balance))
      setLastUpdate(fmtTime(now))
      setTransactions((prev) => [normalizeTx(res.transaction), ...prev])
      return res.transaction
    }
  }, [balance])

  return { hydrated, balance, transactions, lastUpdate, applyTransaction }
}
