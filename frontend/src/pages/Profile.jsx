import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Logo from '../components/Logo.jsx'
import useAuth from '../hooks/useAuth.js'
import useWallet from '../hooks/useWallet.js'
import {
  UserIcon, MailIcon, PhoneIcon, LockIcon,
  ShieldCheckIcon, ShieldIcon, IdCardIcon,
  LogoutIcon, CheckIcon, ArrowRightIcon,
} from '../components/icons.jsx'
import { fmtRp, MONTHS } from '../lib/wallet.js'

const CARBON = '#17191D'
const LIME   = '#BEF264'
const LIME_INK = '#4D7C0F'
const GRAY   = '#5C6B73'
const PAPER  = '#EFF1EC'

/**
 * Profile — halaman informasi akun pengguna.
 * Menampilkan: avatar, nama, email, telepon, username, saldo, level akun, keamanan.
 */
export default function Profile() {
  const { user, logout } = useAuth()
  const { balance, hydrated } = useWallet()
  const navigate = useNavigate()

  // Jika belum login, redirect ke halaman masuk
  useEffect(() => {
    if (!user && hydrated) navigate('/masuk')
  }, [user, hydrated, navigate])

  const onLogout = () => { logout(); navigate('/') }

  const name     = user?.name     || 'Pengguna'
  const email    = user?.email    || '—'
  const phone    = user?.phone    || '—'
  const username = user?.username ? `@${user.username}` : '—'
  const account  = user?.account  || '8021 4455 4021'
  const initial  = name.trim().charAt(0).toUpperCase() || 'U'

  const since = user?.created_at ? new Date(user.created_at) : null
  const sinceStr = since
    ? `${since.getDate()} ${MONTHS[since.getMonth()]} ${since.getFullYear()}`
    : '—'

  return (
    <div
      className="page-enter"
      style={{
        minHeight: '100vh',
        background: `radial-gradient(800px 480px at 90% -8%, rgba(190,242,100,0.10), transparent 60%), ${PAPER}`,
      }}
    >
      {/* NAV */}
      <nav style={{ borderBottom: '1px solid rgba(23,25,29,0.08)', background: 'rgba(239,241,236,0.8)', backdropFilter: 'blur(8px)', position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/dashboard" style={{ textDecoration: 'none', color: GRAY, fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
            ← Dashboard
          </Link>
          <Logo size={34} textSize={17} />
          <button
            onClick={onLogout}
            className="icon-btn"
            title="Keluar"
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 14px', borderRadius: 10, border: '1.5px solid rgba(23,25,29,0.14)', background: 'transparent', color: GRAY, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 14, fontWeight: 600 }}
          >
            <LogoutIcon size={16} /> Keluar
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 24px 80px' }}>

        {/* ===== AVATAR + NAMA ===== */}
        <div style={{ background: `linear-gradient(150deg, #2C2F35 0%, #17191D 55%, #0C0E11 100%)`, borderRadius: 24, padding: '36px 32px', position: 'relative', overflow: 'hidden', marginBottom: 20, color: PAPER }}>
          {/* dekorasi lingkaran */}
          <div style={{ position: 'absolute', right: -30, top: -30, width: 180, height: 180, border: '2px solid rgba(190,242,100,0.15)', borderRadius: '50%', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', right: 30, bottom: -40, width: 120, height: 120, border: '2px solid rgba(190,242,100,0.08)', borderRadius: '50%', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(300px 200px at 85% -10%, rgba(190,242,100,0.18), transparent 65%)', pointerEvents: 'none' }} />

          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
            {/* avatar */}
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(150deg, #BEF264, #4D7C0F)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 34, color: CARBON, flex: 'none', boxShadow: '0 12px 28px -10px rgba(190,242,100,0.5)' }}>
              {initial}
            </div>
            <div>
              <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 26, letterSpacing: '-0.01em', marginBottom: 4 }}>{name}</div>
              <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 13, letterSpacing: '0.04em', color: 'rgba(239,241,236,0.55)' }}>{username}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 12px', borderRadius: 999, background: 'rgba(190,242,100,0.15)', border: '1px solid rgba(190,242,100,0.3)', fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: LIME }}>
                  <CheckIcon size={12} strokeWidth={2.5} /> Terverifikasi
                </span>
                <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: 'rgba(239,241,236,0.4)', letterSpacing: '0.04em' }}>
                  Bergabung {sinceStr}
                </span>
              </div>
            </div>
          </div>

          {/* saldo */}
          <div style={{ position: 'relative', marginTop: 28, paddingTop: 24, borderTop: '1px solid rgba(239,241,236,0.10)' }}>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(239,241,236,0.45)', marginBottom: 6 }}>
              Saldo Tersedia
            </div>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontWeight: 500, fontSize: 36, letterSpacing: '-0.01em', fontFeatureSettings: "'tnum'" }}>
              {hydrated ? fmtRp(balance) : '···'}
            </div>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: 'rgba(239,241,236,0.35)', marginTop: 4, letterSpacing: '0.06em' }}>
              No. akun: {account}
            </div>
          </div>
        </div>

        {/* ===== INFO AKUN ===== */}
        <Section title="Informasi Akun">
          <InfoRow icon={<UserIcon size={18} />} label="Nama Lengkap" value={name} />
          <InfoRow icon={<MailIcon size={18} />} label="Email" value={email} />
          <InfoRow icon={<PhoneIcon size={18} />} label="Nomor HP" value={phone} />
          <InfoRow icon={<UserIcon size={18} />} label="Username" value={username} noBorder />
        </Section>

        {/* ===== KEAMANAN ===== */}
        <Section title="Keamanan">
          <SecurityRow
            icon={<LockIcon size={18} />}
            title="PIN Transaksi"
            desc="6 digit PIN untuk mengotorisasi transfer"
            badge="Aktif"
            badgeColor="#2F6F4E"
          />
          <SecurityRow
            icon={<PhoneIcon size={18} />}
            title="OTP WhatsApp"
            desc="Kode verifikasi via WhatsApp"
            badge="Aktif"
            badgeColor="#2F6F4E"
          />
          <SecurityRow
            icon={<ShieldCheckIcon size={18} />}
            title="Verifikasi Identitas (KYC)"
            desc="KTP & selfie untuk limit penuh"
            badge="Basic"
            badgeColor="#7B8890"
            noBorder
          />
        </Section>

        {/* ===== LEVEL AKUN ===== */}
        <Section title="Level Akun">
          <div style={{ padding: '18px 0 4px' }}>
            <LevelBar level={1} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 20 }}>
              <LevelCard
                icon={<ShieldIcon size={18} />}
                title="Basic"
                active
                points={['Simpan hingga Rp 2 juta', 'Transfer sesama TrustPay', 'Top up via VA & QRIS']}
              />
              <LevelCard
                icon={<IdCardIcon size={18} />}
                title="Premium"
                active={false}
                points={['Simpan hingga Rp 20 juta', 'Transfer ke rekening bank', 'Limit transaksi lebih besar']}
                cta="Upload KTP"
              />
            </div>
          </div>
        </Section>

        {/* tombol aksi */}
        <Link to="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '14px 0', borderRadius: 12, background: LIME, color: CARBON, fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 15, fontWeight: 700, marginTop: 8, boxShadow: '0 10px 24px -10px rgba(190,242,100,0.55)' }}>
          Kembali ke Dashboard <ArrowRightIcon size={16} />
        </Link>
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ background: '#fff', borderRadius: 18, border: '1px solid rgba(23,25,29,0.06)', boxShadow: '0 14px 36px -26px rgba(23,25,29,0.4)', padding: '22px 24px', marginBottom: 16 }}>
      <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 500, fontSize: 17, margin: '0 0 16px', color: CARBON }}>{title}</h3>
      {children}
    </div>
  )
}

