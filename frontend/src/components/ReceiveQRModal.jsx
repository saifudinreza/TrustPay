import { QRCodeSVG } from 'qrcode.react'
import { Overlay, ModalCard } from './TopUpModal.jsx'
import { T, FONT } from '../lib/theme.js'
import { QrIcon } from './icons.jsx'

/**
 * ReceiveQRModal — modal QR code "Terima Uang" (tema gelap + ungu).
 *
 * QR statis berisi payload identitas penerima. Pengirim scan untuk mengisi
 * field penerima di TransferModal. Nominal diisi oleh pengirim (lebih fleksibel).
 */
export default function ReceiveQRModal({ user, onClose }) {
  const me = user || { name: 'Saya', username: '@saya', account: '—' }
  const initial = (me.name || 'U').trim().charAt(0).toUpperCase()

  const payload = JSON.stringify({
    app: 'TrustPay',
    type: 'RECEIVE',
    name: me.name,
    username: me.username,
    account: me.account,
  })

  return (
    <Overlay onClose={onClose}>
      <ModalCard title="Terima Uang" icon={<QrIcon size={20} />} onClose={onClose} width={380}>
        <p style={{ margin: '-6px 0 18px', fontSize: 13, color: T.muted }}>Tunjukkan QR ini untuk menerima transfer.</p>

        <div style={{ border: `1px solid ${T.border}`, borderRadius: 18, padding: 22, display: 'flex', flexDirection: 'column', alignItems: 'center', background: T.surface2 }}>
          {/* QR code di atas latar putih agar tetap mudah di-scan */}
          <div style={{ background: '#fff', padding: 14, borderRadius: 14, boxShadow: '0 12px 30px -16px rgba(0,0,0,0.6)' }}>
            <QRCodeSVG value={payload} size={184} level="M" fgColor="#1A0B2E" bgColor="#ffffff" />
          </div>
          <div style={{ marginTop: 18, textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ width: 28, height: 28, borderRadius: '50%', background: T.btnGrad, color: T.onGold, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT.display, fontWeight: 700, fontSize: 13 }}>{initial}</span>
              <span style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 18, color: T.ink }}>{me.name}</span>
            </div>
            <div style={{ fontFamily: FONT.mono, fontSize: 13, color: T.muted }}>{me.username}</div>
            <div style={{ fontFamily: FONT.mono, fontSize: 15, letterSpacing: '0.08em', color: T.ink, marginTop: 8, fontFeatureSettings: "'tnum'" }}>{me.account}</div>
          </div>
        </div>

        <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 9, padding: '10px 12px', borderRadius: 12, background: T.goldSoft, border: `1px solid ${T.border2}` }}>
          <span style={{ color: T.goldBright, display: 'flex' }}><QrIcon size={15} /></span>
          <span style={{ fontSize: 12.5, color: T.inkSoft, lineHeight: 1.4 }}>QR statis — nominal diisi oleh pengirim saat scan.</span>
        </div>
      </ModalCard>
    </Overlay>
  )
}
