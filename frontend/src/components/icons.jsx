// TrustPay icon set — crisp line icons drawn on a 24×24 grid, stroke = currentColor.
// Inherit color from the parent (color/style), set size via the `size` prop.
// Replaces the emoji glyphs used across the app for a sharper, on-brand look.

function Icon({ size = 20, strokeWidth = 1.75, children, style, ...rest }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: 'block', flex: 'none', ...style }}
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  )
}

// ---- bill / quick-action services ----
export const PhoneIcon = (p) => (
  <Icon {...p}>
    <rect x="6.5" y="2.5" width="11" height="19" rx="2.6" />
    <line x1="10.5" y1="18.5" x2="13.5" y2="18.5" />
  </Icon>
)

export const BoltIcon = (p) => (
  <Icon {...p}>
    <path d="M13 2 4.5 13.5h6L11 22l8.5-11.5h-6L13 2Z" />
  </Icon>
)

export const DropletIcon = (p) => (
  <Icon {...p}>
    <path d="M12 2.7c3.5 4 6 7 6 10.3a6 6 0 0 1-12 0c0-3.3 2.5-6.3 6-10.3Z" />
    <path d="M9.5 14.5a2.7 2.7 0 0 0 2.5 2.4" />
  </Icon>
)

export const WifiIcon = (p) => (
  <Icon {...p}>
    <path d="M2.5 9.5a13.5 13.5 0 0 1 19 0" />
    <path d="M5.8 13a8.8 8.8 0 0 1 12.4 0" />
    <path d="M9 16.4a4 4 0 0 1 6 0" />
    <circle cx="12" cy="20" r="0.6" fill="currentColor" stroke="none" />
  </Icon>
)

export const QrIcon = (p) => (
  <Icon {...p}>
    <rect x="3" y="3" width="7" height="7" rx="1.4" />
    <rect x="14" y="3" width="7" height="7" rx="1.4" />
    <rect x="3" y="14" width="7" height="7" rx="1.4" />
    <path d="M14 14h3v3M21 14v0M17 21h4v-4M14 21h0" />
  </Icon>
)

// ---- actions / controls ----
export const PlusIcon = (p) => (
  <Icon {...p}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </Icon>
)

export const TransferIcon = (p) => (
  <Icon {...p}>
    <path d="M7 8h13l-3.2-3.2" />
    <path d="M17 16H4l3.2 3.2" />
  </Icon>
)

export const SearchIcon = (p) => (
  <Icon {...p}>
    <circle cx="11" cy="11" r="7" />
    <line x1="20" y1="20" x2="16" y2="16" />
  </Icon>
)

export const PrinterIcon = (p) => (
  <Icon {...p}>
    <path d="M7 9V3.5h10V9" />
    <path d="M7 17.5H5.5A1.5 1.5 0 0 1 4 16v-4.5A1.5 1.5 0 0 1 5.5 10h13a1.5 1.5 0 0 1 1.5 1.5V16a1.5 1.5 0 0 1-1.5 1.5H17" />
    <rect x="7" y="15" width="10" height="6" rx="1.2" />
  </Icon>
)

export const DownloadIcon = (p) => (
  <Icon {...p}>
    <path d="M12 3.5v11" />
    <path d="m7.5 10 4.5 4.5L16.5 10" />
    <path d="M4.5 19.5h15" />
  </Icon>
)

export const CheckIcon = (p) => (
  <Icon {...p}>
    <path d="m4.5 12.5 4.8 4.8L19.5 6.5" />
  </Icon>
)

export const CloseIcon = (p) => (
  <Icon {...p}>
    <line x1="6" y1="6" x2="18" y2="18" />
    <line x1="18" y1="6" x2="6" y2="18" />
  </Icon>
)

export const InfoIcon = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <line x1="12" y1="11" x2="12" y2="16.5" />
    <circle cx="12" cy="7.8" r="0.6" fill="currentColor" stroke="none" />
  </Icon>
)

export const AlertIcon = (p) => (
  <Icon {...p}>
    <path d="M12 3.5 21.5 20H2.5L12 3.5Z" />
    <line x1="12" y1="10" x2="12" y2="14.5" />
    <circle cx="12" cy="17.3" r="0.6" fill="currentColor" stroke="none" />
  </Icon>
)

export const ChevronLeftIcon = (p) => (
  <Icon {...p}>
    <path d="m14.5 6-6 6 6 6" />
  </Icon>
)

export const ChevronRightIcon = (p) => (
  <Icon {...p}>
    <path d="m9.5 6 6 6-6 6" />
  </Icon>
)

export const ArrowRightIcon = (p) => (
  <Icon {...p}>
    <line x1="4" y1="12" x2="19" y2="12" />
    <path d="m13.5 6.5 6 5.5-6 5.5" />
  </Icon>
)

// ---- ledger directions (summary cards) ----
export const ArrowDownLeftIcon = (p) => (
  <Icon {...p}>
    <line x1="17.5" y1="6.5" x2="6.5" y2="17.5" />
    <path d="M7 9.5v8h8" />
  </Icon>
)

export const ArrowUpRightIcon = (p) => (
  <Icon {...p}>
    <line x1="6.5" y1="17.5" x2="17.5" y2="6.5" />
    <path d="M9 6.5h8.5V15" />
  </Icon>
)

export const ScaleIcon = (p) => (
  <Icon {...p}>
    <line x1="12" y1="4" x2="12" y2="20" />
    <path d="M6 9 3.5 14.5h5L6 9Z" />
    <path d="M18 9l-2.5 5.5h5L18 9Z" />
    <path d="M6 9 12 7l6 2" />
    <line x1="8.5" y1="20" x2="15.5" y2="20" />
  </Icon>
)

export const ShieldCheckIcon = (p) => (
  <Icon {...p}>
    <path d="M12 2.8 19 5.4v6.1c0 4.3-3 7.3-7 9.7-4-2.4-7-5.4-7-9.7V5.4l7-2.6Z" />
    <path d="m8.7 11.8 2.4 2.4 4.2-4.6" />
  </Icon>
)

// ---- auth / profile ----
export const EyeIcon = (p) => (
  <Icon {...p}>
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
    <circle cx="12" cy="12" r="3" />
  </Icon>
)

export const EyeOffIcon = (p) => (
  <Icon {...p}>
    <path d="M9.6 5.8A9.7 9.7 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a16.6 16.6 0 0 1-3 3.6" />
    <path d="M6.3 7.6A16.4 16.4 0 0 0 2.5 12S6 18.5 12 18.5a9.5 9.5 0 0 0 3.9-.8" />
    <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    <line x1="3.5" y1="3.5" x2="20.5" y2="20.5" />
  </Icon>
)

export const LogoutIcon = (p) => (
  <Icon {...p}>
    <path d="M14 7.5V5.5A1.5 1.5 0 0 0 12.5 4h-6A1.5 1.5 0 0 0 5 5.5v13A1.5 1.5 0 0 0 6.5 20h6a1.5 1.5 0 0 0 1.5-1.5v-2" />
    <path d="M10 12h10m0 0-3-3m3 3-3 3" />
  </Icon>
)

export const UserIcon = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="8" r="3.6" />
    <path d="M5 20a7 7 0 0 1 14 0" />
  </Icon>
)

export const MailIcon = (p) => (
  <Icon {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2.4" />
    <path d="m4 7 8 6 8-6" />
  </Icon>
)

export const LockIcon = (p) => (
  <Icon {...p}>
    <rect x="4.5" y="10.5" width="15" height="10" rx="2.2" />
    <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    <circle cx="12" cy="15.2" r="1.1" fill="currentColor" stroke="none" />
  </Icon>
)

// ---- notifications ----
export const BellIcon = (p) => (
  <Icon {...p}>
    <path d="M18 8a6 6 0 0 0-12 0c0 4.5-2 6-2 6h16s-2-1.5-2-6" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </Icon>
)

// ---- scan / camera ----
export const ScanIcon = (p) => (
  <Icon {...p}>
    <path d="M3 7V4.5A1.5 1.5 0 0 1 4.5 3H7" />
    <path d="M17 3h2.5A1.5 1.5 0 0 1 21 4.5V7" />
    <path d="M21 17v2.5a1.5 1.5 0 0 1-1.5 1.5H17" />
    <path d="M7 21H4.5A1.5 1.5 0 0 1 3 19.5V17" />
    <line x1="7" y1="12" x2="17" y2="12" />
  </Icon>
)

export const CameraIcon = (p) => (
  <Icon {...p}>
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </Icon>
)

// ---- promo / rewards ----
export const GiftIcon = (p) => (
  <Icon {...p}>
    <polyline points="20 12 20 22 4 22 4 12" />
    <rect x="2" y="7" width="20" height="5" rx="1.2" />
    <line x1="12" y1="22" x2="12" y2="7" />
    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C10 2 12 7 12 7z" />
    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C14 2 12 7 12 7z" />
  </Icon>
)

export const TagIcon = (p) => (
  <Icon {...p}>
    <path d="M20.59 13.41L13.42 20.59a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82Z" />
    <line x1="7" y1="7" x2="7.01" y2="7" strokeWidth={2.5} />
  </Icon>
)

export const StarIcon = (p) => (
  <Icon {...p}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </Icon>
)

export const SparkleIcon = (p) => (
  <Icon {...p}>
    <path d="M12 3 L13.5 8.5 L19 10 L13.5 11.5 L12 17 L10.5 11.5 L5 10 L10.5 8.5 Z" />
    <path d="M19 2 L19.8 4.2 L22 5 L19.8 5.8 L19 8 L18.2 5.8 L16 5 L18.2 4.2 Z" />
    <path d="M5 17 L5.5 18.5 L7 19 L5.5 19.5 L5 21 L4.5 19.5 L3 19 L4.5 18.5 Z" />
  </Icon>
)

// ---- profile / identity ----
export const ShieldIcon = (p) => (
  <Icon {...p}>
    <path d="M12 2.8 19 5.4v6.1c0 4.3-3 7.3-7 9.7-4-2.4-7-5.4-7-9.7V5.4l7-2.6Z" />
  </Icon>
)

export const IdCardIcon = (p) => (
  <Icon {...p}>
    <rect x="2" y="5" width="20" height="14" rx="2.4" />
    <circle cx="8" cy="12" r="2.5" />
    <path d="M13 10h5M13 14h4" />
  </Icon>
)

// ---- Google brand icon (SVG multi-color, tidak mengikuti stroke/fill currentColor) ----
export function GoogleIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ display: 'block', flex: 'none' }}>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}
