import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Logo from '../components/Logo.jsx'
import TopUpModal from '../components/TopUpModal.jsx'
import VoucherModal from '../components/VoucherModal.jsx'
import TransferModal from '../components/TransferModal.jsx'
import PayModal from '../components/PayModal.jsx'
import PinModal from '../components/PinModal.jsx'
import PinSetupModal from '../components/PinSetupModal.jsx'
import ReceiptModal from '../components/ReceiptModal.jsx'
import ReceiveQRModal from '../components/ReceiveQRModal.jsx'
import ScanQRModal from '../components/ScanQRModal.jsx'
import NotificationPanel from '../components/NotificationPanel.jsx'
import { SERVICES } from '../components/QuickActions.jsx'
import HistoryFilter from '../components/HistoryFilter.jsx'
import useWallet from '../hooks/useWallet.js'
import useAuth from '../hooks/useAuth.js'
import { apiGet } from '../lib/api.js'
import { T, FONT } from '../lib/theme.js'
import {
  PlusIcon, TransferIcon, CheckIcon,
  DownloadIcon, PrinterIcon,
  ChevronLeftIcon, ChevronRightIcon,
  EyeIcon, EyeOffIcon, LogoutIcon,
  BellIcon, ScanIcon, QrIcon, GiftIcon, TagIcon,
  AlertIcon, ShieldCheckIcon,
  ArrowDownLeftIcon, ArrowUpRightIcon, ArrowRightIcon,
} from '../components/icons.jsx'
import {
  PER, MONTHS, fmtRp, group, rowMeta,
  monthlySummary, filterTransactions, downloadCSV,
} from '../lib/wallet.js'

const EMPTY_FILTERS = { type: 'ALL', from: '', to: '', q: '' }
const NOTIF_STORE = 'trustpay.notif.lastSeen'

const PROMO_ICONS = { 1: GiftIcon, 2: TagIcon, 3: GiftIcon }

function printRegion(cls) {
  document.body.classList.add(cls)
  const cleanup = () => {
    document.body.classList.remove(cls)
    window.removeEventListener('afterprint', cleanup)
  }
  window.addEventListener('afterprint', cleanup)
  window.print()
}

