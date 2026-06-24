import { useEffect, useRef } from 'react'
import { CloseIcon, BellIcon, CheckIcon } from './icons.jsx'
import { fmtRp, rowMeta } from '../lib/wallet.js'

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
          background: 'rgba(10,11,14,0.25)',
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
          background: '#fff',
          boxShadow: '-20px 0 60px -20px rgba(23,25,29,0.25)',
          display: 'flex', flexDirection: 'column',
          animation: 'slideInRight .28s cubic-bezier(.2,.8,.3,1)',
        }}
      >
        {/* header */}
        <div style={{ padding: '20px 22px', borderBottom: '1px solid rgba(23,25,29,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: '#17191D', display: 'flex' }}><BellIcon size={20} /></span>
            <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 500, fontSize: 18, margin: 0, color: '#17191D' }}>Notifikasi</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup notifikasi"
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#5C6B73', display: 'flex', padding: 4 }}
          >
            <CloseIcon size={20} />
          </button>
        </div>

        {/* daftar notifikasi */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {recent.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 14, color: '#5C6B73' }}>
              <span style={{ opacity: 0.3 }}><BellIcon size={44} /></span>
              <p style={{ margin: 0, fontSize: 15 }}>Belum ada notifikasi</p>
            </div>
          ) : (
            recent.map((tx, i) => <NotifItem key={tx.id} tx={tx} delay={i * 0.04} />)
          )}
        </div>

        {/* footer */}
        <div style={{ padding: '14px 22px', borderTop: '1px solid rgba(23,25,29,0.07)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#5C6B73', fontSize: 13 }}>
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
        borderBottom: '1px solid rgba(23,25,29,0.05)',
        animation: `notifItemIn .3s cubic-bezier(.2,.8,.3,1) ${delay}s both`,
        cursor: 'default',
        transition: 'background .12s ease',
      }}
      onMouseEnter={e => e.currentTarget.style.background = '#fafbf7'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      {/* ikon tipe */}
      <div style={{
        width: 40, height: 40, borderRadius: 12, flex: 'none',
        background: m.accent + '18',
        color: m.accent,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'IBM Plex Mono',monospace", fontSize: 17, fontWeight: 600,
      }}>
        {icons[tx.type] || '·'}
      </div>

      {/* info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8, marginBottom: 3 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#17191D', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {m.typeLabel}
          </span>
          <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 14, fontWeight: 500, color: m.accent, flex: 'none' }}>
            {m.amountStr}
          </span>
        </div>
        <div style={{ fontSize: 13, color: '#5C6B73', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {m.counterparty}
          {tx.description && tx.description !== '' && tx.description !== 'Transfer masuk' && tx.description !== 'Top up saldo'
            ? ` · ${tx.description}` : ''}
        </div>
        <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: '#8A9AA2', letterSpacing: '0.02em' }}>
          {tx.dateStr} · {tx.timeStr}
        </div>
      </div>
    </div>
  )
}
