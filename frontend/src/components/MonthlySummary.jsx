import { fmtRp } from '../lib/wallet.js'
import { ArrowDownLeftIcon, ArrowUpRightIcon, ScaleIcon } from './icons.jsx'

/**
 * MonthlySummary — tiga kartu statistik di atas tabel riwayat.
 *
 * Menampilkan:
 *  1. Total masuk bulan ini (hijau)
 *  2. Total keluar bulan ini (merah) + jumlah transaksi
 *  3. Selisih bersih (emas jika positif, merah jika negatif)
 *
 * Data dihitung oleh monthlySummary() di lib/wallet.js dan di-pass sebagai prop `summary`.
 */
export default function MonthlySummary({ summary }) {
  const net = summary.net
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 18 }} className="summary-grid">
      <StatCard
        label="Masuk bulan ini"
        value={`+ ${fmtRp(summary.masuk)}`}
        accent="#2F6F4E"
        Icon={ArrowDownLeftIcon}
        sub={summary.label} // mis. "Jun 2026"
      />
      <StatCard
        label="Keluar bulan ini"
        value={`− ${fmtRp(summary.keluar)}`}
        accent="#7A3142"
        Icon={ArrowUpRightIcon}
        sub={`${summary.count} transaksi`}
      />
      <StatCard
        label="Selisih bersih"
        value={`${net < 0 ? '− ' : '+ '}${fmtRp(net)}`}
        accent={net < 0 ? '#7A3142' : '#4D7C0F'} // merah jika defisit, emas jika surplus
        Icon={ScaleIcon}
        sub={net < 0 ? 'lebih banyak keluar' : 'lebih banyak masuk'}
      />
    </div>
  )
}

/** Satu kartu statistik dengan rail warna kiri + ikon bulat */
function StatCard({ label, value, accent, Icon, sub }) {
  return (
    <div style={{ background: '#fff', borderRadius: 14, border: '1px solid rgba(23,25,29,0.06)', boxShadow: '0 14px 30px -26px rgba(23,25,29,0.4)', padding: '16px 18px', position: 'relative', overflow: 'hidden' }}>
      {/* Rail vertikal kiri — sama dengan ledger row untuk konsistensi visual */}
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: accent }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10.5, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#5C6B73' }}>{label}</span>
        <span style={{ width: 24, height: 24, borderRadius: '50%', background: `${accent}1a`, color: accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={14} /></span>
      </div>
      <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontWeight: 500, fontSize: 19, color: accent, fontFeatureSettings: "'tnum'", letterSpacing: '-0.01em' }}>{value}</div>
      <div style={{ fontSize: 12, color: '#5C6B73', marginTop: 4 }}>{sub}</div>
    </div>
  )
}
