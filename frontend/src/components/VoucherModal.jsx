import { useState } from 'react'
import { apiPost } from '../lib/api.js'
import { Overlay, ModalCard, SubmitButton, closeBtn, modalTitle } from './TopUpModal.jsx'
import { T, FONT } from '../lib/theme.js'
import { CloseIcon, GiftIcon, CheckIcon, AlertIcon } from './icons.jsx'

export default function VoucherModal({ onClose, onDone }) {
  const [code, setCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const canSubmit = code.trim().length >= 3 && !submitting

  const submit = async () => {
    if (!canSubmit) return
    setError(null)
    setSuccess(null)
    setSubmitting(true)
    try {
      const res = await apiPost('/vouchers/redeem', { code: code.trim() })
      setSuccess(res.message || 'Voucher berhasil diredeem!')
      setTimeout(() => onDone(res), 1200)
    } catch (e) {
      setError(e?.data?.message || e.message || 'Gagal redeem voucher.')
      setSubmitting(false)
    }
  }

  return (
    <Overlay onClose={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: 400, maxWidth: '100%', background: T.surface, borderRadius: 22, overflow: 'hidden', border: `1px solid ${T.border}`, boxShadow: '0 40px 90px -24px rgba(0,0,0,0.85)', animation: 'popIn .24s cubic-bezier(.2,.8,.3,1)' }}>
        <div style={{ height: 4, background: T.btnGrad }} />
        <div style={{ padding: '22px 24px 26px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: T.goldSoft, color: T.goldBright, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <GiftIcon size={20} />
              </div>
              <h3 style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 20, margin: 0, color: T.ink }}>Redeem Voucher</h3>
            </div>
            <button onClick={onClose} style={closeBtn} aria-label="Tutup"><CloseIcon size={18} /></button>
          </div>

          {success ? (
            <div style={{ padding: '20px 0', textAlign: 'center' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(52,211,153,0.15)', color: '#5BC98C', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <CheckIcon size={28} strokeWidth={2.5} />
              </div>
              <div style={{ fontSize: 16, fontWeight: 600, color: T.ink, marginBottom: 4 }}>Berhasil!</div>
              <div style={{ fontSize: 14, color: T.muted }}>{success}</div>
            </div>
          ) : (
            <>
              <p style={{ fontSize: 14, color: T.muted, margin: '0 0 18px' }}>Masukkan kode voucher untuk mendapatkan saldo gratis.</p>

              {error && (
                <div style={{ marginBottom: 16, padding: '12px 14px', borderRadius: 12, background: 'rgba(251,113,133,0.12)', border: '1px solid rgba(251,113,133,0.3)', display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ color: T.outRose, display: 'flex' }}><AlertIcon size={15} /></span>
                  <span style={{ fontSize: 14, color: T.outRose, fontWeight: 500 }}>{error}</span>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px', height: 54, borderRadius: 12, border: `1.5px solid ${error ? T.outRose : T.border}`, background: T.surface2 }}>
                <input
                  value={code}
                  onChange={e => { setCode(e.target.value.toUpperCase()); setError(null) }}
                  onKeyDown={e => { if (e.key === 'Enter') submit() }}
                  placeholder="Masukkan kode voucher"
                  autoFocus
                  style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontFamily: FONT.mono, fontSize: 16, color: T.ink, letterSpacing: '0.08em', textTransform: 'uppercase' }}
                />
              </div>

              <div style={{ marginTop: 22 }}>
                <SubmitButton enabled={canSubmit} onClick={submit}>
                  {submitting ? 'Memproses…' : 'Redeem'}
                </SubmitButton>
              </div>

              <div style={{ marginTop: 16, padding: '14px 16px', borderRadius: 12, background: T.surface2, border: `1px solid ${T.border}` }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: T.inkSoft, marginBottom: 8 }}>Voucher tersedia:</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { code: 'WELCOME10',  desc: 'Rp 10.000' },
                    { code: 'RAMADHAN25', desc: 'Rp 25.000' },
                    { code: 'BONUS50',    desc: 'Rp 50.000' },
                    { code: 'FREEBAL',    desc: 'Rp 15.000' },
                  ].map(v => (
                    <button key={v.code} onClick={() => { setCode(v.code); setError(null) }} style={{ cursor: 'pointer', background: 'transparent', border: `1px dashed ${T.border2}`, borderRadius: 8, padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: T.ink, fontFamily: FONT.mono, fontSize: 13 }}>
                      <span style={{ color: T.goldBright, fontWeight: 600 }}>{v.code}</span>
                      <span style={{ color: T.muted }}>{v.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </Overlay>
  )
}