function InfoRow({ icon, label: lbl, value, noBorder }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 0', borderBottom: noBorder ? 'none' : '1px solid rgba(23,25,29,0.06)' }}>
      <span style={{ color: GRAY, display: 'flex', flex: 'none' }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: GRAY, marginBottom: 3 }}>{lbl}</div>
        <div style={{ fontSize: 15, fontWeight: 500, color: CARBON }}>{value}</div>
      </div>
    </div>
  )
}

function SecurityRow({ icon, title, desc, badge, badgeColor, noBorder }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 0', borderBottom: noBorder ? 'none' : '1px solid rgba(23,25,29,0.06)' }}>
      <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(23,25,29,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: GRAY, flex: 'none' }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: CARBON, marginBottom: 2 }}>{title}</div>
        <div style={{ fontSize: 13, color: GRAY }}>{desc}</div>
      </div>
      <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '4px 10px', borderRadius: 999, background: badgeColor + '18', color: badgeColor, border: `1px solid ${badgeColor}33`, flex: 'none' }}>
        {badge}
      </span>
    </div>
  )
}

function LevelBar({ level }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase', color: LIME_INK }}>Basic</span>
        <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase', color: GRAY }}>Premium</span>
      </div>
      <div style={{ height: 6, borderRadius: 3, background: 'rgba(23,25,29,0.08)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: '30%', background: `linear-gradient(90deg, ${LIME_INK}, ${LIME})`, borderRadius: 3 }} />
      </div>
      <div style={{ marginTop: 8, fontSize: 13, color: GRAY }}>Upload KTP untuk upgrade ke Premium dan buka limit penuh.</div>
    </div>
  )
}

function LevelCard({ icon, title, active, points, cta }) {
  return (
    <div style={{ borderRadius: 14, border: `1.5px solid ${active ? LIME_INK + '55' : 'rgba(23,25,29,0.08)'}`, padding: '16px', background: active ? 'rgba(190,242,100,0.05)' : '#fbfcf9', position: 'relative' }}>
      {active && (
        <div style={{ position: 'absolute', top: -1, right: 12, background: LIME_INK, color: '#fff', fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '3px 8px', borderRadius: '0 0 6px 6px' }}>
          Aktif
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ color: active ? LIME_INK : GRAY, display: 'flex' }}>{icon}</span>
        <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 15, color: CARBON }}>{title}</span>
      </div>
      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {points.map((p, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 7, fontSize: 12.5, color: GRAY }}>
            <span style={{ color: active ? LIME_INK : 'rgba(92,107,115,0.5)', marginTop: 1, flex: 'none' }}><CheckIcon size={13} strokeWidth={2.2} /></span>
            {p}
          </li>
        ))}
      </ul>
      {cta && !active && (
        <button style={{ marginTop: 14, width: '100%', padding: '9px 0', borderRadius: 8, border: `1.5px solid ${LIME_INK}`, background: 'transparent', color: LIME_INK, fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
          {cta}
        </button>
      )}
    </div>
  )
}
