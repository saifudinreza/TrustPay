import { fmtRp, rowMeta } from '../lib/wallet.js'
import { Overlay, Perforation, closeBtn } from './TopUpModal.jsx'
import { CloseIcon, CheckIcon, PrinterIcon } from './icons.jsx'

// Transaction detail / struk bukti transaksi. Opened by clicking a ledger row.
// Carries the unique transaction code — fits the "audit-ready" theme. Printable.
export default function ReceiptModal({ tx, onClose }) {
  if (!tx) return null
  const m = rowMeta(tx)
  const masuk = tx.amount > 0

  const print = () => window.print()

  return (
    <Overlay onClose={onClose}>
      <div id="receipt-print" style={{ width: 400, maxWidth: '100%', background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 40px 80px -24px rgba(13,24,48,0.5)', animation: 'popIn .24s cubic-bezier(.2,.8,.3,1)' }} onClick={(e) => e.stopPropagation()}>
        <Perforation />
        <div style={{ padding: '22px 26px 26px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }} className="no-print">
            <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 500, fontSize: 20, margin: 0, color: '#11203D' }}>Bukti Transaksi</h3>
            <button onClick={onClose} style={closeBtn} aria-label="Tutup"><CloseIcon size={18} /></button>
          </div>

          {/* stamp + amount */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '6px 0 18px' }}>
            <div style={{ width: 72, height: 72, border: `2.5px solid ${m.accent}`, borderRadius: '50%', transform: 'rotate(-8deg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
              <span style={{ color: m.accent, display: 'flex' }}><CheckIcon size={22} strokeWidth={2.4} /></span>
              <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, letterSpacing: '0.14em', color: m.accent, textTransform: 'uppercase', marginTop: 3 }}>Berhasil</span>
            </div>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#5C6B73', marginBottom: 6 }}>{m.typeLabel}{masuk ? ' · Dana Masuk' : ' · Dana Keluar'}</div>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontWeight: 500, fontSize: 30, color: m.accent, fontFeatureSettings: "'tnum'" }}>{m.amountStr}</div>
          </div>

          <div style={{ borderTop: '1px dashed rgba(92,107,115,0.35)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 11 }}>
            <Field k="Kode Transaksi" v={tx.code} mono />
            <Field k="Tanggal" v={`${tx.dateStr} · ${tx.timeStr}`} mono />
            <Field k="Tipe" v={tx.type} mono />
            <Field k="Lawan Transaksi" v={tx.counterparty} />
            {tx.description ? <Field k="Catatan" v={tx.description} /> : null}
            <Field k="Saldo Setelah" v={fmtRp(tx.balanceAfter)} mono />
          </div>

          <div style={{ marginTop: 20, padding: '10px 12px', borderRadius: 10, background: 'rgba(17,32,61,0.04)', border: '1px solid rgba(17,32,61,0.07)', fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: '#5C6B73', textAlign: 'center', letterSpacing: '0.04em' }}>
            TrustPay · Mini Wallet · setiap baris self-explanatory untuk audit
          </div>

          <div className="no-print" style={{ marginTop: 18, display: 'flex', gap: 10 }}>
            <button onClick={print} style={{ flex: 1, cursor: 'pointer', border: '1.5px solid #11203D', background: 'transparent', color: '#11203D', padding: '12px 0', borderRadius: 10, fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 14, fontWeight: 600, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><PrinterIcon size={16} /> Cetak / PDF</button>
            <button onClick={onClose} style={{ flex: 1, cursor: 'pointer', border: 'none', background: '#C98A2B', color: '#1a1205', padding: '12px 0', borderRadius: 10, fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 14, fontWeight: 700 }}>Tutup</button>
          </div>
        </div>
      </div>
    </Overlay>
  )
}

function Field({ k, v, mono }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 16 }}>
      <span style={{ fontSize: 13, color: '#5C6B73', flex: 'none' }}>{k}</span>
      <span style={{ fontSize: 14, fontWeight: 500, color: '#11203D', textAlign: 'right', fontFamily: mono ? "'IBM Plex Mono',monospace" : undefined, fontFeatureSettings: mono ? "'tnum'" : undefined }}>{v}</span>
    </div>
  )
}