export default function Dashboard() {
  const { hydrated, balance, transactions, lastUpdate, applyTransaction, refreshWallet } = useWallet()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [loading, setLoading]         = useState(true)
  const [page, setPage]               = useState(0)
  const [modal, setModal]             = useState(null)  // 'topup'|'transfer'|'qr'|'scan'|'voucher'|null
  const [payService, setPayService]   = useState(null)
  const [pendingTx, setPendingTx]     = useState(null)  // transaksi menunggu verifikasi PIN
  const [pinSetup, setPinSetup]       = useState(false) // buka modal atur PIN
  const [receipt, setReceipt]         = useState(null)
  const [showStamp, setShowStamp]     = useState(false)
  const [showBalance, setShowBalance] = useState(true)
  const [filters, setFilters]         = useState(EMPTY_FILTERS)
  const [apiError, setApiError]       = useState(null)
  const [promos, setPromos]           = useState([])
  const [notifOpen, setNotifOpen]     = useState(false)
  const [lastSeen, setLastSeen]       = useState(() => parseInt(localStorage.getItem(NOTIF_STORE) || '0', 10))
  const stampTimer = useRef(null)

  const displayName = user?.name || 'Pengguna'
  const initial     = displayName.trim().charAt(0).toUpperCase() || 'U'

  const unreadCount = useMemo(
    () => transactions.filter(t => t.ts > lastSeen).length,
    [transactions, lastSeen],
  )

  const openNotif = () => {
    const now = Date.now()
    setLastSeen(now)
    localStorage.setItem(NOTIF_STORE, String(now))
    setNotifOpen(true)
  }

  const onLogout = () => { logout(); navigate('/') }

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800)
    return () => { clearTimeout(t); clearTimeout(stampTimer.current) }
  }, [])

  useEffect(() => {
    apiGet('/promos').then(res => setPromos(res.data ?? [])).catch(() => {})
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
    setPendingTx(null)
    fireStamp()
  }

  // ---- VOUCHER ----
  const onVoucherDone = async () => {
    setModal(null)
    await refreshWallet()
    fireStamp()
  }

  // ---- TOP UP (tanpa PIN; sudah lewat gateway Midtrans) ----
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

  // ---- Mulai alur transaksi keluar → minta PIN dulu ----
  const requestPin = (pending) => {
    if (!user?.has_pin) {
      // Belum punya PIN → wajib atur PIN sebelum bisa bertransaksi.
      setPendingTx(pending)
      setPinSetup(true)
    } else {
      setPendingTx(pending)
    }
  }

  const onTransferConfirm = (n, _displayName, note, recipientInput) => {
    setModal(null)
    requestPin({
      kind: 'transfer',
      amount: n,
      recipient: recipientInput,
      description: note || 'Transfer',
      summary: `Transfer ${fmtRp(n)} ke ${recipientInput}`,
    })
  }

  const onPayConfirm = ({ amount, counterparty, description }) => {
    setPayService(null)
    requestPin({ kind: 'pay', amount, counterparty, description, summary: `${description} · ${fmtRp(amount)}` })
  }

  const onQrisPay = ({ amount, counterparty, description }) => {
    setModal(null)
    requestPin({ kind: 'pay', amount, counterparty, description, summary: `Bayar QRIS · ${fmtRp(amount)}` })
  }

  // ---- Eksekusi transaksi setelah PIN benar (dipanggil PinModal) ----
  const submitWithPin = async (pin) => {
    setApiError(null)
    await applyTransaction({
      type: 'KELUAR',
      amount: pendingTx.amount,
      recipient: pendingTx.recipient,        // ada → /transfer; tidak ada → /pay
      description: pendingTx.description,
      pin,
    })
    afterMutation()
  }

  const onPinSetupDone = () => {
    setPinSetup(false)
    // pendingTx tetap → PinModal otomatis muncul untuk konfirmasi transaksi.
  }
  const onPinSetupClose = () => {
    setPinSetup(false)
    setPendingTx(null) // batal: buang transaksi yang menunggu
  }

  const onPickService = (service) => {
    if (service.key === 'qr') setModal('qr')
    else setPayService(service)
  }

  const filtersActive = filters.type !== 'ALL' || filters.from || filters.to || filters.q.trim() !== ''
  const filtered  = useMemo(() => filterTransactions(transactions, filters), [transactions, filters])
  const summary   = useMemo(() => monthlySummary(transactions), [transactions])

  const pages   = Math.max(1, Math.ceil(filtered.length / PER))
  const curPage = Math.min(page, pages - 1)
  const pageRows = filtered.slice(curPage * PER, curPage * PER + PER)

  useEffect(() => { setPage(0) }, [filters])

  const initialLoading = loading || !hydrated
  const showPager = !initialLoading && pages > 1
  const showEmpty = !initialLoading && filtered.length === 0
  const showRows  = !initialLoading && filtered.length > 0

  // PinModal tampil saat ada transaksi menunggu, modal setup tidak terbuka, dan user punya PIN
  const showPin = pendingTx && !pinSetup && user?.has_pin

  return (
    <div className="page-enter" style={{ minHeight: '100vh', background: T.pageGrad }}>
      {/* ===== NAV ===== */}
      <nav className="no-print" style={{ borderBottom: `1px solid ${T.border}`, background: 'rgba(11,10,7,0.72)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', padding: '16px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Logo size={38} textSize={19} />
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={openNotif}
              aria-label="Notifikasi" title="Notifikasi"
              style={{ position: 'relative', width: 40, height: 40, borderRadius: 12, border: `1px solid ${T.border}`, background: T.surface2, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.inkSoft }}
            >
              <BellIcon size={18} />
              {unreadCount > 0 && (
                <span style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: '50%', background: T.goldBright, border: `2px solid ${T.bg}` }} />
              )}
            </button>

            <div style={{ textAlign: 'right', lineHeight: 1.2 }}>
              <div style={{ fontSize: 13, color: T.muted }}>Halo,</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: T.ink }}>{displayName}</div>
            </div>
            <Link
              to="/profil" title="Profil saya"
              style={{ textDecoration: 'none', width: 40, height: 40, borderRadius: '50%', background: T.btnGrad, color: T.onGold, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT.display, fontWeight: 700, fontSize: 16, boxShadow: '0 8px 20px -8px rgba(201,149,43,0.7)' }}
            >
              {initial}
            </Link>
            <button onClick={onLogout} className="icon-btn" aria-label="Keluar" title="Keluar" style={{ width: 40, height: 40, borderRadius: 12, border: `1px solid ${T.border}`, background: T.surface2, color: T.muted, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LogoutIcon size={18} />
            </button>
          </div>
        </div>
      </nav>

      {/* ===== API ERROR BANNER ===== */}
      {apiError && (
        <div className="no-print" style={{ background: 'rgba(240,98,93,0.12)', borderBottom: '1px solid rgba(240,98,93,0.25)', padding: '12px 28px', display: 'flex', alignItems: 'center', gap: 10, color: T.outRose, fontSize: 14, fontWeight: 500 }}>
          <AlertIcon size={18} />
          <span style={{ flex: 1 }}>{apiError}</span>
          <button onClick={() => setApiError(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: T.outRose, fontSize: 18, lineHeight: 1, padding: 4 }}>✕</button>
        </div>
      )}

      {/* ===== PIN belum diatur — banner pengingat keamanan ===== */}
      {hydrated && user && user.has_pin === false && (
        <div className="no-print" style={{ maxWidth: 1120, margin: '18px auto 0', padding: '0 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderRadius: 14, background: T.goldSoft, border: `1px solid ${T.border2}` }}>
            <span style={{ color: T.goldBright, display: 'flex' }}><ShieldCheckIcon size={20} /></span>
            <span style={{ flex: 1, fontSize: 14, color: T.ink }}>Amankan akunmu — atur <b>PIN transaksi</b> agar bisa transfer & bayar tagihan.</span>
            <button onClick={() => setPinSetup(true)} style={{ cursor: 'pointer', border: 'none', background: T.btnGrad, color: T.onGold, padding: '9px 16px', borderRadius: 10, fontFamily: FONT.sans, fontSize: 13.5, fontWeight: 700 }}>Atur PIN</button>
          </div>
        </div>
      )}

      {/* ===== MAIN GRID ===== */}
      <div data-grid className="dash-grid" style={{ maxWidth: 1120, margin: '0 auto', padding: '28px 28px 70px', display: 'grid', gridTemplateColumns: '400px 1fr', gap: 26, alignItems: 'start' }}>

        {/* ---- KIRI ---- */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Kartu saldo premium + aksi terintegrasi */}
          <div style={{ position: 'relative' }}>
            <WalletCard
              balance={balance} lastUpdate={lastUpdate} user={user} summary={summary}
              show={showBalance} onToggle={() => setShowBalance(s => !s)}
              onTopup={() => setModal('topup')}
              onTransfer={() => setModal('transfer')}
              onScan={() => setModal('scan')}
              onReceive={() => setModal('qr')}
              onVoucher={() => setModal('voucher')}
            />
            {showStamp && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                <div data-stamp style={{ width: 128, height: 128, border: `3px solid ${T.goldBright}`, borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(11,10,7,0.88)', boxShadow: '0 18px 40px -14px rgba(245,206,83,0.7)', animation: 'stampIn .5s cubic-bezier(.2,.8,.3,1) both' }}>
                  <span style={{ color: T.goldBright, display: 'flex' }}><CheckIcon size={32} strokeWidth={2.6} /></span>
                  <span style={{ fontFamily: FONT.mono, fontSize: 13, letterSpacing: '0.18em', color: T.goldBright, textTransform: 'uppercase', marginTop: 5 }}>Berhasil</span>
                </div>
              </div>
            )}
          </div>

          {/* Layanan & tagihan — showcase fitur */}
          <ServicesPanel onPick={onPickService} onTransfer={() => setModal('transfer')} />

          {/* PROMO */}
          {promos.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 15, color: T.ink }}>Promo & Cashback</span>
                <span style={{ fontFamily: FONT.mono, fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: T.muted }}>Terbaru</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {promos.map(p => <PromoCard key={p.id} promo={p} />)}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '14px 16px', borderRadius: 14, background: T.surface, border: `1px solid ${T.border}` }}>
            <span style={{ color: T.goldBright, display: 'flex', marginTop: 1 }}><ShieldCheckIcon size={16} /></span>
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: T.muted }}>Setiap transaksi keluar diamankan <b style={{ color: T.inkSoft }}>PIN 6 digit</b> & tercatat permanen — bisa difilter, diekspor, dan diaudit.</p>
          </div>
        </div>

        {/* ---- KANAN ---- */}
        <div>
          {/* Ringkasan bulanan e-wallet */}
          <FlowSummary summary={summary} />

          <div style={{ background: T.surface, borderRadius: 20, border: `1px solid ${T.border}`, boxShadow: '0 24px 60px -36px rgba(0,0,0,0.9)', overflow: 'hidden' }}>
            <div style={{ padding: '22px 24px 16px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', borderBottom: `1px solid ${T.border}`, gap: 12, flexWrap: 'wrap' }}>
              <div>
                <h2 style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 20, margin: 0, color: T.ink }}>Riwayat Transaksi</h2>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: T.muted }}>Setiap mutasi tercatat & bisa diaudit</p>
              </div>
              <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button onClick={() => downloadCSV(filtered)} disabled={filtered.length === 0} style={{ ...exportBtn, opacity: filtered.length === 0 ? 0.5 : 1, cursor: filtered.length === 0 ? 'not-allowed' : 'pointer' }}>
                  <DownloadIcon size={15} /> CSV
                </button>
                <button onClick={() => printRegion('printing-ledger')} disabled={filtered.length === 0} style={{ ...exportBtn, opacity: filtered.length === 0 ? 0.5 : 1, cursor: filtered.length === 0 ? 'not-allowed' : 'pointer' }}>
                  <PrinterIcon size={15} /> PDF
                </button>
              </div>
            </div>

            {!initialLoading && <HistoryFilter filters={filters} setFilters={setFilters} active={!!filtersActive} />}
            {initialLoading && <Skeleton />}

            {showEmpty && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, padding: '46px 24px', textAlign: 'center' }}>
                <div style={{ width: 60, height: 60, borderRadius: 18, background: T.goldSoft, color: T.goldBright, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><PlusIcon size={26} /></div>
                <div style={{ color: T.muted, fontSize: 15, maxWidth: 320 }}>
                  {filtersActive ? 'Tidak ada transaksi yang cocok dengan filter.' : 'Belum ada transaksi — mulai dengan Top Up saldo pertamamu.'}
                </div>
                {!filtersActive && (
                  <button onClick={() => setModal('topup')} style={{ cursor: 'pointer', border: 'none', background: T.btnGrad, color: T.onGold, padding: '11px 22px', borderRadius: 12, fontFamily: FONT.sans, fontSize: 14, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                    <PlusIcon size={16} strokeWidth={2.2} /> Top Up Sekarang
                  </button>
                )}
              </div>
            )}

            {showRows && (
              <div style={{ padding: '6px 0' }}>{pageRows.map(t => <TxRow key={t.id} tx={t} onClick={() => setReceipt(t)} />)}</div>
            )}

            {showPager && (
              <div className="no-print" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderTop: `1px solid ${T.border}` }}>
                <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={curPage <= 0} style={{ ...pagerBtn, opacity: curPage <= 0 ? 0.4 : 1, cursor: curPage <= 0 ? 'not-allowed' : 'pointer' }}>
                  <ChevronLeftIcon size={15} /> Sebelumnya
                </button>
                <span style={{ fontFamily: FONT.mono, fontSize: 12, letterSpacing: '0.06em', color: T.muted }}>Halaman {curPage + 1} / {pages}</span>
                <button onClick={() => setPage(p => p + 1)} disabled={curPage >= pages - 1} style={{ ...pagerBtn, opacity: curPage >= pages - 1 ? 0.4 : 1, cursor: curPage >= pages - 1 ? 'not-allowed' : 'pointer' }}>
                  Selanjutnya <ChevronRightIcon size={15} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===== MODALS ===== */}
      {modal === 'topup'    && <TopUpModal onClose={() => setModal(null)} onConfirm={onTopupConfirm} />}
      {modal === 'transfer' && <TransferModal balance={balance} onClose={() => setModal(null)} onConfirm={onTransferConfirm} />}
      {modal === 'qr'       && <ReceiveQRModal user={user} onClose={() => setModal(null)} />}
      {modal === 'scan'     && <ScanQRModal balance={balance} onClose={() => setModal(null)} onPay={onQrisPay} />}
      {modal === 'voucher'  && <VoucherModal onClose={() => setModal(null)} onDone={onVoucherDone} />}
      {payService && <PayModal service={payService} balance={balance} onClose={() => setPayService(null)} onConfirm={onPayConfirm} />}

      {/* PIN: gerbang keamanan + setup */}
      {pinSetup && <PinSetupModal hasPin={!!user?.has_pin} onClose={onPinSetupClose} onDone={onPinSetupDone} />}
      {showPin && (
        <PinModal
          summary={pendingTx.summary}
          onSubmit={submitWithPin}
          onClose={() => setPendingTx(null)}
        />
      )}

      {receipt && <ReceiptModal tx={receipt} onClose={() => setReceipt(null)} />}
      {notifOpen && <NotificationPanel transactions={transactions} onClose={() => setNotifOpen(false)} />}
      <PrintableLedger transactions={filtered} balance={balance} summary={summary} user={user} />
    </div>
  )
}

