import { PhoneIcon, BoltIcon, DropletIcon, WifiIcon, QrIcon } from './icons.jsx'
import { T, FONT } from '../lib/theme.js'

/**
 * QuickActions — baris ikon "Bayar Tagihan" (Pulsa/PLN/PDAM/Internet) + terima QR.
 *
 * Murni demo: tiap layanan membuka PayModal, user input nominal → saldo otomatis
 * terpotong via /pay (tanpa merchant khusus). Item 'qr' membuka ReceiveQRModal.
 */
export const SERVICES = [
  { key: 'pulsa',    label: 'Pulsa',       Icon: PhoneIcon,   field: 'Nomor HP',        placeholder: '0812-3456-7890',  presets: [25000, 50000, 100000] },
  { key: 'pln',      label: 'Listrik PLN', Icon: BoltIcon,    field: 'ID Pelanggan',    placeholder: '5321 0098 7766',  presets: [20000, 50000, 100000, 200000] },
  { key: 'air',      label: 'Air PDAM',    Icon: DropletIcon, field: 'ID Pelanggan',    placeholder: '0021 4455 88',    presets: [50000, 100000, 150000] },
  { key: 'internet', label: 'Internet',    Icon: WifiIcon,    field: 'Nomor Pelanggan', placeholder: 'INET-4455-2031',  presets: [150000, 300000, 500000] },
  { key: 'qr',       label: 'Terima (QR)', Icon: QrIcon,                                presets: [] },
]

export default function QuickActions({ onPick }) {
  return (
    <div style={{ background: T.surface, borderRadius: 20, border: `1px solid ${T.border}`, boxShadow: '0 20px 50px -32px rgba(0,0,0,0.8)', padding: '18px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3 style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 16, margin: 0, color: T.ink }}>Bayar Tagihan</h3>
        <span style={{ fontFamily: FONT.mono, fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: T.muted }}>Saldo auto-potong</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
        {SERVICES.map((s) => {
          const isQr = s.key === 'qr'
          const Glyph = s.Icon
          return (
            <button
              key={s.key}
              onClick={() => onPick(s)}
              className="qa-btn"
              style={{ cursor: 'pointer', background: 'transparent', border: '1px solid transparent', borderRadius: 14, padding: '12px 4px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
            >
              <span style={{ width: 48, height: 48, borderRadius: 15, background: isQr ? T.btnGrad : T.goldSoft, color: isQr ? T.onGold : T.goldBright, display: 'flex', alignItems: 'center', justifyContent: 'center', border: isQr ? 'none' : `1px solid ${T.border2}` }}>
                <Glyph size={22} />
              </span>
              <span style={{ fontSize: 12, fontWeight: 600, color: T.inkSoft, textAlign: 'center', lineHeight: 1.2 }}>{s.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
