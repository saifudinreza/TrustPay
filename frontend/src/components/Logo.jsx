import { useId } from 'react'

// TrustPay wordmark — navy "squircle" holding a gold-checked shield (trust / verified
// ledger), paired with a two-tone wordmark. Pure SVG: crisp at any size, works on
// light or dark backgrounds. `tone` lets the "Trust" half follow the surrounding
// text color (default) so it adapts in dark panels.
export default function Logo({ size = 40, showText = true, textSize = 19 }) {
  const id = useId()
  const bg = `${id}-bg`
  const gold = `${id}-gold`
  const gloss = `${id}-gloss`

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        aria-label="TrustPay"
        style={{ display: 'block', flex: 'none', filter: 'drop-shadow(0 6px 14px rgba(17,32,61,0.32))' }}
      >
        <defs>
          <linearGradient id={bg} x1="6" y1="3" x2="42" y2="45" gradientUnits="userSpaceOnUse">
            <stop stopColor="#27406E" />
            <stop offset="0.55" stopColor="#152748" />
            <stop offset="1" stopColor="#0C1830" />
          </linearGradient>
          <linearGradient id={gold} x1="14" y1="13" x2="34" y2="36" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F2D08A" />
            <stop offset="1" stopColor="#C98A2B" />
          </linearGradient>
          <linearGradient id={gloss} x1="24" y1="3" x2="24" y2="26" gradientUnits="userSpaceOnUse">
            <stop stopColor="#fff" stopOpacity="0.22" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* squircle body + subtle ring so it stays visible on dark backgrounds */}
        <rect x="3" y="3" width="42" height="42" rx="14" fill={`url(#${bg})`} />
        <rect x="3.6" y="3.6" width="40.8" height="40.8" rx="13.4" stroke="#C98A2B" strokeOpacity="0.28" strokeWidth="1.2" />
        <path d="M17 3.6h14a13.4 13.4 0 0 1 13.4 13.4v1.5C38 14 30 11.5 24 11.5S10 14 3.6 18.5V17A13.4 13.4 0 0 1 17 3.6Z" fill={`url(#${gloss})`} />

        {/* shield (verified ledger) */}
        <path
          d="M24 11.5 33 14.8v8c0 5.6-3.9 9.5-9 12.4-5.1-2.9-9-6.8-9-12.4v-8L24 11.5Z"
          fill="#EFF1EC"
        />
        <path
          d="M24 11.5 33 14.8v8c0 5.6-3.9 9.5-9 12.4-5.1-2.9-9-6.8-9-12.4v-8L24 11.5Z"
          stroke="#0C1830"
          strokeOpacity="0.08"
          strokeWidth="1"
        />
        {/* gold checkmark */}
        <path
          d="m19.6 23.4 3.2 3.2 6-6.6"
          stroke={`url(#${gold})`}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {showText && (
        <span
          style={{
            fontFamily: "'Space Grotesk',sans-serif",
            fontWeight: 700,
            fontSize: textSize,
            letterSpacing: '-0.02em',
            lineHeight: 1,
          }}
        >
          Trust<span style={{ color: '#C98A2B' }}>Pay</span>
        </span>
      )}
    </div>
  )
}
