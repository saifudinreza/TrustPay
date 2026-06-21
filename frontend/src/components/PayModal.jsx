import { useMemo, useState } from 'react'
import { group, validateNominal, fmtRp } from '../lib/wallet.js'
import { Overlay, Perforation, SubmitButton, modalTitle, closeBtn, label } from './TopUpModal.jsx'
import { CloseIcon, AlertIcon } from './icons.jsx'

// Quick-action bill payment (Pulsa / PLN / Air / Internet). Simulated payment =
// a KELUAR transaction. Reuses the slip design + the same nominal validation,
// plus a customer-number field and optional preset amounts.
export default function PayModal({ service, balance, onClose, onConfirm }) {
  const [customer, setCustomer] = useState('')
  const [custTouched, setCustTouched] = useState(false)
  const [raw, setRaw] = useState('')
  const [rawTouched, setRawTouched] = useState(false)
  const [balanceError, setBalanceError] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const v = useMemo(() => validateNominal(raw), [raw])
  const custValid = customer.trim().length >= 4
  const custShowError = custTouched && !custValid
  const nominalShowError = rawTouched && !!v.err
  const canSubmit = custValid && !v.err && !submitting

  const onNominalBlur = () => {
    if (!v.err) setRaw(group(v.n))
    setRawTouched(true)
  }

  const pickPreset = (n) => {
    setRaw(group(n))
    setRawTouched(true)
    setBalanceError(false)
  }

  const submit = () => {
    if (!custValid || v.err || submitting) {
      setCustTouched(true)
      setRawTouched(true)
      return
    }
    if (v.n > balance) { setBalanceError(true); return }
    setSubmitting(true)
    const counterparty = `${service.label} · ${customer.trim()}`
    const description = `Pembayaran ${service.label}`
    setTimeout(() => onConfirm({ amount: v.n, counterparty, description }), 650)
  }

  const custBorder = custShowError ? '#7A3142' : 'rgba(17,32,61,0.18)'
  const nominalBorder = nominalShowError ? '#7A3142' : 'rgba(17,32,61,0.18)'

  return (
    <Overlay onClose={onClose}>
      <div style={{ width: 440, maxWidth: '100%', background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 40px 80px -24px rgba(13,24,48,0.5)', animation: 'popIn .24s cubic-bezier(.2,.8,.3,1)' }} onClick={(e) => e.stopPropagation()}>
        <Perforation />
        <div style={{ padding: '24px 26px 26px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 11, background: 'rgba(201,138,43,0.12)', color: '#C98A2B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <service.Icon size={20} />
              </div>
              <h3 style={modalTitle}>{service.label}</h3>
              <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#C98A2B', border: '1px solid rgba(201,138,43,0.5)', borderRadius: 999, padding: '2px 8px' }}>Simulasi</span>
            </div>
            <button onClick={onClose} style={closeBtn} aria-label="Tutup"><CloseIcon size={18} /></button>
          </div>

          <label style={label}>{service.field}</label>
          <div style={{ display: 'flex', alignItems: 'center', padding: '0 14px', height: 50, borderRadius: 10, border: `1.5px solid ${custBorder}`, background: '#fbfcf9' }}>
            <input
              value={customer}
              onChange={(e) => { setCustomer(e.target.value); setCustTouched(true) }}
              onBlur={() => setCustTouched(true)}
              placeholder={service.placeholder}
              autoFocus
              style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontFamily: "'IBM Plex Mono',monospace", fontSize: 15, color: '#11203D' }}
            />
          </div>
          {custShowError && (
            <div style={{ marginTop: 8, fontFamily: "'IBM Plex Mono',monospace", fontSize: 12, color: '#7A3142' }}>{service.label === 'Pulsa' ? 'Nomor tidak valid.' : 'ID pelanggan tidak valid.'}</div>
          )}

          <label style={{ ...label, margin: '18px 0 8px' }}>Nominal</label>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
            {service.presets.map((p) => (
              <button key={p} onClick={() => pickPreset(p)} style={{ cursor: 'pointer', border: '1px solid rgba(17,32,61,0.18)', background: '#fbfcf9', color: '#11203D', padding: '7px 12px', borderRadius: 8, fontFamily: "'IBM Plex Mono',monospace", fontSize: 12.5 }}>
                {fmtRp(p)}
              </button>
            ))}
          </div>
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

          {balanceError && (
            <div style={{ marginTop: 18, padding: '12px 14px', borderRadius: 10, background: 'rgba(122,49,66,0.08)', border: '1px solid rgba(122,49,66,0.25)', display: 'flex', alignItems: 'center', gap: 9 }}>
              <span style={{ color: '#7A3142', display: 'flex' }}><AlertIcon size={16} /></span>
              <span style={{ fontSize: 14, fontWeight: 500, color: '#7A3142' }}>Saldo tidak cukup.</span>
            </div>
          )}

          <div style={{ marginTop: 22 }}>
            <SubmitButton enabled={canSubmit} onClick={submit}>
              {submitting ? 'Memproses…' : `Bayar ${service.label}`}
            </SubmitButton>
          </div>
        </div>
      </div>
    </Overlay>
  )
}
