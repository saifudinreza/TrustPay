import { useMemo, useState } from 'react'
import { group, validateNominal, SELF } from '../lib/wallet.js'
import { Overlay, Perforation, SubmitButton, modalTitle, closeBtn, label } from './TopUpModal.jsx'
import { CloseIcon, AlertIcon, UserIcon } from './icons.jsx'

/**
 * TransferModal — slip input transfer ke user lain.
 *
 * Validasi penerima: cukup pastikan tidak kosong dan bukan diri sendiri.
 * Pengecekan apakah user benar-benar ada dilakukan oleh backend (/api/transfer)
 * — jika tidak ditemukan, error 422 akan muncul di banner Dashboard.
 *
 * Alur:
 *  1. User ketik identifier (email / nomor HP / @username)
 *  2. User isi nominal + catatan opsional
 *  3. Submit → onConfirm(nominal, displayName, catatan, recipientRaw)
 */
export default function TransferModal({ balance, onClose, onConfirm }) {
  const [recipient, setRecipient]       = useState('')
  const [recTouched, setRecTouched]     = useState(false)
  const [raw, setRaw]                   = useState('')
  const [rawTouched, setRawTouched]     = useState(false)
  const [note, setNote]                 = useState('')
  const [balanceError, setBalanceError] = useState(false)
  const [submitting, setSubmitting]     = useState(false)

  const trimmed = recipient.trim()

  // Cek apakah penerima adalah diri sendiri (SELF list dari wallet.js)
  const isSelf = SELF.includes(trimmed.toLowerCase()) || SELF.includes('@' + trimmed.toLowerCase())
  const isEmpty = trimmed === ''
  // Valid: ada isi, bukan diri sendiri
  const recValid = !isEmpty && !isSelf

  const v   = useMemo(() => validateNominal(raw), [raw])

  const recShowError   = recTouched && (isEmpty || isSelf)
  const recError       = isSelf ? 'Tidak dapat transfer ke diri sendiri.' : 'Masukkan email, nomor HP, atau @username penerima.'
  const nominalShowError = rawTouched && !!v.err

  const canSubmit = recValid && !v.err && !submitting

  const onNominalBlur = () => {
    if (!v.err) setRaw(group(v.n))
    setRawTouched(true)
  }

  const submit = () => {
    if (!recValid || v.err || submitting) {
      setRecTouched(true)
      setRawTouched(true)
      return
    }
    if (v.n > balance) { setBalanceError(true); return }
    setSubmitting(true)
    setTimeout(() => onConfirm(v.n, 'ke ' + trimmed, note.trim(), trimmed), 650)
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

          {/* Field penerima */}
          <label style={label}>Kirim ke</label>
          <div style={{ display: 'flex', alignItems: 'center', padding: '0 14px', height: 50, borderRadius: 10, border: `1.5px solid ${recBorder}`, background: '#fbfcf9', gap: 10 }}>
            <span style={{ color: '#5C6B73', display: 'flex' }}><UserIcon size={17} /></span>
            <input
              value={recipient}
              onChange={(e) => { setRecipient(e.target.value); setRecTouched(true); setBalanceError(false) }}
              onBlur={() => setRecTouched(true)}
              placeholder="Email, nomor HP, atau @username"
              autoFocus
              style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 15, color: '#17191D' }}
            />
          </div>
          {recShowError && (
            <div style={{ marginTop: 8, fontFamily: "'IBM Plex Mono',monospace", fontSize: 12, color: '#7A3142' }}>{recError}</div>
          )}
          {/* hint saat valid tapi belum diverifikasi server */}
          {recValid && recTouched && (
            <div style={{ marginTop: 7, fontSize: 13, color: '#5C6B73' }}>
              Validasi penerima dilakukan saat transfer diproses.
            </div>
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

          {/* Field catatan */}
          <label style={{ ...label, margin: '18px 0 8px' }}>
            Catatan <span style={{ fontWeight: 400, color: '#5C6B73' }}>(opsional)</span>
          </label>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="mis. bayar makan siang"
            style={{ width: '100%', height: 48, padding: '0 14px', borderRadius: 10, border: '1.5px solid rgba(23,25,29,0.18)', background: '#fbfcf9', outline: 'none', fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 15, color: '#17191D' }}
          />

          {/* Saldo tidak cukup */}
          {balanceError && (
            <div style={{ marginTop: 18, padding: '12px 14px', borderRadius: 10, background: 'rgba(122,49,66,0.08)', border: '1px solid rgba(122,49,66,0.25)', display: 'flex', alignItems: 'center', gap: 9 }}>
              <span style={{ color: '#7A3142', display: 'flex' }}><AlertIcon size={16} /></span>
              <span style={{ fontSize: 14, fontWeight: 500, color: '#7A3142' }}>Saldo tidak cukup. Saldo Anda: Rp {raw}.</span>
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
