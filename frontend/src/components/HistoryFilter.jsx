import { SearchIcon } from './icons.jsx'
import { T, FONT } from '../lib/theme.js'

/**
 * HistoryFilter — baris filter + pencarian di atas tabel riwayat transaksi.
 *
 * Fitur:
 *  - Pencarian teks (counterparty + catatan + kode transaksi)
 *  - Filter tipe: Semua / Masuk / Keluar / Top Up
 *  - Filter rentang tanggal (dari–sampai)
 *  - Tombol "Reset filter" muncul jika ada filter aktif
 *
 * State filter dikelola oleh parent (Dashboard) lewat props `filters` + `setFilters`,
 * agar Dashboard bisa menggunakan nilai filter untuk pagination dan export CSV.
 */

// Opsi chip filter tipe — key harus sesuai dengan field `type` di normalizeTx()
const TYPES = [
  { key: 'ALL',    label: 'Semua',  color: T.gold },
  { key: 'MASUK',  label: 'Masuk',  color: T.inGreen },
  { key: 'KELUAR', label: 'Keluar', color: T.outRose },
  { key: 'TOPUP',  label: 'Top Up', color: T.goldBright },
]

export default function HistoryFilter({ filters, setFilters, active }) {
  // Helper: update satu field filter tanpa menimpa field lain
  const set = (patch) => setFilters((f) => ({ ...f, ...patch }))
  // Reset ke kondisi awal (semua transaksi, tanpa pencarian)
  const reset = () => setFilters({ type: 'ALL', from: '', to: '', q: '' })

  return (
    <div style={{ padding: '16px 24px', borderBottom: `1px solid ${T.border}`, display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Baris 1: kotak pencarian + chip tipe */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px', height: 42, borderRadius: 11, border: `1.5px solid ${T.border}`, background: T.surface2, flex: 1, minWidth: 180 }}>
          <span style={{ color: T.muted, display: 'flex' }}><SearchIcon size={16} /></span>
          <input
            value={filters.q}
            onChange={(e) => set({ q: e.target.value })}
            placeholder="Cari nama, catatan, atau kode…"
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontFamily: FONT.sans, fontSize: 14, color: T.ink }}
          />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {TYPES.map((t) => {
            const on = filters.type === t.key // chip aktif = warna solid; tidak aktif = outline
            return (
              <button
                key={t.key}
                onClick={() => set({ type: t.key })}
                style={{
                  cursor: 'pointer',
                  fontFamily: FONT.mono,
                  fontSize: 11.5,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  padding: '7px 12px',
                  borderRadius: 999,
                  border: `1px solid ${on ? t.color : T.border}`,
                  background: on ? t.color : 'transparent',
                  color: on ? '#FFFFFF' : T.muted,
                  transition: 'all .12s',
                }}
              >
                {t.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Baris 2: rentang tanggal + tombol reset */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12.5, color: T.muted }}>Dari</span>
          <input type="date" value={filters.from} onChange={(e) => set({ from: e.target.value })} style={dateInput} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12.5, color: T.muted }}>s/d</span>
          <input type="date" value={filters.to} onChange={(e) => set({ to: e.target.value })} style={dateInput} />
        </div>
        {/* Tombol reset hanya muncul jika ada filter yang aktif */}
        {active && (
          <button onClick={reset} style={{ cursor: 'pointer', background: 'transparent', border: 'none', color: T.goldBright, fontSize: 13, fontWeight: 600, textDecoration: 'underline', marginLeft: 'auto' }}>
            Reset filter
          </button>
        )}
      </div>
    </div>
  )
}

const dateInput = {
  height: 40,
  padding: '0 10px',
  borderRadius: 10,
  border: `1.5px solid ${T.border}`,
  background: T.surface2,
  outline: 'none',
  fontFamily: FONT.mono,
  fontSize: 12.5,
  color: T.ink,
  colorScheme: 'dark',
}
