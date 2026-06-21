import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Logo from '../components/Logo.jsx'
import TopUpModal from '../components/TopUpModal.jsx'
import TransferModal from '../components/TransferModal.jsx'
import PayModal from '../components/PayModal.jsx'
import ReceiptModal from '../components/ReceiptModal.jsx'
import ReceiveQRModal from '../components/ReceiveQRModal.jsx'
import QuickActions from '../components/QuickActions.jsx'
import MonthlySummary from '../components/MonthlySummary.jsx'
import HistoryFilter from '../components/HistoryFilter.jsx'
import useWallet from '../hooks/useWallet.js'
import useAuth from '../hooks/useAuth.js'
import {
  PlusIcon,
  TransferIcon,
  CheckIcon,
  DownloadIcon,
  PrinterIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  EyeOffIcon,
  LogoutIcon,
} from '../components/icons.jsx'
import {
  PER,
  MONTHS,
  fmtRp,
  rowMeta,
  monthlySummary,
  filterTransactions,
  downloadCSV,
} from '../lib/wallet.js'

const EMPTY_FILTERS = { type: 'ALL', from: '', to: '', q: '' }

// Print a target region by toggling a body class consumed by the print stylesheet.
function printRegion(cls) {
  document.body.classList.add(cls)
  const cleanup = () => {
    document.body.classList.remove(cls)
    window.removeEventListener('afterprint', cleanup)
  }
  window.addEventListener('afterprint', cleanup)
  window.print()
}

