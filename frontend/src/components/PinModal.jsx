import { useEffect, useState } from 'react'
import { Overlay, ModalCard } from './TopUpModal.jsx'
import PinPad from './PinPad.jsx'
import { T, FONT } from '../lib/theme.js'
import { LockIcon, AlertIcon } from './icons.jsx'

/**
 * PinModal — GERBANG KEAMANAN sebelum setiap transaksi keluar (transfer & pembayaran).
 *
 * Alur:
 *  1. User sudah mengisi detail (nominal, penerima/tagihan) di modal sebelumnya.
 *  2. PinModal muncul → user mengetik PIN 6 digit.
 *  3. Saat 6 digit terisi → otomatis memanggil `onSubmit(pin)` (async).
 *  4. Jika PIN salah (backend balas 422) → tampilkan error, reset input.
 *
 * Props:
 *  - title    : judul (mis. "Konfirmasi PIN")
 *  - summary  : ringkasan transaksi (mis. "Transfer Rp 150.000 ke @user")
 *  - onSubmit : async (pin) => any — lempar error jika gagal (mis. PIN salah)
 *  - onClose  : tutup modal
 */
export default function PinModal({ title = 'Konfirmasi PIN', summary, onSubmit, onClose }) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Auto-submit ketika PIN sudah 6 digit.
  useEffect(() => {
    if (pin.length === 6 && !submitting) {
      run()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin])

  const run = async () => {
    setSubmitting(true)
    setError('')
    try {
      await onSubmit(pin)
      // Sukses: parent menutup modal & menampilkan stempel berhasil.
    } catch (e) {
      const msg = e?.data?.message || e?.message || 'PIN salah. Coba lagi.'
      setError(msg)
      setPin('')
      setSubmitting(false)
    }
  }

  return (
    <Overlay onClose={submitting ? () => {} : onClose}>
      <ModalCard title={title} icon={<LockIcon size={20} />} onClose={onClose} width={400}>
        <p style={{ margin: '-6px 0 4px', fontSize: 13.5, color: T.muted, lineHeight: 1.5 }}>
          Masukkan 6 digit PIN transaksi untuk mengamankan dana kamu.
        </p>
        {summary && (
          <div style={{ margin: '14px 0 18px', padding: '12px 14px', borderRadius: 12, background: T.goldSoft, border: `1px solid ${T.border2}`, color: T.ink, fontSize: 14, fontWeight: 500, textAlign: 'center', fontFamily: FONT.sans }}>
            {summary}
          </div>
        )}

        <PinPad value={pin} onChange={(v) => { setError(''); setPin(v) }} error={!!error} disabled={submitting} />

        {error && (
          <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: T.outRose, fontSize: 13.5, fontWeight: 500 }}>
            <AlertIcon size={16} /> {error}
          </div>
        )}
        {submitting && !error && (
          <div style={{ marginTop: 16, textAlign: 'center', color: T.muted, fontSize: 13.5, fontFamily: FONT.mono }}>
            Memverifikasi…
          </div>
        )}

        <div style={{ marginTop: 18, textAlign: 'center' }}>
          <span style={{ fontSize: 12, color: T.mutedDim }}>Lupa PIN? Ubah di halaman Profil.</span>
        </div>
      </ModalCard>
    </Overlay>
  )
}
