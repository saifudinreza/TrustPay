import { useEffect } from 'react'
import { T, FONT } from '../lib/theme.js'

/**
 * PinPad — komponen visual input PIN 6 digit (dots + keypad numerik).
 *
 * Controlled: parent memegang state `value` (string angka) dan `onChange`.
 * Dipakai oleh PinModal (gerbang transaksi) dan PinSetupModal (atur PIN).
 *
 * Props:
 *  - value     : string PIN saat ini (0–6 digit)
 *  - onChange  : (next: string) => void
 *  - length    : panjang PIN (default 6)
 *  - error     : bool — warnai dots merah jika true
 *  - disabled  : bool — nonaktifkan input (mis. saat submitting)
 *  - autoKeyboard : bool — dengarkan keyboard fisik (default true)
 */
export default function PinPad({ value = '', onChange, length = 6, error = false, disabled = false, autoKeyboard = true }) {
  const press = (d) => {
    if (disabled) return
    if (value.length >= length) return
    onChange(value + d)
  }
  const back = () => {
    if (disabled) return
    onChange(value.slice(0, -1))
  }

  // Dukungan keyboard fisik (ketik angka / backspace) — nyaman di desktop.
  useEffect(() => {
    if (!autoKeyboard) return
    const onKey = (e) => {
      if (disabled) return
      if (/^[0-9]$/.test(e.key)) { e.preventDefault(); press(e.key) }
      else if (e.key === 'Backspace') { e.preventDefault(); back() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [value, disabled, autoKeyboard])

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫']

  return (
    <div>
      {/* dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 14, margin: '6px 0 22px' }}>
        {Array.from({ length }).map((_, i) => {
          const filled = i < value.length
          const color = error ? T.outRose : filled ? T.goldBright : 'transparent'
          return (
            <span
              key={i}
              style={{
                width: 14, height: 14, borderRadius: '50%',
                background: color,
                border: `2px solid ${error ? T.outRose : filled ? T.goldBright : T.border2}`,
                transition: 'background .12s ease, border-color .12s ease',
              }}
            />
          )
        })}
      </div>

      {/* keypad */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        {keys.map((k, i) => {
          if (k === '') return <span key={i} />
          const isBack = k === '⌫'
          return (
            <button
              key={i}
              type="button"
              onClick={() => (isBack ? back() : press(k))}
              disabled={disabled}
              className="pin-key"
              style={{
                height: 58, borderRadius: 16, cursor: disabled ? 'default' : 'pointer',
                border: `1px solid ${T.border}`,
                background: isBack ? 'transparent' : T.surface2,
                color: T.ink, fontFamily: FONT.mono, fontSize: isBack ? 20 : 22, fontWeight: 500,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {k}
            </button>
          )
        })}
      </div>
    </div>
  )
}
