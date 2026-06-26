import { fmtRp, rowMeta } from '../lib/wallet.js'
import { Overlay, closeBtn } from './TopUpModal.jsx'
import { T, FONT } from '../lib/theme.js'
import { CloseIcon, CheckIcon, PrinterIcon } from './icons.jsx'

/**
 * ReceiptModal — struk bukti transaksi (detail baris riwayat), tema gelap + ungu.
 *
 * Dibuka saat user klik baris di tabel riwayat (LedgerRow).
 * Fitur print: window.print() mencetak hanya konten modal ini (#receipt-print).
 */
export default function ReceiptModal({ tx, onClose }) {
  if (!tx) return null
  const m = rowMeta(tx)
  const masuk = tx.amount > 0
  const print = () => window.print()

  return (
    <Overlay onClose={onClose}>
      <div id="receipt-print" style={{ width: 400, maxWidth: '100%', background: T.surface, borderRadius: 22, overflow: 'hidden', border: `1px solid ${T.border}`, boxShadow: '0 40px 90px -24px rgba(0,0,0,0.85)', animation: 'popIn .24s cubic-bezier(.2,.8,.3,1)' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ height: 4, background: `linear-gradient(135deg, ${m.accent}, ${T.goldDeep})` }} />
        <div style={{ padding: '22px 26px 26px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }} className="no-print">
            <h3 style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 20, margin: 0, color: T.ink }}>Bukti Transaksi</h3>
            <button onClick={onClose} style={closeBtn} aria-label="Tutup"><CloseIcon size={18} /></button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '6px 0 18px' }}>
            <div style={{ width: 72, height: 72, border: `2.5px solid ${m.accent}`, borderRadius: '50%', transform: 'rotate(-8deg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
              <span style={{ color: m.accent, display: 'flex' }}><CheckIcon size={22} strokeWidth={2.4} /></span>
              <span style={{ fontFamily: FONT.mono, fontSize: 9, letterSpacing: '0.14em', color: m.accent, textTransform: 'uppercase', marginTop: 3 }}>Berhasil</span>
            </div>
            <div style={{ fontFamily: FONT.mono, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.muted, marginBottom: 6 }}>
              {m.typeLabel}{masuk ? ' · Dana Masuk' : ' · Dana Keluar'}
            </div>
            <div style={{ fontFamily: FONT.mono, fontWeight: 600, fontSize: 30, color: m.accent, fontFeatureSettings: "'tnum'" }}>{m.amountStr}</div>
          </div>

          <div style={{ borderTop: `1px dashed ${T.border}`, paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 11 }}>
            <Field k="Kode Transaksi" v={tx.code} mono />
            <Field k="Tanggal"        v={`${tx.dateStr} · ${tx.timeStr}`} mono />
            <Field k="Tipe"           v={tx.type} mono />
            <Field k="Lawan Transaksi" v={tx.counterparty} />
            {tx.description ? <Field k="Catatan" v={tx.description} /> : null}
            <Field k="Saldo Setelah"  v={fmtRp(tx.balanceAfter)} mono />
          </div>

          <div style={{ marginTop: 20, padding: '10px 12px', borderRadius: 12, background: T.surface2, border: `1px solid ${T.border}`, fontFamily: FONT.mono, fontSize: 11, color: T.muted, textAlign: 'center', letterSpacing: '0.04em' }}>
            TrustPay · E-Wallet · setiap baris self-explanatory untuk audit
          </div>

          <div className="no-print" style={{ marginTop: 18, display: 'flex', gap: 10 }}>
            <button onClick={print} style={{ flex: 1, cursor: 'pointer', border: `1px solid ${T.border2}`, background: T.surface2, color: T.ink, padding: '12px 0', borderRadius: 12, fontFamily: FONT.sans, fontSize: 14, fontWeight: 600, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <PrinterIcon size={16} /> Cetak / PDF
            </button>
            <button onClick={onClose} style={{ flex: 1, cursor: 'pointer', border: 'none', background: T.btnGrad, color: T.onGold, padding: '12px 0', borderRadius: 12, fontFamily: FONT.sans, fontSize: 14, fontWeight: 700 }}>
              Tutup
            </button>
          </div>
        </div>
      </div>
    </Overlay>
  )
}

function Field({ k, v, mono }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 16 }}>
      <span style={{ fontSize: 13, color: T.muted, flex: 'none' }}>{k}</span>
      <span style={{ fontSize: 14, fontWeight: 500, color: T.ink, textAlign: 'right', fontFamily: mono ? FONT.mono : undefined, fontFeatureSettings: mono ? "'tnum'" : undefined }}>
        {v}
      </span>
    </div>
  )
}