// Dashboard — wallet card, quick actions, monthly summary, filterable/searchable
// ledger history, receipt detail, QR receive, CSV/PDF export. State persists to
// localStorage via useWallet (saldo & riwayat survive reload).
export default function Dashboard() {
  const { hydrated, balance, transactions, lastUpdate, applyTransaction } = useWallet()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [modal, setModal] = useState(null) // 'topup' | 'transfer' | 'qr' | null
  const [payService, setPayService] = useState(null)
  const [receipt, setReceipt] = useState(null)
  const [showStamp, setShowStamp] = useState(false)
  const [showBalance, setShowBalance] = useState(true)
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [apiError, setApiError] = useState(null)
  const stampTimer = useRef(null)

  const displayName = user?.name || 'Pengguna'
  const initial = displayName.trim().charAt(0).toUpperCase() || 'U'

  const onLogout = () => {
    logout()
    navigate('/')
  }

  // initial fetch → skeleton (waits for hydration too)
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1000)
    return () => {
      clearTimeout(t)
      clearTimeout(stampTimer.current)
    }
  }, [])

  const fireStamp = () => {
    setShowStamp(true)
    clearTimeout(stampTimer.current)
    stampTimer.current = setTimeout(() => setShowStamp(false), 1600)
  }

  const afterMutation = () => {
    setPage(0)
    setModal(null)
    setPayService(null)
    fireStamp()
  }

  const onTopupConfirm = async (n) => {
    setApiError(null)
    try {
      await applyTransaction({ type: 'TOPUP', amount: n })
      afterMutation()
    } catch (e) {
      setApiError(e?.data?.message || 'Top up gagal. Silakan coba lagi.')
      setModal(null)
    }
  }
  const onTransferConfirm = async (n, _displayName, note, recipientInput) => {
    setApiError(null)
    try {
      await applyTransaction({ type: 'KELUAR', amount: n, recipient: recipientInput, description: note || 'Transfer' })
      afterMutation()
    } catch (e) {
      setApiError(e?.data?.message || 'Transfer gagal. Silakan coba lagi.')
      setModal(null)
    }
  }
  const onPayConfirm = async ({ amount, counterparty, description }) => {
    await applyTransaction({ type: 'KELUAR', amount, counterparty, description })
    afterMutation()
  }

  const onPickQuickAction = (service) => {
    if (service.key === 'qr') setModal('qr')
    else setPayService(service)
  }

  // ---- derived: filtering, summary, pagination ----
  const filtersActive = filters.type !== 'ALL' || filters.from || filters.to || filters.q.trim() !== ''
  const filtered = useMemo(() => filterTransactions(transactions, filters), [transactions, filters])
  const summary = useMemo(() => monthlySummary(transactions), [transactions])

  const pages = Math.max(1, Math.ceil(filtered.length / PER))
  const curPage = Math.min(page, pages - 1)
  const pageRows = filtered.slice(curPage * PER, curPage * PER + PER)

  // reset to first page whenever the filter result set changes shape
  useEffect(() => { setPage(0) }, [filters])

  const initialLoading = loading || !hydrated
  const showPager = !initialLoading && pages > 1
  const showEmpty = !initialLoading && filtered.length === 0
  const showRows = !initialLoading && filtered.length > 0

  return (
    <div
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(900px 480px at 92% -10%, rgba(201,138,43,0.09), transparent 60%), radial-gradient(700px 560px at -6% 12%, rgba(17,32,61,0.05), transparent 55%), #EFF1EC',
      }}
    >
      {/* ===== NAV ===== */}
      <nav className="no-print" style={{ borderBottom: '1px solid rgba(17,32,61,0.08)', background: 'rgba(239,241,236,0.7)', backdropFilter: 'blur(8px)', position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', padding: '16px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Logo size={38} textSize={19} />
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ textAlign: 'right', lineHeight: 1.2 }}>
              <div style={{ fontSize: 13, color: '#5C6B73' }}>Halo,</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#11203D' }}>{displayName}</div>
            </div>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(150deg,#1c3057,#11203D)', color: '#EFF1EC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 16 }}>{initial}</div>
            <button onClick={onLogout} className="icon-btn" aria-label="Keluar" title="Keluar" style={{ width: 38, height: 38, borderRadius: 10, border: '1.5px solid rgba(17,32,61,0.14)', background: 'transparent', color: '#5C6B73', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LogoutIcon size={18} />
            </button>
          </div>
        </div>
      </nav>

      {/* ===== API ERROR BANNER ===== */}
      {apiError && (
        <div className="no-print" style={{ background: 'rgba(122,49,66,0.09)', borderBottom: '1px solid rgba(122,49,66,0.2)', padding: '12px 28px', display: 'flex', alignItems: 'center', gap: 10, color: '#7A3142', fontSize: 14, fontWeight: 500 }}>
          <AlertIcon size={18} />
          <span style={{ flex: 1 }}>{apiError}</span>
          <button onClick={() => setApiError(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#7A3142', fontSize: 18, lineHeight: 1, padding: 4 }}>✕</button>
        </div>
      )}

      {/* ===== MAIN ===== */}
      <div data-grid className="dash-grid" style={{ maxWidth: 1120, margin: '0 auto', padding: '32px 28px 70px', display: 'grid', gridTemplateColumns: '380px 1fr', gap: 28, alignItems: 'start' }}>
        {/* LEFT: wallet card + actions + quick actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ position: 'relative' }}>
            <WalletCard balance={balance} lastUpdate={lastUpdate} user={user} show={showBalance} onToggle={() => setShowBalance((s) => !s)} />
            {showStamp && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                <div data-stamp style={{ width: 128, height: 128, border: '3px solid #C98A2B', borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(239,241,236,0.92)', boxShadow: '0 18px 40px -14px rgba(201,138,43,0.6)', animation: 'stampIn .5s cubic-bezier(.2,.8,.3,1) both' }}>
                  <span style={{ color: '#C98A2B', display: 'flex' }}><CheckIcon size={32} strokeWidth={2.6} /></span>
                  <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 13, letterSpacing: '0.18em', color: '#C98A2B', textTransform: 'uppercase', marginTop: 5 }}>Berhasil</span>
                </div>
              </div>
            )}
          </div>

          {/* action buttons */}
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => setModal('topup')} className="act-btn" style={{ flex: 1, cursor: 'pointer', border: 'none', padding: '14px 0', borderRadius: 10, background: '#C98A2B', color: '#1a1205', fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 15, fontWeight: 700, letterSpacing: '0.01em', boxShadow: '0 10px 22px -10px rgba(201,138,43,0.7)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><PlusIcon size={18} strokeWidth={2.2} /> Top Up</button>
            <button onClick={() => setModal('transfer')} className="act-btn" style={{ flex: 1, cursor: 'pointer', padding: '14px 0', borderRadius: 10, background: 'transparent', border: '1.5px solid #11203D', color: '#11203D', fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 15, fontWeight: 600, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><TransferIcon size={18} /> Transfer</button>
          </div>

          <QuickActions onPick={onPickQuickAction} />

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '14px 16px', borderRadius: 12, background: 'rgba(17,32,61,0.04)', border: '1px solid rgba(17,32,61,0.07)' }}>
            <span style={{ color: '#C98A2B', display: 'flex', marginTop: 1 }}><CheckIcon size={15} strokeWidth={2.2} /></span>
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: '#5C6B73' }}>Setiap transaksi tercatat permanen per baris & tersimpan di perangkat ini — bisa difilter, diekspor, dan diaudit.</p>
          </div>
        </div>

        {/* RIGHT: summary + history */}
        <div>
          <MonthlySummary summary={summary} />

          <div style={{ background: '#fff', borderRadius: 18, border: '1px solid rgba(17,32,61,0.06)', boxShadow: '0 18px 40px -28px rgba(17,32,61,0.4)', overflow: 'hidden' }}>
            <div style={{ padding: '22px 24px 16px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', borderBottom: '1px solid #eceee8', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 500, fontSize: 20, margin: 0, color: '#11203D' }}>Riwayat Transaksi</h2>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: '#5C6B73' }}>Halaman buku tabungan — per baris, audit-ready</p>
              </div>
              <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button onClick={() => downloadCSV(filtered)} disabled={filtered.length === 0} style={{ ...exportBtn, opacity: filtered.length === 0 ? 0.5 : 1, cursor: filtered.length === 0 ? 'not-allowed' : 'pointer' }}><DownloadIcon size={15} /> CSV</button>
                <button onClick={() => printRegion('printing-ledger')} disabled={filtered.length === 0} style={{ ...exportBtn, opacity: filtered.length === 0 ? 0.5 : 1, cursor: filtered.length === 0 ? 'not-allowed' : 'pointer' }}><PrinterIcon size={15} /> PDF</button>
              </div>
            </div>

            {!initialLoading && <HistoryFilter filters={filters} setFilters={setFilters} active={!!filtersActive} />}

            {initialLoading && <Skeleton />}

            {showEmpty && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '30px 24px', position: 'relative' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: 'rgba(92,107,115,0.25)' }} />
                <div style={{ flex: 1, color: '#5C6B73', fontSize: 15 }}>
                  {filtersActive ? 'Tidak ada transaksi yang cocok dengan filter.' : 'Belum ada catatan — mulai dengan Top Up pertamamu.'}
                </div>
                {!filtersActive && (
                  <button onClick={() => setModal('topup')} style={{ cursor: 'pointer', border: '1.5px solid #C98A2B', background: 'transparent', color: '#C98A2B', padding: '9px 16px', borderRadius: 10, fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 14, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 7 }}><PlusIcon size={16} strokeWidth={2.2} /> Top Up</button>
                )}
              </div>
            )}

            {showRows && (
              <div>
                {pageRows.map((t) => <LedgerRow key={t.id} tx={t} onClick={() => setReceipt(t)} />)}
              </div>
            )}

            {showPager && (
              <div className="no-print" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px' }}>
                <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={curPage <= 0} style={{ ...pagerBtn, opacity: curPage <= 0 ? 0.4 : 1, cursor: curPage <= 0 ? 'not-allowed' : 'pointer' }}><ChevronLeftIcon size={15} /> Sebelumnya</button>
                <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 12, letterSpacing: '0.06em', color: '#5C6B73' }}>Halaman {curPage + 1} / {pages}</span>
                <button onClick={() => setPage((p) => p + 1)} disabled={curPage >= pages - 1} style={{ ...pagerBtn, opacity: curPage >= pages - 1 ? 0.4 : 1, cursor: curPage >= pages - 1 ? 'not-allowed' : 'pointer' }}>Selanjutnya <ChevronRightIcon size={15} /></button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===== modals ===== */}
      {modal === 'topup' && <TopUpModal onClose={() => setModal(null)} onConfirm={onTopupConfirm} />}
      {modal === 'transfer' && <TransferModal balance={balance} onClose={() => setModal(null)} onConfirm={onTransferConfirm} />}
      {modal === 'qr' && <ReceiveQRModal user={user} onClose={() => setModal(null)} />}
      {payService && <PayModal service={payService} balance={balance} onClose={() => setPayService(null)} onConfirm={onPayConfirm} />}
      {receipt && <ReceiptModal tx={receipt} onClose={() => setReceipt(null)} />}

      {/* ===== print-only mutasi (PDF export) ===== */}
      <PrintableLedger transactions={filtered} balance={balance} summary={summary} user={user} />
    </div>
  )
}

function WalletCard({ balance, lastUpdate, user, show, onToggle }) {
  const holder = (user?.name || 'Pengguna').toUpperCase()
  const account = user?.account || '8021 4455 4021'
  const tail = account.replace(/\s/g, '').slice(-4)
  const masked = `•••• •••• •••• ${tail}`
  const since = user?.createdAt ? new Date(user.createdAt) : null
  const sinceStr = since ? `${MONTHS[since.getMonth()]} '${String(since.getFullYear()).slice(2)}` : "JUN '26"

  return (
    <div className="wallet-card" style={{ position: 'relative', borderRadius: 22, padding: '22px 24px', color: '#EFF1EC', overflow: 'hidden', background: 'linear-gradient(150deg,#26416f 0%,#16284a 52%,#0b1428 100%)', boxShadow: '0 26px 50px -18px rgba(17,32,61,0.6)', transition: 'transform .25s ease, box-shadow .25s ease' }}>
      {/* decorative layers */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(220px 120px at 86% -8%, rgba(201,138,43,0.28), transparent 65%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', right: -40, bottom: -46, width: 170, height: 170, border: '1.5px solid rgba(201,138,43,0.18)', borderRadius: '50%' }} />
      <div style={{ position: 'absolute', right: -10, bottom: -16, width: 110, height: 110, border: '1.5px solid rgba(201,138,43,0.12)', borderRadius: '50%' }} />
      <div className="wallet-sheen" style={{ position: 'absolute', top: 0, left: 0, width: '60%', height: '100%', background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.10) 50%, transparent 70%)', pointerEvents: 'none' }} />

      {/* top row: brand + passbook label + contactless */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#C98A2B' }} />
            <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 15 }}>TrustPay</span>
          </div>
          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9.5, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(201,138,43,0.85)', marginTop: 5 }}>Buku Tabungan Digital</div>
        </div>
        <div style={{ width: 18, height: 22, overflow: 'hidden', position: 'relative', opacity: 0.5 }}>
          <div style={{ position: 'absolute', left: -9, top: 4, width: 13, height: 13, border: '1.5px solid #EFF1EC', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', left: -13, top: 0, width: 21, height: 21, border: '1.5px solid #EFF1EC', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', left: -17, top: -4, width: 29, height: 29, border: '1.5px solid #EFF1EC', borderRadius: '50%' }} />
        </div>
      </div>

      {/* balance */}
      <div style={{ marginTop: 20, position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(239,241,236,0.55)' }}>Saldo Anda</span>
          <button onClick={onToggle} aria-label={show ? 'Sembunyikan saldo' : 'Tampilkan saldo'} title={show ? 'Sembunyikan saldo' : 'Tampilkan saldo'} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, borderRadius: 8, border: '1px solid rgba(239,241,236,0.2)', background: 'rgba(239,241,236,0.06)', color: 'rgba(239,241,236,0.8)', cursor: 'pointer' }}>
            {show ? <EyeIcon size={15} /> : <EyeOffIcon size={15} />}
          </button>
        </div>
        <div key={balance} data-balance style={{ fontFamily: "'IBM Plex Mono',monospace", fontWeight: 500, fontSize: 38, letterSpacing: '-0.01em', fontFeatureSettings: "'tnum'", animation: 'balanceFade .25s ease-out', marginTop: 6, minHeight: 46 }}>
          {show ? fmtRp(balance) : 'Rp ••••••••'}
        </div>
        <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(239,241,236,0.45)', marginTop: 4 }}>terakhir update {lastUpdate}</div>
      </div>

      {/* chip + account number */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 22, position: 'relative' }}>
        <div style={{ width: 42, height: 31, borderRadius: 7, background: 'linear-gradient(150deg,#F4D89B,#C98A2B)', display: 'grid', placeItems: 'center', flex: 'none', boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.4)' }}>
          <div style={{ width: 26, height: 17, border: '1px solid rgba(17,32,61,0.4)', borderRadius: 3 }} />
        </div>
        <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 16, letterSpacing: '0.12em', color: 'rgba(239,241,236,0.9)', fontFeatureSettings: "'tnum'" }}>{masked}</span>
      </div>

      {/* holder + member since */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 16, position: 'relative' }}>
        <div>
          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(239,241,236,0.4)' }}>Pemilik</div>
          <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 14, fontWeight: 500, letterSpacing: '0.04em', marginTop: 2 }}>{holder}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(239,241,236,0.4)' }}>Member</div>
          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 13, fontWeight: 500, marginTop: 2, color: 'rgba(239,241,236,0.85)' }}>{sinceStr}</div>
        </div>
      </div>
    </div>
  )
}

function LedgerRow({ tx, onClick }) {
  const m = rowMeta(tx)
  return (
    <div
      data-row
      onClick={onClick}
      className="ledger-row"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick() } }}
      style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '17px 24px 17px 26px', borderBottom: '1px solid #f0f1ec', position: 'relative', cursor: 'pointer' }}
    >
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: m.accent }} />
      <div style={{ position: 'absolute', left: 0, top: 15, width: 7, height: 7, borderRadius: '50%', background: m.accent, transform: 'translateX(-2px)' }} />
      <div style={{ width: 96, flex: 'none' }}>
        <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 13, color: '#11203D' }}>{tx.dateStr}</div>
        <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: '#5C6B73' }}>{tx.timeStr}</div>
      </div>
      <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: m.accent, border: `1px solid ${m.accent}`, borderRadius: 999, padding: '3px 11px', flex: 'none', opacity: 0.92 }}>{m.typeLabel}</span>
      <span style={{ flex: 1, fontSize: 15, fontWeight: 500, color: '#11203D', minWidth: 60 }}>{m.counterparty}</span>
      <span data-balcol style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 17, fontWeight: 500, color: m.accent, fontFeatureSettings: "'tnum'", minWidth: 120, textAlign: 'right' }}>{m.amountStr}</span>
      <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 13, color: '#5C6B73', fontFeatureSettings: "'tnum'", minWidth: 118, textAlign: 'right' }}>{m.balanceAfterStr}</span>
    </div>
  )
}

function Skeleton() {
  const skel = { background: 'linear-gradient(90deg,#ebede7 25%,#f5f6f2 50%,#ebede7 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.2s infinite' }
  return (
    <div>
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 24px', borderBottom: '1px solid #f0f1ec' }}>
          <div data-skel style={{ width: 96, height: 34, borderRadius: 8, ...skel }} />
          <div data-skel style={{ width: 70, height: 22, borderRadius: 999, ...skel }} />
          <div data-skel style={{ flex: 1, height: 14, borderRadius: 6, ...skel }} />
          <div data-skel style={{ width: 110, height: 18, borderRadius: 6, ...skel }} />
        </div>
      ))}
    </div>
  )
}

// Rendered hidden on screen; shown only when printing (history PDF export).
function PrintableLedger({ transactions, balance, summary, user }) {
  return (
    <div id="print-ledger" className="print-only">
      <h1 style={{ fontFamily: 'monospace', fontSize: 18, margin: '0 0 4px' }}>TrustPay — Mutasi Rekening</h1>
      <div style={{ fontFamily: 'monospace', fontSize: 12, marginBottom: 2 }}>{user?.name || 'Pengguna'} · {user?.username || '@user'} · {user?.account || '—'}</div>
      <div style={{ fontFamily: 'monospace', fontSize: 12, marginBottom: 12 }}>
        Saldo saat ini: {fmtRp(balance)} · {summary.label} · masuk {fmtRp(summary.masuk)} / keluar {fmtRp(summary.keluar)}
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'monospace', fontSize: 11 }}>
        <thead>
          <tr>
            {['Kode', 'Tanggal', 'Waktu', 'Tipe', 'Lawan', 'Nominal', 'Saldo'].map((h) => (
              <th key={h} style={{ textAlign: 'left', borderBottom: '1px solid #000', padding: '4px 6px' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => {
            const m = rowMeta(t)
            return (
              <tr key={t.id}>
                <td style={td}>{t.code}</td>
                <td style={td}>{t.dateStr}</td>
                <td style={td}>{t.timeStr}</td>
                <td style={td}>{m.typeLabel}</td>
                <td style={td}>{t.counterparty}</td>
                <td style={{ ...td, textAlign: 'right' }}>{m.amountStr}</td>
                <td style={{ ...td, textAlign: 'right' }}>{m.balanceAfterStr}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

const td = { borderBottom: '1px solid #ccc', padding: '4px 6px' }
const pagerBtn = { background: 'transparent', border: '1.5px solid rgba(17,32,61,0.2)', color: '#11203D', padding: '8px 16px', borderRadius: 9, fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 14, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }
const exportBtn = { background: 'transparent', border: '1.5px solid rgba(17,32,61,0.2)', color: '#11203D', padding: '8px 14px', borderRadius: 9, fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 13, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }
