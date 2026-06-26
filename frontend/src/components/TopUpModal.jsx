import { useMemo, useState } from 'react'
import { group, validateNominal } from '../lib/wallet.js'
import { T, FONT } from '../lib/theme.js'
import { CloseIcon, InfoIcon } from './icons.jsx'

/**
 * TopUpModal — slip input nominal top up (tema gelap + ungu).
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

  const v = useMemo(() => validateNominal(raw), [raw])
  const showError = touched && !!v.err
  const canSubmit = !v.err && !submitting

  const onBlur = () => {
    if (!v.err) setRaw(group(v.n))
    setTouched(true)
  }

  const submit = () => {
    if (v.err || submitting) { setTouched(true); return }
    setSubmitting(true)
    setTimeout(() => onConfirm(v.n), 650)
  }

  const PRESETS = [50000, 100000, 250000, 500000]

  return (
    <Overlay onClose={onClose}>
      <ModalCard onClose={onClose} title="Top Up Saldo">
        <label style={label}>Nominal</label>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          {PRESETS.map((p) => (
            <button key={p} onClick={() => { setRaw(group(p)); setTouched(true) }} style={chip}>
              {group(p)}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px', height: 54, borderRadius: 12, border: `1.5px solid ${showError ? T.outRose : T.border}`, background: T.surface2 }}>
          <span style={{ fontFamily: FONT.mono, fontSize: 16, color: T.muted }}>Rp</span>
          <input
            value={raw}
            onChange={(e) => { setRaw(e.target.value); setTouched(true) }}
            onBlur={onBlur}
            inputMode="numeric"
            placeholder="0"
            autoFocus
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontFamily: FONT.mono, fontSize: 20, color: T.ink, fontFeatureSettings: "'tnum'" }}
          />
        </div>

        {showError ? (
          <div style={{ marginTop: 8, fontFamily: FONT.mono, fontSize: 12, letterSpacing: '0.02em', color: T.outRose }}>{v.err}</div>
        ) : (
          <div style={{ marginTop: 8, fontSize: 12, color: T.muted, display: 'flex', alignItems: 'center', gap: 6 }}><InfoIcon size={14} /> Hanya angka bulat, tanpa desimal · maks. Rp 10.000.000</div>
        )}

        <div style={{ marginTop: 22 }}>
          <SubmitButton enabled={canSubmit} onClick={submit}>
            {submitting ? 'Memproses…' : 'Konfirmasi Top Up'}
          </SubmitButton>
        </div>
      </ModalCard>
    </Overlay>
  )
}

// ---- Primitif modal bersama (dipakai oleh semua modal: Transfer, Pay, Pin, dll) ----

/** Overlay gelap dengan blur — klik di luar untuk tutup */
export function Overlay({ children, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(6,3,12,0.72)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, animation: 'overlayIn .18s ease-out' }}
    >
      {children}
    </div>
  )
}

/**
 * ModalCard — bingkai kartu modal standar (header + tombol tutup) bertema gelap.
 * Mengurangi duplikasi: TopUp/Transfer/Pay/Pin tinggal isi children.
 */
export function ModalCard({ title, icon, onClose, width = 440, children }) {
  return (
    <div style={{ width, maxWidth: '100%', background: T.surface, borderRadius: 22, overflow: 'hidden', border: `1px solid ${T.border}`, boxShadow: '0 40px 90px -24px rgba(0,0,0,0.85)', animation: 'popIn .24s cubic-bezier(.2,.8,.3,1)' }} onClick={(e) => e.stopPropagation()}>
      {/* aksen ungu tipis di atas kartu */}
      <div style={{ height: 4, background: T.btnGrad }} />
      <div style={{ padding: '22px 24px 26px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {icon && (
              <div style={{ width: 40, height: 40, borderRadius: 12, background: T.goldSoft, color: T.goldBright, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {icon}
              </div>
            )}
            <h3 style={modalTitle}>{title}</h3>
          </div>
          <button onClick={onClose} style={closeBtn} aria-label="Tutup"><CloseIcon size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

/** Tepi perforasi — dipertahankan untuk kompatibilitas (tidak dipakai di tema baru) */
export function Perforation() {
  return <div style={{ height: 4, background: T.btnGrad }} />
}

/** Tombol submit — gradien ungu + teks PUTIH saat aktif, redup saat disabled */
export function SubmitButton({ enabled, onClick, children }) {
  if (enabled) {
    return (
      <button onClick={onClick} style={{ width: '100%', cursor: 'pointer', border: 'none', padding: '15px 0', borderRadius: 12, background: T.btnGrad, color: T.onGold, fontFamily: FONT.sans, fontSize: 15, fontWeight: 700, boxShadow: '0 14px 30px -12px rgba(201,149,43,0.7)' }}>
        {children}
      </button>
    )
  }
  return (
    <button disabled style={{ width: '100%', cursor: 'not-allowed', border: 'none', padding: '15px 0', borderRadius: 12, background: 'rgba(255,255,255,0.06)', color: T.mutedDim, fontFamily: FONT.sans, fontSize: 15, fontWeight: 600 }}>
      {children}
    </button>
  )
}

// chip preset nominal
const chip = { cursor: 'pointer', border: `1px solid ${T.border}`, background: T.surface2, color: T.inkSoft, padding: '8px 14px', borderRadius: 10, fontFamily: FONT.mono, fontSize: 13 }

// Style yang di-export agar modal lain konsisten secara visual
export const modalTitle = { fontFamily: FONT.display, fontWeight: 600, fontSize: 20, margin: 0, color: T.ink }
export const closeBtn   = { cursor: 'pointer', background: 'rgba(255,255,255,0.05)', border: `1px solid ${T.border}`, color: T.muted, width: 34, height: 34, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }
export const label      = { display: 'block', fontSize: 13, fontWeight: 600, color: T.inkSoft, marginBottom: 8 }
