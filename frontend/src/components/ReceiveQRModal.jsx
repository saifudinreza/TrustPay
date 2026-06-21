import { QRCodeSVG } from 'qrcode.react'
import { ME } from '../lib/wallet.js'
import { Overlay, Perforation, closeBtn } from './TopUpModal.jsx'
import { CloseIcon, QrIcon } from './icons.jsx'

// Static "terima uang" QR — profile + account number. The QR encodes a simple
// payment payload that another TrustPay user could scan to pre-fill a transfer.
export default function ReceiveQRModal({ user, onClose }) {
  const me = user || ME
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
      <div style={{ width: 380, maxWidth: '100%', background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 40px 80px -24px rgba(13,24,48,0.5)', animation: 'popIn .24s cubic-bezier(.2,.8,.3,1)' }} onClick={(e) => e.stopPropagation()}>
        <Perforation />
        <div style={{ padding: '22px 26px 26px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 500, fontSize: 20, margin: 0, color: '#11203D' }}>Terima Uang</h3>
            <button onClick={onClose} style={closeBtn} aria-label="Tutup"><CloseIcon size={18} /></button>
          </div>
          <p style={{ margin: '0 0 18px', fontSize: 13, color: '#5C6B73' }}>Tunjukkan QR ini untuk menerima transfer.</p>

          {/* QR card */}
          <div style={{ border: '1.5px solid rgba(17,32,61,0.12)', borderRadius: 16, padding: 22, display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#fbfcf9' }}>
            <div style={{ background: '#fff', padding: 14, borderRadius: 12, boxShadow: '0 10px 24px -14px rgba(17,32,61,0.4)' }}>
              <QRCodeSVG value={payload} size={184} level="M" fgColor="#11203D" bgColor="#ffffff" />
            </div>
            <div style={{ marginTop: 18, textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ width: 28, height: 28, borderRadius: '50%', background: '#11203D', color: '#EFF1EC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 13 }}>{initial}</span>
                <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 18, color: '#11203D' }}>{me.name}</span>
              </div>
              <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 13, color: '#5C6B73' }}>{me.username}</div>
              <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 15, letterSpacing: '0.08em', color: '#11203D', marginTop: 8, fontFeatureSettings: "'tnum'" }}>{me.account}</div>
            </div>
          </div>

          <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 9, padding: '10px 12px', borderRadius: 10, background: 'rgba(201,138,43,0.10)', border: '1px solid rgba(201,138,43,0.25)' }}>
            <span style={{ color: '#C98A2B', display: 'flex' }}><QrIcon size={15} /></span>
            <span style={{ fontSize: 12.5, color: '#5C6B73', lineHeight: 1.4 }}>QR statis — nominal diisi oleh pengirim saat scan.</span>
          </div>
        </div>
      </div>
    </Overlay>
  )
}
