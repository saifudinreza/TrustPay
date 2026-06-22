import { PhoneIcon, BoltIcon, DropletIcon, WifiIcon, QrIcon } from './icons.jsx'

/**
 * QuickActions — baris ikon "Aksi Cepat" (bayar tagihan + terima QR).
 *
 * Setiap tombol memanggil `onPick(service)`, dimana:
 *  - service.key === 'qr' → buka ReceiveQRModal (tampilkan QR code user)
 *  - service lainnya      → buka PayModal (simulasi bayar tagihan)
 *
 * Icon komponen SVG dipakai agar bisa diatur ukuran dan warna via props.
 */
export const SERVICES = [
  { key: 'pulsa',    label: 'Pulsa',       Icon: PhoneIcon,   field: 'Nomor HP',       placeholder: '0812-3456-7890',  presets: [25000, 50000, 100000] },
  { key: 'pln',     label: 'Listrik PLN', Icon: BoltIcon,    field: 'ID Pelanggan',   placeholder: '5321 0098 7766',  presets: [20000, 50000, 100000, 200000] },
  { key: 'air',     label: 'Air PDAM',    Icon: DropletIcon, field: 'ID Pelanggan',   placeholder: '0021 4455 88',    presets: [50000, 100000, 150000] },
  { key: 'internet',label: 'Internet',    Icon: WifiIcon,    field: 'Nomor Pelanggan',placeholder: 'INET-4455-2031',  presets: [150000, 300000, 500000] },
  { key: 'qr',      label: 'Terima (QR)', Icon: QrIcon,                               presets: [] },
]

export default function QuickActions({ onPick }) {
  return (
    <div style={{ background: '#fff', borderRadius: 18, border: '1px solid rgba(23,25,29,0.06)', boxShadow: '0 18px 40px -28px rgba(23,25,29,0.4)', padding: '18px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 500, fontSize: 16, margin: 0, color: '#17191D' }}>Aksi Cepat</h3>
        <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#5C6B73' }}>Bayar tagihan</span>
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
              style={{ cursor: 'pointer', background: 'transparent', border: '1px solid transparent', borderRadius: 12, padding: '12px 4px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
            >
              {/* QR berwarna gelap (highlight); tagihan berwarna emas */}
              <span style={{ width: 46, height: 46, borderRadius: 14, background: isQr ? '#17191D' : 'rgba(190,242,100,0.12)', color: isQr ? '#EFF1EC' : '#4D7C0F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Glyph size={22} />
              </span>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#17191D', textAlign: 'center', lineHeight: 1.2 }}>{s.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
