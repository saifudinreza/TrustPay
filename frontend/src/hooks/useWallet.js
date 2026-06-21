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
    balanceAfter: Number(t.balance_after),
    description: t.description || '',
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
      setBalance(Number(res.wallet.balance))
      setLastUpdate(fmtTime(now))
      setTransactions((prev) => [normalizeTx(res.transaction), ...prev])
      return res.transaction
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
