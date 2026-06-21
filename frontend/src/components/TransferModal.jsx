import { useMemo, useState } from 'react'
import { group, validateNominal, recipientStatus } from '../lib/wallet.js'
import { Overlay, Perforation, SubmitButton, modalTitle, closeBtn, label } from './TopUpModal.jsx'
import { CloseIcon, CheckIcon, AlertIcon } from './icons.jsx'

// Transfer modal — recipient lookup with preview, nominal validation, optional note,
// business-rule "Saldo tidak cukup" banner. Ported from the design.
export default function TransferModal({ balance, onClose, onConfirm }) {
  const [recipient, setRecipient] = useState('')
  const [recTouched, setRecTouched] = useState(false)
  const [raw, setRaw] = useState('')
  const [rawTouched, setRawTouched] = useState(false)
  const [note, setNote] = useState('')
  const [balanceError, setBalanceError] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const rec = useMemo(() => recipientStatus(recipient), [recipient])
  const v = useMemo(() => validateNominal(raw), [raw])

  const recShowPreview = rec.status === 'found'
  const recShowError = rec.status === 'self' || (rec.status === 'notfound' && recTouched)
  const recError = rec.status === 'self' ? 'Tidak dapat transfer ke diri sendiri.' : 'Penerima tidak ditemukan.'
  const nominalShowError = rawTouched && !!v.err
  const canSubmit = rec.status === 'found' && !v.err && !submitting

  const onNominalBlur = () => {
    if (!v.err) setRaw(group(v.n))
    setRawTouched(true)
  }

  const submit = () => {
    if (rec.status !== 'found' || v.err || submitting) {
      setRecTouched(true)
      setRawTouched(true)
      return
    }
    if (v.n > balance) { setBalanceError(true); return }
    setSubmitting(true)
    setTimeout(() => onConfirm(v.n, 'ke ' + rec.name, note.trim(), recipient.trim()), 650)
  }

  const recBorder = recShowError ? '#7A3142' : 'rgba(17,32,61,0.18)'
  const nominalBorder = nominalShowError ? '#7A3142' : 'rgba(17,32,61,0.18)'

  return (
    <Overlay onClose={onClose}>
      <div style={{ width: 440, maxWidth: '100%', background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 40px 80px -24px rgba(13,24,48,0.5)', animation: 'popIn .24s cubic-bezier(.2,.8,.3,1)' }} onClick={(e) => e.stopPropagation()}>
        <Perforation />
        <div style={{ padding: '24px 26px 26px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <h3 style={modalTitle}>Kirim Transfer</h3>
            <button onClick={onClose} style={closeBtn} aria-label="Tutup"><CloseIcon size={18} /></button>
          </div>

          {/* recipient */}
          <label style={label}>Kirim ke (email atau no. HP)</label>
          <div style={{ display: 'flex', alignItems: 'center', padding: '0 14px', height: 50, borderRadius: 10, border: `1.5px solid ${recBorder}`, background: '#fbfcf9' }}>
            <input
              value={recipient}
              onChange={(e) => { setRecipient(e.target.value); setRecTouched(true); setBalanceError(false) }}
              onBlur={() => setRecTouched(true)}
              placeholder="@budi · @siti · @reza · @dewi"
              autoFocus
              style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 15, color: '#11203D' }}
            />
          </div>
          {recShowPreview && (
            <div style={{ marginTop: 8, fontSize: 13, color: '#2F6F4E', display: 'flex', alignItems: 'center', gap: 6 }}><CheckIcon size={14} /> Ditemukan: {rec.name}</div>
          )}
          {recShowError && (
            <div style={{ marginTop: 8, fontFamily: "'IBM Plex Mono',monospace", fontSize: 12, color: '#7A3142' }}>{recError}</div>
          )}

          {/* nominal */}
          <label style={{ ...label, margin: '18px 0 8px' }}>Nominal</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px', height: 50, borderRadius: 10, border: `1.5px solid ${nominalBorder}`, background: '#fbfcf9' }}>
            <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 16, color: '#5C6B73' }}>Rp</span>
            <input
              value={raw}
              onChange={(e) => { setRaw(e.target.value); setRawTouched(true); setBalanceError(false) }}
              onBlur={onNominalBlur}
              inputMode="numeric"
              placeholder="0"
              style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontFamily: "'IBM Plex Mono',monospace", fontSize: 18, color: '#11203D', fontFeatureSettings: "'tnum'" }}
            />
          </div>
          {nominalShowError && (
            <div style={{ marginTop: 8, fontFamily: "'IBM Plex Mono',monospace", fontSize: 12, color: '#7A3142' }}>{v.err}</div>
          )}

          {/* note */}
          <label style={{ ...label, margin: '18px 0 8px' }}>
            Catatan <span style={{ fontWeight: 400, color: '#5C6B73' }}>(opsional)</span>
          </label>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="mis. bayar makan siang"
            style={{ width: '100%', height: 48, padding: '0 14px', borderRadius: 10, border: '1.5px solid rgba(17,32,61,0.18)', background: '#fbfcf9', outline: 'none', fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 15, color: '#11203D' }}
          />

          {/* business-rule banner */}
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
