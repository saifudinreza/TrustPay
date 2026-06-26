import { useEffect, useRef } from 'react'
import { CloseIcon, BellIcon, CheckIcon } from './icons.jsx'
import { rowMeta } from '../lib/wallet.js'
import { T, FONT } from '../lib/theme.js'

/**
 * NotificationPanel — panel slide-in dari kanan yang menampilkan
 * 8 transaksi terakhir sebagai notifikasi.
 *
 * Props:
 *  - transactions : array transaksi ternormalisasi dari useWallet
 *  - onClose      : fungsi untuk menutup panel
 */
export default function NotificationPanel({ transactions, onClose }) {
  const panelRef = useRef(null)

  // Tutup panel saat klik di luar
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose()
    }
    const t = setTimeout(() => document.addEventListener('mousedown', handler), 50)
    return () => {
      clearTimeout(t)
      document.removeEventListener('mousedown', handler)
    }
  }, [onClose])

  // Tutup dengan Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const recent = transactions.slice(0, 10)

  return (
    <>
      {/* backdrop gelap tipis */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 45,
          background: 'rgba(6,3,12,0.55)',
          animation: 'overlayIn .18s ease-out',
        }}
      />

      {/* panel */}
      <div
        ref={panelRef}
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0,
          width: 380, maxWidth: '100vw',
          zIndex: 50,
          background: T.surface,
          borderLeft: `1px solid ${T.border}`,
          boxShadow: '-30px 0 80px -20px rgba(0,0,0,0.7)',
          display: 'flex', flexDirection: 'column',
          animation: 'slideInRight .28s cubic-bezier(.2,.8,.3,1)',
        }}
      >
        {/* header */}
        <div style={{ padding: '20px 22px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: T.goldBright, display: 'flex' }}><BellIcon size={20} /></span>
            <h3 style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 18, margin: 0, color: T.ink }}>Notifikasi</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup notifikasi"
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: T.muted, display: 'flex', padding: 4 }}
          >
            <CloseIcon size={20} />
          </button>
        </div>

        {/* daftar notifikasi */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {recent.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 14, color: T.muted }}>
              <span style={{ opacity: 0.3 }}><BellIcon size={44} /></span>
              <p style={{ margin: 0, fontSize: 15 }}>Belum ada notifikasi</p>
            </div>
          ) : (
            recent.map((tx, i) => <NotifItem key={tx.id} tx={tx} delay={i * 0.04} />)
          )}
        </div>

        {/* footer */}
        <div style={{ padding: '14px 22px', borderTop: `1px solid ${T.border}`, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: T.muted, fontSize: 13 }}>
            <span style={{ display: 'flex' }}><CheckIcon size={14} strokeWidth={2} /></span>
            <span>Menampilkan {recent.length} transaksi terbaru</span>
          </div>
        </div>
      </div>
    </>
  )
}

function NotifItem({ tx, delay }) {
  const m = rowMeta(tx)
  const isIn = tx.amount > 0

  const icons = {
    TOPUP: '↑',
    MASUK: '↓',
    KELUAR: '→',
  }

  return (
    <div
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 14,
        padding: '14px 22px',
        borderBottom: `1px solid ${T.border}`,
        animation: `notifItemIn .3s cubic-bezier(.2,.8,.3,1) ${delay}s both`,
        cursor: 'default',
        transition: 'background .12s ease',
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(230,184,76,0.07)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      {/* ikon tipe */}
      <div style={{
        width: 40, height: 40, borderRadius: 12, flex: 'none',
        background: m.accent + '26',
        color: m.accent,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: FONT.mono, fontSize: 17, fontWeight: 600,
      }}>
        {icons[tx.type] || '·'}
      </div>

      {/* info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8, marginBottom: 3 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: T.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {m.typeLabel}
          </span>
          <span style={{ fontFamily: FONT.mono, fontSize: 14, fontWeight: 500, color: m.accent, flex: 'none' }}>
            {m.amountStr}
          </span>
        </div>
        <div style={{ fontSize: 13, color: T.muted, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {m.counterparty}
          {tx.description && tx.description !== '' && tx.description !== 'Transfer masuk' && tx.description !== 'Top up saldo'
            ? ` · ${tx.description}` : ''}
        </div>
        <div style={{ fontFamily: FONT.mono, fontSize: 11, color: T.mutedDim, letterSpacing: '0.02em' }}>
          {tx.dateStr} · {tx.timeStr}
        </div>
      </div>
    </div>
  )
}