// ====================================================================
// Kartu saldo premium (hitam-emas) + 4 aksi utama terintegrasi
// ====================================================================
function WalletCard({ balance, lastUpdate, user, summary, show, onToggle, onTopup, onTransfer, onScan, onReceive, onVoucher }) {
  const holder  = (user?.name || 'Pengguna').toUpperCase()
  const account = user?.account || '8021 4455 4021'
  const tail    = account.replace(/\s/g, '').slice(-4)
  const masked  = `•••• ${tail}`

  const actions = [
    { key: 'topup', label: 'Top Up', Icon: PlusIcon, onClick: onTopup, primary: true },
    { key: 'transfer', label: 'Transfer', Icon: TransferIcon, onClick: onTransfer },
    { key: 'voucher', label: 'Voucher', Icon: GiftIcon, onClick: onVoucher },
    { key: 'scan', label: 'Scan', Icon: ScanIcon, onClick: onScan },
    { key: 'receive', label: 'Terima', Icon: QrIcon, onClick: onReceive },
  ]

  return (
    <div style={{ borderRadius: 24, background: T.surface, border: `1px solid ${T.border}`, boxShadow: '0 28px 60px -34px rgba(0,0,0,0.9)', overflow: 'hidden' }}>
      {/* Bagian kartu emas-hitam */}
      <div className="wallet-card" style={{ position: 'relative', padding: '22px 22px 20px', color: '#FFFFFF', overflow: 'hidden', background: T.cardGrad, transition: 'transform .25s ease, box-shadow .25s ease' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(280px 150px at 86% -12%, rgba(245,206,83,0.30), transparent 62%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', right: -50, bottom: -60, width: 190, height: 190, border: '1.5px solid rgba(245,206,83,0.18)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', right: -16, bottom: -24, width: 120, height: 120, border: '1.5px solid rgba(245,206,83,0.12)', borderRadius: '50%' }} />
        <div className="wallet-sheen" style={{ position: 'absolute', top: 0, left: 0, width: '60%', height: '100%', background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.16) 50%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: T.goldBright, boxShadow: '0 0 0 3px rgba(245,206,83,0.25)' }} />
            <span style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 15 }}>TrustPay</span>
            <span style={{ fontFamily: FONT.mono, fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: T.goldBright, border: `1px solid ${T.border2}`, padding: '2px 7px', borderRadius: 999, marginLeft: 4 }}>Premium</span>
          </div>
          <span style={{ fontFamily: FONT.mono, fontSize: 13, letterSpacing: '0.16em', color: 'rgba(255,255,255,0.85)' }}>{masked}</span>
        </div>

        <div style={{ marginTop: 20, position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontFamily: FONT.mono, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)' }}>Saldo Aktif</span>
            <button onClick={onToggle} aria-label={show ? 'Sembunyikan saldo' : 'Tampilkan saldo'} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, borderRadius: 8, border: '1px solid rgba(255,255,255,0.28)', background: 'rgba(255,255,255,0.12)', color: '#fff', cursor: 'pointer' }}>
              {show ? <EyeIcon size={15} /> : <EyeOffIcon size={15} />}
            </button>
          </div>
          <div key={balance} data-balance style={{ fontFamily: FONT.mono, fontWeight: 600, fontSize: 40, letterSpacing: '-0.015em', fontFeatureSettings: "'tnum'", animation: 'balanceFade .25s ease-out', marginTop: 6, minHeight: 48 }}>
            {show ? fmtRp(balance) : 'Rp ••••••••'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 6, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: FONT.mono, fontSize: 11, letterSpacing: '0.04em', color: 'rgba(255,255,255,0.6)' }}>{holder}</span>
            <span style={{ fontFamily: FONT.mono, fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>·</span>
            <span style={{ fontFamily: FONT.mono, fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>upd {lastUpdate}</span>
          </div>
        </div>
      </div>

      {/* Aksi utama */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, padding: '16px 14px' }}>
        {actions.map((a) => (
          <button key={a.key} onClick={a.onClick} className="act-btn" style={{ cursor: 'pointer', background: 'transparent', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '4px 0' }}>
            <span style={{ width: 50, height: 50, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', background: a.primary ? T.btnGrad : T.surface2, border: a.primary ? 'none' : `1px solid ${T.border2}`, color: a.primary ? T.onGold : T.goldBright, boxShadow: a.primary ? '0 10px 22px -10px rgba(201,149,43,0.7)' : 'none' }}>
              <a.Icon size={21} strokeWidth={a.primary ? 2.2 : 1.9} />
            </span>
            <span style={{ fontSize: 12, fontWeight: 600, color: T.inkSoft }}>{a.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ====================================================================
// Panel layanan & tagihan (showcase fitur)
// ====================================================================
function ServicesPanel({ onPick, onTransfer }) {
  // Transfer di depan, lalu tagihan, lalu QR — semua fitur project dalam satu grid
  const bills = SERVICES.filter(s => s.key !== 'qr')
  const qr = SERVICES.find(s => s.key === 'qr')

  return (
    <div style={{ background: T.surface, borderRadius: 20, border: `1px solid ${T.border}`, boxShadow: '0 20px 50px -32px rgba(0,0,0,0.8)', padding: '18px 18px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3 style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 16, margin: 0, color: T.ink }}>Layanan & Tagihan</h3>
        <span style={{ fontFamily: FONT.mono, fontSize: 10.5, letterSpacing: '0.06em', textTransform: 'uppercase', color: T.muted }}>Saldo auto-potong</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
        <ServiceTile label="Transfer" Icon={TransferIcon} onClick={onTransfer} />
        {bills.map((s) => (
          <ServiceTile key={s.key} label={s.label} Icon={s.Icon} onClick={() => onPick(s)} />
        ))}
        {qr && <ServiceTile label="Terima QR" Icon={qr.Icon} onClick={() => onPick(qr)} />}
      </div>
    </div>
  )
}

function ServiceTile({ label, Icon, onClick }) {
  return (
    <button onClick={onClick} className="qa-btn" style={{ cursor: 'pointer', background: 'transparent', border: '1px solid transparent', borderRadius: 14, padding: '12px 2px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <span style={{ width: 46, height: 46, borderRadius: 15, background: T.goldSoft, color: T.goldBright, border: `1px solid ${T.border2}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={21} />
      </span>
      <span style={{ fontSize: 11.5, fontWeight: 600, color: T.inkSoft, textAlign: 'center', lineHeight: 1.2 }}>{label}</span>
    </button>
  )
}

// ====================================================================
// Ringkasan arus dana bulan ini (e-wallet style)
// ====================================================================
function FlowSummary({ summary }) {
  const net = summary.net
  return (
    <div className="summary-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 18 }}>
      <FlowCard label="Pemasukan" sub={summary.label} value={`+ ${fmtRp(summary.masuk)}`} accent={T.inGreen} Icon={ArrowDownLeftIcon} />
      <FlowCard label="Pengeluaran" sub={`${summary.count} transaksi`} value={`− ${fmtRp(summary.keluar)}`} accent={T.outRose} Icon={ArrowUpRightIcon} />
      <FlowCard label="Arus Bersih" sub={net < 0 ? 'lebih banyak keluar' : 'lebih banyak masuk'} value={`${net < 0 ? '− ' : '+ '}${fmtRp(net)}`} accent={net < 0 ? T.outRose : T.goldBright} Icon={ArrowRightIcon} />
    </div>
  )
}

function FlowCard({ label, sub, value, accent, Icon }) {
  return (
    <div style={{ background: T.surface, borderRadius: 16, border: `1px solid ${T.border}`, boxShadow: '0 16px 36px -28px rgba(0,0,0,0.8)', padding: '16px 18px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontFamily: FONT.mono, fontSize: 10.5, letterSpacing: '0.06em', textTransform: 'uppercase', color: T.muted }}>{label}</span>
        <span style={{ width: 28, height: 28, borderRadius: 9, background: `${accent}22`, color: accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={15} /></span>
      </div>
      <div style={{ fontFamily: FONT.mono, fontWeight: 600, fontSize: 18, color: accent, fontFeatureSettings: "'tnum'", letterSpacing: '-0.01em' }}>{value}</div>
      <div style={{ fontSize: 12, color: T.muted, marginTop: 4 }}>{sub}</div>
    </div>
  )
}

// ====================================================================
// Baris transaksi gaya e-wallet (ikon bulat + nominal berwarna)
// ====================================================================
function TxRow({ tx, onClick }) {
  const m = rowMeta(tx)
  const isIn = tx.amount > 0
  const isTopup = tx.type === 'TOPUP'
  const isCashback = isTopup && tx.description && (tx.description.includes('Cashback') || tx.description.includes('cashback') || tx.description.includes('Redeem voucher'))
  const Icon = isTopup ? PlusIcon : isIn ? ArrowDownLeftIcon : ArrowUpRightIcon
  const title = isTopup
    ? (isCashback ? tx.description : 'Top Up Saldo')
    : (m.counterparty && m.counterparty !== '—' ? m.counterparty : (tx.description || 'Transaksi'))
  const sub = [tx.dateStr + ' · ' + tx.timeStr, (!isCashback && tx.description && tx.description !== title) ? tx.description : null].filter(Boolean).join(' · ')

  return (
    <div data-row onClick={onClick} className="ledger-row" role="button" tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick() } }}
      style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 22px', cursor: 'pointer', borderRadius: 14, margin: '0 8px' }}>
      <span style={{ width: 44, height: 44, flex: 'none', borderRadius: 14, background: `${m.accent}1f`, color: m.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${m.accent}33` }}>
        <Icon size={19} strokeWidth={2} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14.5, fontWeight: 600, color: T.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
        <div style={{ fontFamily: FONT.mono, fontSize: 11.5, color: T.muted, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sub}</div>
      </div>
      <div style={{ textAlign: 'right', flex: 'none' }}>
        <div style={{ fontFamily: FONT.mono, fontSize: 15.5, fontWeight: 600, color: m.accent, fontFeatureSettings: "'tnum'" }}>{m.amountStr}</div>
        <div style={{ fontFamily: FONT.mono, fontSize: 11, color: T.mutedDim, marginTop: 2 }}>{m.balanceAfterStr !== '—' ? 'saldo ' + m.balanceAfterStr : tx.status === 'PENDING' ? 'pending' : '—'}</div>
      </div>
    </div>
  )
}

function PromoCard({ promo }) {
  const isDark = promo.dark
  const Icon = PROMO_ICONS[promo.id] || GiftIcon
  return (
    <div className="promo-card" style={{ borderRadius: 16, padding: '14px 16px', background: isDark ? T.surface : T.btnGrad, display: 'flex', alignItems: 'center', gap: 14, cursor: 'default', border: isDark ? `1px solid ${T.border}` : 'none', boxShadow: isDark ? 'none' : '0 14px 30px -16px rgba(201,149,43,0.6)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ width: 40, height: 40, borderRadius: 12, background: isDark ? T.goldSoft : 'rgba(27,20,7,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isDark ? T.goldBright : T.onGold, flex: 'none' }}>
        <Icon size={20} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 14, color: isDark ? T.ink : T.onGold, marginBottom: 2 }}>{promo.title}</div>
        <div style={{ fontSize: 12, color: isDark ? T.muted : 'rgba(27,20,7,0.7)' }}>{promo.description}</div>
      </div>
      <div style={{ fontFamily: FONT.mono, fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '4px 9px', borderRadius: 999, background: isDark ? T.goldSoft : 'rgba(27,20,7,0.16)', color: isDark ? T.inkSoft : T.onGold, flex: 'none' }}>
        {promo.tag}
      </div>
    </div>
  )
}

function Skeleton() {
  const skel = { background: 'linear-gradient(90deg,#1a1610 25%,#241f15 50%,#1a1610 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.2s infinite' }
  return (
    <div style={{ padding: '6px 0' }}>
      {[0, 1, 2, 3, 4].map(i => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 22px' }}>
          <div data-skel style={{ width: 44, height: 44, borderRadius: 14, ...skel }} />
          <div style={{ flex: 1 }}>
            <div data-skel style={{ width: '55%', height: 13, borderRadius: 6, ...skel }} />
            <div data-skel style={{ width: '35%', height: 10, borderRadius: 6, marginTop: 8, ...skel }} />
          </div>
          <div data-skel style={{ width: 90, height: 16, borderRadius: 6, ...skel }} />
        </div>
      ))}
    </div>
  )
}

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
          <tr>{['Kode', 'Tanggal', 'Waktu', 'Tipe', 'Lawan', 'Nominal', 'Saldo'].map(h => (
            <th key={h} style={{ textAlign: 'left', borderBottom: '1px solid #000', padding: '4px 6px' }}>{h}</th>
          ))}</tr>
        </thead>
        <tbody>
          {transactions.map(t => {
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

const td         = { borderBottom: '1px solid #ccc', padding: '4px 6px' }
const pagerBtn   = { background: T.surface2, border: `1px solid ${T.border}`, color: T.ink, padding: '8px 16px', borderRadius: 10, fontFamily: FONT.sans, fontSize: 14, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }
const exportBtn  = { background: T.surface2, border: `1px solid ${T.border}`, color: T.inkSoft, padding: '8px 14px', borderRadius: 10, fontFamily: FONT.sans, fontSize: 13, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }
