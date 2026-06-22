import { useMemo, useState } from 'react'
import { group, validateNominal } from '../lib/wallet.js'
import { CloseIcon, InfoIcon } from './icons.jsx'

/**
 * TopUpModal — slip input nominal top up.
 *
 * Fitur:
 *  - Validasi real-time (validateNominal) dengan pesan error yang sama persis dengan backend
 *  - Format otomatis saat blur (2000000 → "2.000.000")
 *  - Tombol disable sampai input valid
 *  - State "Memproses…" selama menunggu respons API
 *
 * Memanggil `onConfirm(n)` dengan nominal integer saat submit;
 * parent (Dashboard) yang mengurus panggilan API ke useWallet.applyTransaction.
 */
export default function TopUpModal({ onClose, onConfirm }) {
  const [raw, setRaw] = useState('')          // input mentah dari user
  const [touched, setTouched] = useState(false) // apakah user sudah pernah mengetik
  const [submitting, setSubmitting] = useState(false)

  // Validasi ulang setiap kali `raw` berubah (useMemo agar tidak re-hitung saat re-render lain)
  const v = useMemo(() => validateNominal(raw), [raw])
  const showError = touched && !!v.err
  const canSubmit = !v.err && !submitting

  // Format ribuan saat user meninggalkan field (blur)
  const onBlur = () => {
    if (!v.err) setRaw(group(v.n))
    setTouched(true)
  }

  const submit = () => {
    if (v.err || submitting) { setTouched(true); return }
    setSubmitting(true)
    // Delay singkat supaya animasi "Memproses…" terlihat sebelum parent buka Snap
    setTimeout(() => onConfirm(v.n), 650)
  }

  return (
    <Overlay onClose={onClose}>
      <div style={{ width: 430, maxWidth: '100%', background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 40px 80px -24px rgba(10,11,14,0.5)', animation: 'popIn .24s cubic-bezier(.2,.8,.3,1)' }} onClick={(e) => e.stopPropagation()}>
        <Perforation />
        <div style={{ padding: '24px 26px 26px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <h3 style={modalTitle}>Top Up Saldo</h3>
            <button onClick={onClose} style={closeBtn} aria-label="Tutup"><CloseIcon size={18} /></button>
          </div>

          <label style={label}>Nominal</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px', height: 50, borderRadius: 10, border: `1.5px solid ${showError ? '#7A3142' : 'rgba(23,25,29,0.18)'}`, background: '#fbfcf9' }}>
            <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 16, color: '#5C6B73' }}>Rp</span>
            <input
              value={raw}
              onChange={(e) => { setRaw(e.target.value); setTouched(true) }}
              onBlur={onBlur}
              inputMode="numeric"
              placeholder="0"
              autoFocus
              style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontFamily: "'IBM Plex Mono',monospace", fontSize: 18, color: '#17191D', fontFeatureSettings: "'tnum'" }}
            />
          </div>

          {/* Tampilkan error atau hint */}
          {showError ? (
            <div style={{ marginTop: 8, fontFamily: "'IBM Plex Mono',monospace", fontSize: 12, letterSpacing: '0.02em', color: '#7A3142' }}>{v.err}</div>
          ) : (
            <div style={{ marginTop: 8, fontSize: 12, color: '#5C6B73', display: 'flex', alignItems: 'center', gap: 6 }}><InfoIcon size={14} /> Hanya angka bulat, tanpa desimal · maks. Rp 10.000.000</div>
          )}

          <div style={{ marginTop: 22 }}>
            <SubmitButton enabled={canSubmit} onClick={submit}>
              {submitting ? 'Memproses…' : 'Konfirmasi Top Up'}
            </SubmitButton>
          </div>
        </div>
      </div>
    </Overlay>
  )
}

// ---- Primitif modal bersama (dipakai oleh TransferModal, PayModal, ReceiptModal) ----

/** Overlay gelap dengan blur — klik di luar untuk tutup */
export function Overlay({ children, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(10,11,14,0.5)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, animation: 'overlayIn .18s ease-out' }}
    >
      {children}
    </div>
  )
}

/** Tepi perforasi — estetika "slip setoran bank" */
export function Perforation() {
  return (
    <div style={{ height: 16, backgroundImage: 'radial-gradient(circle 3px at 9px 11px, rgba(92,107,115,0.4) 3px, transparent 3px)', backgroundSize: '18px 16px', backgroundRepeat: 'repeat-x', borderBottom: '1px dashed rgba(92,107,115,0.35)' }} />
  )
}

/** Tombol submit — emas saat aktif, abu saat disabled */
export function SubmitButton({ enabled, onClick, children }) {
  if (enabled) {
    return (
      <button onClick={onClick} style={{ width: '100%', cursor: 'pointer', border: 'none', padding: '14px 0', borderRadius: 10, background: '#BEF264', color: '#16210A', fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 15, fontWeight: 700 }}>
        {children}
      </button>
    )
  }
  return (
    <button disabled style={{ width: '100%', cursor: 'not-allowed', border: 'none', padding: '14px 0', borderRadius: 10, background: 'rgba(92,107,115,0.18)', color: '#5C6B73', fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 15, fontWeight: 600 }}>
      {children}
    </button>
  )
}

// Style yang di-export agar modal lain (Transfer, Pay, Receipt) konsisten secara visual
export const modalTitle = { fontFamily: "'Space Grotesk',sans-serif", fontWeight: 500, fontSize: 21, margin: 0, color: '#17191D' }
export const closeBtn   = { cursor: 'pointer', background: 'transparent', border: 'none', color: '#5C6B73', fontSize: 20, lineHeight: 1, padding: 4 }
export const label      = { display: 'block', fontSize: 14, fontWeight: 600, color: '#17191D', marginBottom: 8 }
