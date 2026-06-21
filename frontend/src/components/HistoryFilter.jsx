import { SearchIcon } from './icons.jsx'

// Filter & cari riwayat — type chips, date range, name/code search, reset.
const TYPES = [
  { key: 'ALL', label: 'Semua', color: '#11203D' },
  { key: 'MASUK', label: 'Masuk', color: '#2F6F4E' },
  { key: 'KELUAR', label: 'Keluar', color: '#7A3142' },
  { key: 'TOPUP', label: 'Top Up', color: '#C98A2B' },
]

export default function HistoryFilter({ filters, setFilters, active }) {
  const set = (patch) => setFilters((f) => ({ ...f, ...patch }))
  const reset = () => setFilters({ type: 'ALL', from: '', to: '', q: '' })

  return (
    <div style={{ padding: '16px 24px', borderBottom: '1px solid #eceee8', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* search + type chips */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px', height: 40, borderRadius: 10, border: '1.5px solid rgba(17,32,61,0.14)', background: '#fbfcf9', flex: 1, minWidth: 180 }}>
          <span style={{ color: '#5C6B73', display: 'flex' }}><SearchIcon size={16} /></span>
          <input
            value={filters.q}
            onChange={(e) => set({ q: e.target.value })}
            placeholder="Cari nama, catatan, atau kode…"
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 14, color: '#11203D' }}
          />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {TYPES.map((t) => {
            const on = filters.type === t.key
            return (
              <button
                key={t.key}
                onClick={() => set({ type: t.key })}
                style={{
                  cursor: 'pointer',
                  fontFamily: "'IBM Plex Mono',monospace",
                  fontSize: 11.5,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  padding: '7px 12px',
                  borderRadius: 999,
                  border: `1px solid ${on ? t.color : 'rgba(17,32,61,0.18)'}`,
                  background: on ? t.color : 'transparent',
                  color: on ? '#fff' : '#5C6B73',
                  transition: 'all .12s',
                }}
              >
                {t.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* date range + reset */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12.5, color: '#5C6B73' }}>Dari</span>
          <input type="date" value={filters.from} onChange={(e) => set({ from: e.target.value })} style={dateInput} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12.5, color: '#5C6B73' }}>s/d</span>
          <input type="date" value={filters.to} onChange={(e) => set({ to: e.target.value })} style={dateInput} />
        </div>
        {active && (
          <button onClick={reset} style={{ cursor: 'pointer', background: 'transparent', border: 'none', color: '#7A3142', fontSize: 13, fontWeight: 600, textDecoration: 'underline', marginLeft: 'auto' }}>
            Reset filter
          </button>
        )}
      </div>
    </div>
  )
}

const dateInput = {
  height: 38,
  padding: '0 10px',
  borderRadius: 9,
  border: '1.5px solid rgba(17,32,61,0.14)',
  background: '#fbfcf9',
  outline: 'none',
  fontFamily: "'IBM Plex Mono',monospace",
  fontSize: 12.5,
  color: '#11203D',
}
