import { useCallback, useEffect, useState } from 'react'
import { apiGet, apiPost } from '../lib/api.js'
import { clearSession } from '../lib/auth.js'
import { fmtDate, fmtTime } from '../lib/wallet.js'

// Map backend types to the display types rowMeta() / frontend expect.
function normalizeTx(t) {
  const d = new Date(t.created_at)
  const typeMap = { TRANSFER_IN: 'MASUK', TRANSFER_OUT: 'KELUAR', TOPUP: 'TOPUP' }
  const type = typeMap[t.type] || t.type
  const amount = type === 'KELUAR' ? -Math.abs(Number(t.amount)) : Math.abs(Number(t.amount))
  const cu = t.counterpart_user
  const counterparty = cu
    ? type === 'MASUK' ? `dari ${cu.name}` : `ke ${cu.name}`
    : '—'
  return {
    id: t.id,
    code: t.code,
    ts: d.getTime(),
    dateStr: fmtDate(d),
    timeStr: fmtTime(d),
    type,
    counterparty,
    amount,
    balanceAfter: t.balance_after ? Number(t.balance_after) : null,
    description: t.description || '',
    status: t.status || 'SUCCESS',
  }
}

export default function useWallet() {
  const [hydrated, setHydrated] = useState(false)
  const [balance, setBalance] = useState(0)
  const [transactions, setTransactions] = useState([])
  const [lastUpdate, setLastUpdate] = useState('—')

  const redirect401 = useCallback(() => {
    clearSession()
    window.location.href = '/masuk'
  }, [])

  // Initial load: fetch wallet + transaction list from API.
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

  // Handles TOPUP (→ POST /api/topup) and real transfers (→ POST /api/transfer).
  // Bill payment quick-actions are NOT wired to the API (they update state locally
  // but do not persist — balance corrects itself on next page load from the API).
  const applyTransaction = useCallback(async ({ type, amount, recipient, description = '' }) => {
    const now = new Date()

    if (type === 'TOPUP') {
      const res = await apiPost('/topup', { amount })
      const snapToken = res.snap_token
      const txCode = res.transaction.code

      return new Promise((resolve, reject) => {
        if (!window.snap) {
          reject(new Error('Midtrans Snap SDK tidak termuat.'))
          return
        }

        // Instantly add the pending transaction to the list so user can see it in dashboard
        setTransactions((prev) => [normalizeTx(res.transaction), ...prev])

        window.snap.pay(snapToken, {
          onSuccess: async function (result) {
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
              reject(e)
            }
          },
          onPending: async function (result) {
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
              reject(e)
            }
          },
          onError: async function (result) {
            try {
              const confirmRes = await apiPost('/topup/confirm', { code: txCode })
              setTransactions((prev) => {
                const filtered = prev.filter((tx) => tx.code !== txCode)
                return [normalizeTx(confirmRes.transaction), ...filtered]
              })
              reject(new Error('Pembayaran gagal.'))
            } catch (e) {
              reject(e)
            }
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
          }
        })
      })
    }

    if (type === 'KELUAR' && recipient) {
      const res = await apiPost('/transfer', { recipient, amount, description })
      setBalance(Number(res.wallet.balance))
      setLastUpdate(fmtTime(now))
      setTransactions((prev) => [normalizeTx(res.transaction), ...prev])
      return res.transaction
    }

    // Pembayaran tagihan (Pulsa/PLN/Air/Internet) = SIMULASI UI saja, belum ada
    // endpoint backend-nya. Sengaja TIDAK mengubah saldo/riwayat agar tidak desync
    // dengan server (dulu sempat menyuntik baris palsu yang hilang saat reload).
    return { id: 'sim-' + now.getTime(), code: 'SIMULASI', simulated: true }
  }, [balance])

  return { hydrated, balance, transactions, lastUpdate, applyTransaction }
}
