import { useMemo, useState } from 'react'
import { group, validateNominal, fmtRp, SELF } from '../lib/wallet.js'
import { Overlay, ModalCard, SubmitButton, label } from './TopUpModal.jsx'
import { T, FONT } from '../lib/theme.js'
import { AlertIcon, UserIcon, TransferIcon } from './icons.jsx'

/**
 * TransferModal — input transfer ke user lain (tema gelap + ungu).
 *
 * Modal ini HANYA mengumpulkan detail. Setelah "Lanjut", Dashboard membuka
 * PinModal sebagai gerbang keamanan, lalu memanggil API /transfer dengan PIN.
 *
 * Validasi penerima: tidak kosong & bukan diri sendiri. Keberadaan penerima
 * sesungguhnya divalidasi backend (/api/transfer) → error 422 muncul di banner.
 *
 * onConfirm(nominal, displayName, catatan, recipientRaw)
 */
export default function TransferModal({ balance, onClose, onConfirm }) {
  const [recipient, setRecipient]   = useState('')
  const [recTouched, setRecTouched] = useState(false)
  const [raw, setRaw]               = useState('')
  const [rawTouched, setRawTouched] = useState(false)
  const [note, setNote]             = useState('')
  const [balanceError, setBalanceError] = useState(false)

  const trimmed = recipient.trim()
  const isSelf = SELF.includes(trimmed.toLowerCase()) || SELF.includes('@' + trimmed.toLowerCase())
  const isEmpty = trimmed === ''
  const recValid = !isEmpty && !isSelf

  const v = useMemo(() => validateNominal(raw), [raw])

  const recShowError = recTouched && (isEmpty || isSelf)
  const recError = isSelf ? 'Tidak dapat transfer ke diri sendiri.' : 'Masukkan email, nomor HP, atau @username penerima.'
  const nominalShowError = rawTouched && !!v.err
  const canSubmit = recValid && !v.err

  const onNominalBlur = () => {
    if (!v.err) setRaw(group(v.n))
    setRawTouched(true)
  }

  const submit = () => {
    if (!recValid || v.err) { setRecTouched(true); setRawTouched(true); return }
    if (v.n > balance) { setBalanceError(true); return }
    onConfirm(v.n, 'ke ' + trimmed, note.trim(), trimmed)
  }

  return (
    <Overlay onClose={onClose}>
      <ModalCard title="Kirim Transfer" icon={<TransferIcon size={20} />} onClose={onClose}>
        {/* saldo tersedia */}
        <div style={{ marginBottom: 16, fontSize: 13, color: T.muted }}>
          Saldo tersedia: <span style={{ color: T.ink, fontWeight: 600, fontFamily: FONT.mono }}>{fmtRp(balance)}</span>
        </div>

        <label style={label}>Kirim ke</label>
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 14px', height: 52, borderRadius: 12, border: `1.5px solid ${recShowError ? T.outRose : T.border}`, background: T.surface2, gap: 10 }}>
          <span style={{ color: T.muted, display: 'flex' }}><UserIcon size={17} /></span>
          <input
            value={recipient}
            onChange={(e) => { setRecipient(e.target.value); setRecTouched(true); setBalanceError(false) }}
            onBlur={() => setRecTouched(true)}
            placeholder="Email, nomor HP, atau @username"
            autoFocus
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontFamily: FONT.sans, fontSize: 15, color: T.ink }}
          />
        </div>
        {recShowError && (
          <div style={{ marginTop: 8, fontFamily: FONT.mono, fontSize: 12, color: T.outRose }}>{recError}</div>
        )}

        <label style={{ ...label, margin: '18px 0 8px' }}>Nominal</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px', height: 52, borderRadius: 12, border: `1.5px solid ${nominalShowError ? T.outRose : T.border}`, background: T.surface2 }}>
          <span style={{ fontFamily: FONT.mono, fontSize: 16, color: T.muted }}>Rp</span>
          <input
            value={raw}
            onChange={(e) => { setRaw(e.target.value); setRawTouched(true); setBalanceError(false) }}
            onBlur={onNominalBlur}
            inputMode="numeric"
            placeholder="0"
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontFamily: FONT.mono, fontSize: 20, color: T.ink, fontFeatureSettings: "'tnum'" }}
          />
        </div>
        {nominalShowError && (
          <div style={{ marginTop: 8, fontFamily: FONT.mono, fontSize: 12, color: T.outRose }}>{v.err}</div>
        )}

        <label style={{ ...label, margin: '18px 0 8px' }}>
          Catatan <span style={{ fontWeight: 400, color: T.muted }}>(opsional)</span>
        </label>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="mis. bayar makan siang"
          style={{ width: '100%', height: 50, padding: '0 14px', borderRadius: 12, border: `1.5px solid ${T.border}`, background: T.surface2, outline: 'none', fontFamily: FONT.sans, fontSize: 15, color: T.ink }}
        />

        {balanceError && (
          <div style={{ marginTop: 18, padding: '12px 14px', borderRadius: 12, background: 'rgba(251,113,133,0.12)', border: '1px solid rgba(251,113,133,0.3)', display: 'flex', alignItems: 'center', gap: 9 }}>
            <span style={{ color: T.outRose, display: 'flex' }}><AlertIcon size={16} /></span>
            <span style={{ fontSize: 14, fontWeight: 500, color: T.outRose }}>Saldo tidak cukup.</span>
          </div>
        )}

        <div style={{ marginTop: 22 }}>
          <SubmitButton enabled={canSubmit} onClick={submit}>
            Lanjut · Verifikasi PIN
          </SubmitButton>
        </div>
      </ModalCard>
    </Overlay>
  )
}
