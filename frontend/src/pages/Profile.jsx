import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Logo from '../components/Logo.jsx'
import EditProfileModal from '../components/EditProfileModal.jsx'
import PinSetupModal from '../components/PinSetupModal.jsx'
import useAuth from '../hooks/useAuth.js'
import useWallet from '../hooks/useWallet.js'
import { T, FONT } from '../lib/theme.js'
import {
  UserIcon, MailIcon, PhoneIcon, LockIcon,
  ShieldCheckIcon, ShieldIcon, IdCardIcon,
  LogoutIcon, CheckIcon, ArrowRightIcon,
} from '../components/icons.jsx'
import { fmtRp, MONTHS } from '../lib/wallet.js'

/**
 * Profile — halaman akun: lihat & EDIT data diri, atur PIN keamanan, level akun.
 */
export default function Profile() {
  const { user, logout } = useAuth()
  const { balance, hydrated } = useWallet()
  const navigate = useNavigate()
  const [editOpen, setEditOpen] = useState(false)
  const [pinOpen, setPinOpen]   = useState(false)

  useEffect(() => {
    if (!user && hydrated) navigate('/masuk')
  }, [user, hydrated, navigate])

  const onLogout = () => { logout(); navigate('/') }

  const name     = user?.name     || 'Pengguna'
  const email    = user?.email    || '—'
  const phone    = user?.phone    || '—'
  const username = user?.username ? (String(user.username).startsWith('@') ? user.username : `@${user.username}`) : '—'
  const account  = user?.account  || '8021 4455 4021'
  const initial  = name.trim().charAt(0).toUpperCase() || 'U'
  const hasPin   = !!user?.has_pin

  const since = user?.created_at ? new Date(user.created_at) : null
  const sinceStr = since ? `${since.getDate()} ${MONTHS[since.getMonth()]} ${since.getFullYear()}` : '—'

  return (
    <div className="page-enter" style={{ minHeight: '100vh', background: T.pageGrad }}>
      {/* NAV */}
      <nav style={{ borderBottom: `1px solid ${T.border}`, background: 'rgba(11,10,7,0.72)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/dashboard" style={{ textDecoration: 'none', color: T.muted, fontFamily: FONT.sans, fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
            ← Dashboard
          </Link>
          <Logo size={34} textSize={17} />
          <button onClick={onLogout} className="icon-btn" title="Keluar" style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 14px', borderRadius: 12, border: `1px solid ${T.border}`, background: T.surface2, color: T.muted, cursor: 'pointer', fontFamily: FONT.sans, fontSize: 14, fontWeight: 600 }}>
            <LogoutIcon size={16} /> Keluar
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 24px 80px' }}>

        {/* ===== HEADER (avatar + saldo) ===== */}
        <div style={{ background: T.cardGrad, borderRadius: 26, padding: '34px 32px', position: 'relative', overflow: 'hidden', marginBottom: 20, color: '#fff', boxShadow: '0 28px 56px -22px rgba(201,149,43,0.55)' }}>
          <div style={{ position: 'absolute', right: -30, top: -30, width: 180, height: 180, border: '2px solid rgba(255,255,255,0.16)', borderRadius: '50%', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', right: 30, bottom: -40, width: 120, height: 120, border: '2px solid rgba(255,255,255,0.10)', borderRadius: '50%', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(300px 200px at 85% -10%, rgba(255,255,255,0.22), transparent 65%)', pointerEvents: 'none' }} />

          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 22, flexWrap: 'wrap' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT.display, fontWeight: 700, fontSize: 34, color: '#fff', flex: 'none' }}>
              {initial}
            </div>
            <div style={{ flex: 1, minWidth: 180 }}>
              <div style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 26, letterSpacing: '-0.01em', marginBottom: 4 }}>{name}</div>
              <div style={{ fontFamily: FONT.mono, fontSize: 13, letterSpacing: '0.04em', color: 'rgba(255,255,255,0.75)' }}>{username}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 12px', borderRadius: 999, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.3)', fontFamily: FONT.mono, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#fff' }}>
                  <CheckIcon size={12} strokeWidth={2.5} /> Terverifikasi
                </span>
                <span style={{ fontFamily: FONT.mono, fontSize: 11, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.04em' }}>Bergabung {sinceStr}</span>
              </div>
            </div>
            {/* tombol edit */}
            <button onClick={() => setEditOpen(true)} style={{ cursor: 'pointer', border: '1px solid rgba(255,255,255,0.35)', background: 'rgba(255,255,255,0.14)', color: '#fff', padding: '10px 18px', borderRadius: 12, fontFamily: FONT.sans, fontSize: 14, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 7 }}>
              <UserIcon size={16} /> Edit Profil
            </button>
          </div>

          <div style={{ position: 'relative', marginTop: 28, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.16)' }}>
            <div style={{ fontFamily: FONT.mono, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', marginBottom: 6 }}>Saldo Tersedia</div>
            <div style={{ fontFamily: FONT.mono, fontWeight: 600, fontSize: 36, letterSpacing: '-0.01em', fontFeatureSettings: "'tnum'" }}>{hydrated ? fmtRp(balance) : '···'}</div>
            <div style={{ fontFamily: FONT.mono, fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 4, letterSpacing: '0.06em' }}>No. akun: {account}</div>
          </div>
        </div>

        {/* ===== INFO AKUN ===== */}
        <Section title="Informasi Akun" action={<button onClick={() => setEditOpen(true)} style={editLink}>Edit</button>}>
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
            desc={hasPin ? '6 digit PIN aktif untuk semua transaksi keluar' : 'Belum diatur — wajib untuk transfer & bayar'}
            badge={hasPin ? 'Aktif' : 'Belum diatur'}
            badgeColor={hasPin ? T.inGreen : T.warn}
            action={<button onClick={() => setPinOpen(true)} style={pinBtn}>{hasPin ? 'Ubah PIN' : 'Atur PIN'}</button>}
          />
          <SecurityRow
            icon={<PhoneIcon size={18} />}
            title="OTP WhatsApp"
            desc="Kode verifikasi via WhatsApp"
            badge="Aktif"
            badgeColor={T.inGreen}
          />
          <SecurityRow
            icon={<ShieldCheckIcon size={18} />}
            title="Verifikasi Identitas (KYC)"
            desc="KTP & selfie untuk limit penuh"
            badge="Basic"
            badgeColor={T.muted}
            noBorder
          />
        </Section>

        {/* ===== LEVEL AKUN ===== */}
        <Section title="Level Akun">
          <div style={{ padding: '18px 0 4px' }}>
            <LevelBar />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 20 }}>
              <LevelCard icon={<ShieldIcon size={18} />} title="Basic" active points={['Simpan hingga Rp 2 juta', 'Transfer sesama TrustPay', 'Top up via VA & QRIS']} />
              <LevelCard icon={<IdCardIcon size={18} />} title="Premium" active={false} points={['Simpan hingga Rp 20 juta', 'Transfer ke rekening bank', 'Limit transaksi lebih besar']} cta="Upload KTP" />
            </div>
          </div>
        </Section>

        <Link to="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '15px 0', borderRadius: 14, background: T.btnGrad, color: T.onGold, fontFamily: FONT.sans, fontSize: 15, fontWeight: 700, marginTop: 8, boxShadow: '0 14px 30px -12px rgba(201,149,43,0.6)' }}>
          Kembali ke Dashboard <ArrowRightIcon size={16} />
        </Link>
      </div>

      {editOpen && <EditProfileModal user={user} onClose={() => setEditOpen(false)} onDone={() => setEditOpen(false)} />}
      {pinOpen && <PinSetupModal hasPin={hasPin} onClose={() => setPinOpen(false)} onDone={() => setPinOpen(false)} />}
    </div>
  )
}

function Section({ title, action, children }) {
  return (
    <div style={{ background: T.surface, borderRadius: 18, border: `1px solid ${T.border}`, boxShadow: '0 18px 44px -30px rgba(0,0,0,0.8)', padding: '22px 24px', marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3 style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 17, margin: 0, color: T.ink }}>{title}</h3>
        {action}
      </div>
      {children}
    </div>
  )
}

function InfoRow({ icon, label, value, noBorder }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 0', borderBottom: noBorder ? 'none' : `1px solid ${T.border}` }}>
      <span style={{ color: T.muted, display: 'flex', flex: 'none' }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: FONT.mono, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: T.muted, marginBottom: 3 }}>{label}</div>
        <div style={{ fontSize: 15, fontWeight: 500, color: T.ink }}>{value}</div>
      </div>
    </div>
  )
}

