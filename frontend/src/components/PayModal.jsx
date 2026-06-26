import { useMemo, useState } from 'react'
import { group, validateNominal, fmtRp } from '../lib/wallet.js'
import { Overlay, ModalCard, SubmitButton, label } from './TopUpModal.jsx'
import { T, FONT } from '../lib/theme.js'
import { AlertIcon } from './icons.jsx'

/**
 * PayModal — pembayaran tagihan (Pulsa / Listrik PLN / Air PDAM / Internet).
 *
 * Murni demo: TIDAK ada merchant khusus. User memasukkan nomor pelanggan + nominal,
 * lalu saldo otomatis terpotong via endpoint /pay (dengan verifikasi PIN di langkah
 * berikutnya). Modal ini hanya mengumpulkan detail lalu memanggil onConfirm.
 *
 * onConfirm({ amount, counterparty, description })
 */
export default function PayModal({ service, balance, onClose, onConfirm }) {
  const [customer, setCustomer]       = useState('')
  const [custTouched, setCustTouched] = useState(false)
  const [raw, setRaw]                 = useState('')
  const [rawTouched, setRawTouched]   = useState(false)
  const [balanceError, setBalanceError] = useState(false)

  const v = useMemo(() => validateNominal(raw), [raw])
  const custValid = customer.trim().length >= 4
  const custShowError = custTouched && !custValid
  const nominalShowError = rawTouched && !!v.err
  const canSubmit = custValid && !v.err

  const onNominalBlur = () => {
    if (!v.err) setRaw(group(v.n))
    setRawTouched(true)
  }

  const pickPreset = (n) => { setRaw(group(n)); setRawTouched(true); setBalanceError(false) }

  const submit = () => {
    if (!custValid || v.err) { setCustTouched(true); setRawTouched(true); return }
    if (v.n > balance) { setBalanceError(true); return }
    const counterparty = `${service.label} · ${customer.trim()}`
    const description  = `Pembayaran ${service.label}`
    onConfirm({ amount: v.n, counterparty, description })
  }

  return (
    <Overlay onClose={onClose}>
      <ModalCard title={service.label} icon={<service.Icon size={20} />} onClose={onClose}>
        <div style={{ marginBottom: 16, fontSize: 13, color: T.muted }}>
          Saldo tersedia: <span style={{ color: T.ink, fontWeight: 600, fontFamily: FONT.mono }}>{fmtRp(balance)}</span>
        </div>

        <label style={label}>{service.field}</label>
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 14px', height: 52, borderRadius: 12, border: `1.5px solid ${custShowError ? T.outRose : T.border}`, background: T.surface2 }}>
          <input
            value={customer}
            onChange={(e) => { setCustomer(e.target.value); setCustTouched(true) }}
            onBlur={() => setCustTouched(true)}
            placeholder={service.placeholder}
            autoFocus
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontFamily: FONT.mono, fontSize: 15, color: T.ink }}
          />
        </div>
        {custShowError && (
          <div style={{ marginTop: 8, fontFamily: FONT.mono, fontSize: 12, color: T.outRose }}>
            {service.label === 'Pulsa' ? 'Nomor tidak valid.' : 'ID pelanggan tidak valid.'}
          </div>
        )}

        <label style={{ ...label, margin: '18px 0 8px' }}>Nominal</label>
        <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
          {service.presets.map((p) => (
            <button key={p} onClick={() => pickPreset(p)} style={{ cursor: 'pointer', border: `1px solid ${T.border}`, background: T.surface2, color: T.inkSoft, padding: '8px 13px', borderRadius: 10, fontFamily: FONT.mono, fontSize: 12.5 }}>
              {fmtRp(p)}
            </button>
          ))}
        </div>
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
