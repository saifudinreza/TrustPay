import { useMemo, useState } from 'react'
import { group, validateNominal, recipientStatus } from '../lib/wallet.js'
import { Overlay, Perforation, SubmitButton, modalTitle, closeBtn, label } from './TopUpModal.jsx'
import { CloseIcon, CheckIcon, AlertIcon } from './icons.jsx'

/**
 * TransferModal — slip input transfer ke user lain.
 *
 * Alur:
 *  1. User ketik identifier penerima (email / nomor HP / @username)
 *  2. recipientStatus() cek di direktori lokal → tampilkan preview nama atau error
 *  3. User isi nominal + catatan opsional
 *  4. Jika saldo kurang → tampilkan banner "Saldo tidak cukup"
 *  5. Submit → panggil onConfirm(nominal, displayName, catatan, recipientRaw)
 *
 * Catatan: validasi penerima di sini menggunakan direktori LOKAL (simulasi).
 * Validasi sesungguhnya ada di backend (WalletService.transfer) — jika penerima
 * tidak ditemukan di backend, error 422 akan muncul dari Dashboard via apiError.
 */
export default function TransferModal({ balance, onClose, onConfirm }) {
  const [recipient, setRecipient]       = useState('')
  const [recTouched, setRecTouched]     = useState(false) // apakah field penerima sudah disentuh
  const [raw, setRaw]                   = useState('')
  const [rawTouched, setRawTouched]     = useState(false) // apakah field nominal sudah disentuh
  const [note, setNote]                 = useState('')
  const [balanceError, setBalanceError] = useState(false) // saldo tidak cukup
  const [submitting, setSubmitting]     = useState(false)

  // Status penerima: 'empty' | 'found' | 'notfound' | 'self'
  const rec = useMemo(() => recipientStatus(recipient), [recipient])
  const v   = useMemo(() => validateNominal(raw), [raw])

  const recShowPreview = rec.status === 'found'
  const recShowError   = rec.status === 'self' || (rec.status === 'notfound' && recTouched)
  const recError       = rec.status === 'self' ? 'Tidak dapat transfer ke diri sendiri.' : 'Penerima tidak ditemukan.'
  const nominalShowError = rawTouched && !!v.err
  // Aktifkan submit hanya jika penerima ditemukan + nominal valid + tidak sedang loading
  const canSubmit      = rec.status === 'found' && !v.err && !submitting

  const onNominalBlur = () => {
    if (!v.err) setRaw(group(v.n)) // format ribuan saat blur
    setRawTouched(true)
  }

  const submit = () => {
    if (rec.status !== 'found' || v.err || submitting) {
      // Tampilkan semua error jika user langsung klik submit tanpa isi form
      setRecTouched(true)
      setRawTouched(true)
      return
    }
    if (v.n > balance) { setBalanceError(true); return }
    setSubmitting(true)
    // Kirim recipientInput (raw) ke parent — backend yang mencocokkan email/HP/username
    setTimeout(() => onConfirm(v.n, 'ke ' + rec.name, note.trim(), recipient.trim()), 650)
  }

  const recBorder     = recShowError ? '#7A3142' : 'rgba(23,25,29,0.18)'
  const nominalBorder = nominalShowError ? '#7A3142' : 'rgba(23,25,29,0.18)'

  return (
    <Overlay onClose={onClose}>
      <div style={{ width: 440, maxWidth: '100%', background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 40px 80px -24px rgba(10,11,14,0.5)', animation: 'popIn .24s cubic-bezier(.2,.8,.3,1)' }} onClick={(e) => e.stopPropagation()}>
        <Perforation />
        <div style={{ padding: '24px 26px 26px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <h3 style={modalTitle}>Kirim Transfer</h3>
            <button onClick={onClose} style={closeBtn} aria-label="Tutup"><CloseIcon size={18} /></button>
          </div>

          {/* Field penerima — email, nomor HP, atau @username */}
          <label style={label}>Kirim ke (email atau no. HP)</label>
          <div style={{ display: 'flex', alignItems: 'center', padding: '0 14px', height: 50, borderRadius: 10, border: `1.5px solid ${recBorder}`, background: '#fbfcf9' }}>
            <input
              value={recipient}
              onChange={(e) => { setRecipient(e.target.value); setRecTouched(true); setBalanceError(false) }}
              onBlur={() => setRecTouched(true)}
              placeholder="@budi · @siti · @reza · @dewi"
              autoFocus
              style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 15, color: '#17191D' }}
            />
          </div>
          {/* Preview nama penerima (hijau = ditemukan) */}
          {recShowPreview && (
            <div style={{ marginTop: 8, fontSize: 13, color: '#2F6F4E', display: 'flex', alignItems: 'center', gap: 6 }}><CheckIcon size={14} /> Ditemukan: {rec.name}</div>
          )}
          {recShowError && (
            <div style={{ marginTop: 8, fontFamily: "'IBM Plex Mono',monospace", fontSize: 12, color: '#7A3142' }}>{recError}</div>
          )}

          {/* Field nominal */}
          <label style={{ ...label, margin: '18px 0 8px' }}>Nominal</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px', height: 50, borderRadius: 10, border: `1.5px solid ${nominalBorder}`, background: '#fbfcf9' }}>
            <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 16, color: '#5C6B73' }}>Rp</span>
            <input
              value={raw}
              onChange={(e) => { setRaw(e.target.value); setRawTouched(true); setBalanceError(false) }}
              onBlur={onNominalBlur}
              inputMode="numeric"
              placeholder="0"
              style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontFamily: "'IBM Plex Mono',monospace", fontSize: 18, color: '#17191D', fontFeatureSettings: "'tnum'" }}
            />
          </div>
          {nominalShowError && (
            <div style={{ marginTop: 8, fontFamily: "'IBM Plex Mono',monospace", fontSize: 12, color: '#7A3142' }}>{v.err}</div>
          )}

          {/* Field catatan (opsional) */}
          <label style={{ ...label, margin: '18px 0 8px' }}>
            Catatan <span style={{ fontWeight: 400, color: '#5C6B73' }}>(opsional)</span>
          </label>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="mis. bayar makan siang"
            style={{ width: '100%', height: 48, padding: '0 14px', borderRadius: 10, border: '1.5px solid rgba(23,25,29,0.18)', background: '#fbfcf9', outline: 'none', fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 15, color: '#17191D' }}
          />

          {/* Banner saldo tidak cukup — muncul setelah user klik submit dengan saldo kurang */}
          {balanceError && (
            <div style={{ marginTop: 18, padding: '12px 14px', borderRadius: 10, background: 'rgba(122,49,66,0.08)', border: '1px solid rgba(122,49,66,0.25)', display: 'flex', alignItems: 'center', gap: 9 }}>
              <span style={{ color: '#7A3142', display: 'flex' }}><AlertIcon size={16} /></span>
              <span style={{ fontSize: 14, fontWeight: 500, color: '#7A3142' }}>Saldo tidak cukup.</span>
            </div>
          )}

          <div style={{ marginTop: 22 }}>
            <SubmitButton enabled={canSubmit} onClick={submit}>
              {submitting ? 'Memproses…' : 'Kirim Transfer'}
            </SubmitButton>
          </div>
        </div>
      </div>
    </Overlay>
  )
}