function SecurityRow({ icon, title, desc, badge, badgeColor, action, noBorder }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderBottom: noBorder ? 'none' : `1px solid ${T.border}` }}>
      <div style={{ width: 40, height: 40, borderRadius: 12, background: T.goldSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.goldBright, flex: 'none' }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: T.ink, marginBottom: 2 }}>{title}</div>
        <div style={{ fontSize: 13, color: T.muted }}>{desc}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 'none' }}>
        <span style={{ fontFamily: FONT.mono, fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '4px 10px', borderRadius: 999, background: badgeColor + '26', color: badgeColor, border: `1px solid ${badgeColor}40` }}>{badge}</span>
        {action}
      </div>
    </div>
  )
}

function LevelBar() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontFamily: FONT.mono, fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase', color: T.goldBright }}>Basic</span>
        <span style={{ fontFamily: FONT.mono, fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase', color: T.muted }}>Premium</span>
      </div>
      <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: '30%', background: T.btnGrad, borderRadius: 3 }} />
      </div>
      <div style={{ marginTop: 8, fontSize: 13, color: T.muted }}>Upload KTP untuk upgrade ke Premium dan buka limit penuh.</div>
    </div>
  )
}

function LevelCard({ icon, title, active, points, cta }) {
  return (
    <div style={{ borderRadius: 16, border: `1.5px solid ${active ? T.border2 : T.border}`, padding: '16px', background: active ? T.goldSoft : T.surface2, position: 'relative' }}>
      {active && (
        <div style={{ position: 'absolute', top: -1, right: 12, background: T.gold, color: '#fff', fontFamily: FONT.mono, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '3px 8px', borderRadius: '0 0 6px 6px' }}>Aktif</div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ color: active ? T.goldBright : T.muted, display: 'flex' }}>{icon}</span>
        <span style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 15, color: T.ink }}>{title}</span>
      </div>
      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {points.map((p, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 7, fontSize: 12.5, color: T.inkSoft }}>
            <span style={{ color: active ? T.goldBright : T.mutedDim, marginTop: 1, flex: 'none' }}><CheckIcon size={13} strokeWidth={2.2} /></span>
            {p}
          </li>
        ))}
      </ul>
      {cta && !active && (
        <button style={{ marginTop: 14, width: '100%', padding: '9px 0', borderRadius: 10, border: `1px solid ${T.border2}`, background: 'transparent', color: T.goldBright, fontFamily: FONT.sans, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>{cta}</button>
      )}
    </div>
  )
}

const editLink = { cursor: 'pointer', background: 'transparent', border: 'none', color: T.goldBright, fontFamily: FONT.sans, fontSize: 13.5, fontWeight: 700 }
const pinBtn = { cursor: 'pointer', background: T.btnGrad, border: 'none', color: T.onGold, padding: '8px 14px', borderRadius: 10, fontFamily: FONT.sans, fontSize: 13, fontWeight: 700 }
