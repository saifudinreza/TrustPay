import { useState } from 'react'
import { Overlay, ModalCard, SubmitButton } from './TopUpModal.jsx'
import PinPad from './PinPad.jsx'
import useAuth from '../hooks/useAuth.js'
import { T, FONT } from '../lib/theme.js'
import { LockIcon, AlertIcon, CheckIcon } from './icons.jsx'

/**
 * PinSetupModal — atur (pertama kali) atau ubah PIN transaksi dari halaman Profil.
 *
 * Tahapan:
 *  - hasPin === true  → minta PIN LAMA dulu (current), lalu PIN baru + konfirmasi.
 *  - hasPin === false → langsung PIN baru + konfirmasi.
 *
 * Memanggil useAuth().setPin → POST /pin. Sukses → onDone(user).
 */
export default function PinSetupModal({ hasPin, onClose, onDone }) {
  // step: 'current' (pin lama) | 'new' | 'confirm'
  const [step, setStep] = useState(hasPin ? 'current' : 'new')
  const [currentPin, setCurrentPin] = useState('')
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { setPin } = useAuth()

  const titleByStep = {
    current: 'Masukkan PIN Lama',
    new: hasPin ? 'Buat PIN Baru' : 'Buat PIN Transaksi',
    confirm: 'Ulangi PIN Baru',
  }
  const helpByStep = {
    current: 'Verifikasi dulu dengan PIN kamu saat ini.',
    new: 'PIN 6 digit ini dipakai untuk mengonfirmasi setiap transaksi.',
    confirm: 'Ketik ulang PIN baru untuk memastikan tidak salah.',
  }

  const value = step === 'current' ? currentPin : step === 'new' ? newPin : confirmPin
  const setValue = (v) => {
    setError('')
    if (step === 'current') setCurrentPin(v)
    else if (step === 'new') setNewPin(v)
    else setConfirmPin(v)

    // Pindah langkah otomatis saat 6 digit terisi.
    if (v.length === 6) {
      if (step === 'current') setStep('new')
      else if (step === 'new') setStep('confirm')
      else submit(v)
    }
  }

  const submit = async (confirmValue) => {
    if (newPin !== confirmValue) {
      setError('PIN baru dan konfirmasi tidak cocok.')
      setConfirmPin('')
      setStep('new')
      setNewPin('')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const user = await setPin({ pin: newPin, currentPin: hasPin ? currentPin : undefined })
      onDone?.(user)
    } catch (e) {
      const msg = e?.data?.message || e?.message || 'Gagal menyimpan PIN.'
      setError(msg)
      // reset ke awal agar user ulangi
      setCurrentPin(''); setNewPin(''); setConfirmPin('')
      setStep(hasPin ? 'current' : 'new')
      setSubmitting(false)
    }
  }

  return (
    <Overlay onClose={submitting ? () => {} : onClose}>
      <ModalCard title={titleByStep[step]} icon={<LockIcon size={20} />} onClose={onClose} width={400}>
        {/* indikator langkah */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
          {(hasPin ? ['current', 'new', 'confirm'] : ['new', 'confirm']).map((s) => (
            <span key={s} style={{ width: 26, height: 4, borderRadius: 2, background: s === step ? T.goldBright : T.border }} />
          ))}
        </div>

        <p style={{ margin: '0 0 18px', fontSize: 13.5, color: T.muted, lineHeight: 1.5, textAlign: 'center' }}>
          {helpByStep[step]}
        </p>

        <PinPad value={value} onChange={setValue} error={!!error} disabled={submitting} />

        {error && (
          <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: T.outRose, fontSize: 13.5, fontWeight: 500 }}>
            <AlertIcon size={16} /> {error}
          </div>
        )}
        {submitting && (
          <div style={{ marginTop: 16, textAlign: 'center', color: T.muted, fontSize: 13.5, fontFamily: FONT.mono }}>Menyimpan…</div>
        )}

        {/* Tombol kembali antar langkah (opsional) */}
        {step !== (hasPin ? 'current' : 'new') && !submitting && (
          <div style={{ marginTop: 16 }}>
            <button
              onClick={() => { setError(''); setStep(step === 'confirm' ? 'new' : 'current'); setConfirmPin(''); if (step === 'confirm') setNewPin('') }}
              style={{ width: '100%', cursor: 'pointer', background: 'transparent', border: `1px solid ${T.border}`, color: T.inkSoft, padding: '11px 0', borderRadius: 12, fontFamily: FONT.sans, fontSize: 14, fontWeight: 600 }}
            >
              Kembali
            </button>
          </div>
        )}
      </ModalCard>
    </Overlay>
  )
}
