import { Link } from 'react-router-dom'
import Logo from '../components/Logo.jsx'
import HeroScene from '../components/HeroScene.jsx'
import { CheckIcon } from '../components/icons.jsx'

// Landing page — ported from TrustPay.dc.html.
export default function Landing() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(900px 500px at 88% -8%, rgba(201,138,43,0.10), transparent 60%), radial-gradient(700px 600px at -5% 18%, rgba(17,32,61,0.06), transparent 55%), #EFF1EC',
      }}
    >
      {/* ===== NAV ===== */}
      <nav style={{ maxWidth: 1200, margin: '0 auto', padding: '22px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Logo />
        <div style={{ display: 'flex', alignItems: 'center', gap: 34 }}>
          <div className="hidden md:flex" style={{ gap: 30 }}>
            <a href="#fitur" style={navLink}>Fitur</a>
            <a href="#riwayat" style={navLink}>Riwayat</a>
            <a href="#keamanan" style={navLink}>Keamanan</a>
          </div>
          <Link to="/masuk" className="nav-cta" style={{ textDecoration: 'none', padding: '9px 20px', borderRadius: 10, border: '1.5px solid #11203D', color: '#11203D', fontSize: 14, fontWeight: 600, letterSpacing: '0.01em' }}>
            Masuk
          </Link>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section data-hero className="hero" style={{ maxWidth: 1200, margin: '0 auto', padding: '34px 28px 70px', display: 'flex', alignItems: 'center', gap: 40, justifyContent: 'space-between' }}>
        <div data-hero-copy className="hero-copy" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', maxWidth: 520 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9, padding: '7px 14px', borderRadius: 999, background: 'rgba(17,32,61,0.06)', border: '1px solid rgba(17,32,61,0.10)', marginBottom: 24 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#C98A2B' }} />
            <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#5C6B73' }}>Dompet digital · ledger-first</span>
          </div>

          <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 'clamp(40px, 5.4vw, 66px)', lineHeight: 1.05, letterSpacing: '-0.025em', margin: '0 0 22px', color: '#11203D', textWrap: 'balance' }}>
            Buku tabungan,<br />kini dalam genggaman.
          </h1>

          <p style={{ fontSize: 17, lineHeight: 1.6, color: '#39465c', margin: '0 0 34px', maxWidth: 460, textWrap: 'pretty' }}>
            Setiap rupiah tercatat, setiap waktu. Top up, transfer, dan audit tiap transaksi dalam satu dompet yang transparan — setiap baris berdiri sendiri, siap diperiksa.
          </p>

          <div data-hero-cta className="hero-cta" style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 26 }}>
            <Link to="/daftar" className="cta-gold" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 9, padding: '15px 28px', borderRadius: 10, background: '#C98A2B', color: '#1a1205', fontSize: 15, fontWeight: 700, letterSpacing: '0.01em', boxShadow: '0 12px 26px -10px rgba(201,138,43,0.7)' }}>
              Buka TrustPay Gratis
            </Link>
            <a href="#riwayat" className="cta-ghost" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, padding: '15px 24px', borderRadius: 10, border: '1.5px solid rgba(17,32,61,0.25)', color: '#11203D', fontSize: 15, fontWeight: 600 }}>
              Lihat Demo →
            </a>
          </div>

          <div data-trustline style={{ display: 'flex', alignItems: 'center', gap: 18, fontFamily: "'IBM Plex Mono',monospace", fontSize: 12, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#5C6B73' }}>
            <span>Tanpa biaya bulanan</span>
            <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#C98A2B' }} />
            <span>Riwayat permanen</span>
            <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#C98A2B' }} />
            <span>Audit-ready</span>
          </div>
        </div>

        <HeroScene />
      </section>

      {/* ===== FEATURES ===== */}
      <section id="fitur" style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 28px 40px' }}>
        <div style={{ maxWidth: 620, marginBottom: 44 }}>
          <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#C98A2B' }}>Elemen Signature</span>
          <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 'clamp(28px,3.4vw,40px)', lineHeight: 1.12, letterSpacing: '-0.02em', margin: '12px 0 0', color: '#11203D', textWrap: 'balance' }}>
            Bukan fintech generik. Ini buku tabungan yang tumbuh dewasa.
          </h2>
        </div>

        <div data-feat-grid className="feat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 22 }}>
          {/* card 1: ledger rail */}
          <FeatureCard
            title="Ledger Rail"
            body="Arah uang terlihat sekejap. Rail berwarna di tiap baris menandai dana masuk atau keluar — informasi struktural, bukan dekorasi."
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 22 }}>
              <RailRow accent="#2F6F4E" width={120} amount="+500K" amountColor="#2F6F4E" />
              <RailRow accent="#7A3142" width={100} amount="−150K" amountColor="#7A3142" />
              <RailRow accent="#C98A2B" width={130} amount="+1JT" amountColor="#5C6B73" />
            </div>
          </FeatureCard>

          {/* card 2: stempel */}
          <FeatureCard
            title="Stempel BERHASIL"
            body="Konfirmasi yang terasa nyata. Tiap transaksi sukses dicap stempel teller digital — bukan toast yang lewat begitu saja."
          >
            <div style={{ height: 96, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', marginBottom: 14 }}>
              <div style={{ width: 86, height: 86, border: '2.5px solid #C98A2B', borderRadius: '50%', transform: 'rotate(-8deg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#C98A2B', display: 'flex' }}><CheckIcon size={22} strokeWidth={2.6} /></span>
                <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, letterSpacing: '0.14em', color: '#C98A2B', textTransform: 'uppercase', marginTop: 3 }}>Berhasil</span>
              </div>
            </div>
          </FeatureCard>

          {/* card 3: slip perforasi */}
          <FeatureCard
            title="Slip Perforasi"
            body="Top up & transfer terasa seperti mengisi slip setoran. Familiar, jelas, tanpa salah langkah."
          >
            <div style={{ height: 96, marginBottom: 14, position: 'relative' }}>
              <div style={{ position: 'absolute', left: 0, right: 0, top: 6, height: 84, background: '#EFF1EC', borderRadius: '0 0 12px 12px', border: '1px solid rgba(17,32,61,0.08)', borderTop: 'none', padding: '16px 16px 0', overflow: 'hidden' }}>
                <div style={{ height: 8, width: '60%', background: 'rgba(17,32,61,0.12)', borderRadius: 4, marginBottom: 9 }} />
                <div style={{ height: 24, width: '80%', background: '#fff', border: '1px solid rgba(17,32,61,0.12)', borderRadius: 7, display: 'flex', alignItems: 'center', padding: '0 10px' }}>
                  <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 12, color: '#5C6B73' }}>Rp 250.000</span>
                </div>
              </div>
              <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 12, background: 'radial-gradient(circle 6px at 8px 12px, transparent 6px, #EFF1EC 6px)', backgroundSize: '18px 12px', backgroundRepeat: 'repeat-x' }} />
            </div>
          </FeatureCard>
        </div>
      </section>

      {/* ===== LEDGER SHOWCASE ===== */}
      <section id="riwayat" style={{ maxWidth: 1200, margin: '0 auto', padding: '50px 28px 60px' }}>
        <div style={{ background: '#11203D', borderRadius: 24, padding: '46px 44px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: -40, top: -40, width: 200, height: 200, border: '2px solid rgba(201,138,43,0.14)', borderRadius: '50%', transform: 'rotate(-8deg)' }} />
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, marginBottom: 30, flexWrap: 'wrap' }}>
            <div>
              <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#C98A2B' }}>Halaman Buku Tabungan</span>
              <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 'clamp(26px,3vw,36px)', lineHeight: 1.12, letterSpacing: '-0.02em', margin: '12px 0 0', color: '#EFF1EC', maxWidth: 520, textWrap: 'balance' }}>
                Riwayat yang menjelaskan dirinya sendiri.
              </h2>
            </div>
            <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(239,241,236,0.5)' }}>Per baris · audit-ready</span>
          </div>

          <div style={{ background: '#fbfcf9', borderRadius: 14, overflow: 'hidden', boxShadow: '0 30px 60px -24px rgba(0,0,0,0.5)' }}>
            <ShowcaseRow accent="#2F6F4E" date="21 Jun 2026" time="09:12" label="Masuk" who="dari Budi S." amount="+ Rp 500.000" balance="Rp 2.450.000" />
            <ShowcaseRow accent="#7A3142" date="20 Jun 2026" time="14:30" label="Keluar" who="ke Siti A." amount="− Rp 150.000" balance="Rp 1.950.000" />
            <ShowcaseRow accent="#C98A2B" date="18 Jun 2026" time="08:00" label="Top Up" who="—" whoColor="#5C6B73" amount="+ Rp 1.000.000" amountColor="#2F6F4E" balance="Rp 2.100.000" />
            <ShowcaseRow accent="#7A3142" date="15 Jun 2026" time="19:45" label="Keluar" who="ke Reza P." amount="− Rp 75.000" balance="Rp 1.100.000" last />
          </div>
        </div>
      </section>

      {/* ===== CLOSING CTA ===== */}
      <section id="keamanan" style={{ maxWidth: 1200, margin: '0 auto', padding: '30px 28px 90px' }}>
        <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto' }}>
          <div style={{ width: 64, height: 64, margin: '0 auto 26px', border: '2px solid #C98A2B', borderRadius: '50%', transform: 'rotate(-8deg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#C98A2B', display: 'flex' }}><CheckIcon size={20} strokeWidth={2.6} /></span>
            <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, letterSpacing: '0.14em', color: '#C98A2B', textTransform: 'uppercase', marginTop: 2 }}>Aman</span>
          </div>
          <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 'clamp(30px,4vw,46px)', lineHeight: 1.1, letterSpacing: '-0.025em', margin: '0 0 18px', color: '#11203D', textWrap: 'balance' }}>
            Mulai catat setiap rupiah hari ini.
          </h2>
          <p style={{ fontSize: 17, lineHeight: 1.6, color: '#5C6B73', margin: '0 0 32px' }}>
            Setiap baris transaksi self-explanatory untuk audit — desain dan struktur data sengaja dibuat selaras.
          </p>
          <Link to="/daftar" className="cta-gold" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 9, padding: '16px 34px', borderRadius: 10, background: '#C98A2B', color: '#1a1205', fontSize: 16, fontWeight: 700, letterSpacing: '0.01em', boxShadow: '0 14px 30px -10px rgba(201,138,43,0.7)' }}>
            Buka TrustPay Gratis →
          </Link>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer style={{ borderTop: '1px solid rgba(17,32,61,0.10)', maxWidth: 1200, margin: '0 auto', padding: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <Logo size={32} textSize={15} />
        <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 12, letterSpacing: '0.04em', color: '#5C6B73' }}>© 2026 Mini Wallet · Dibimbing.id</span>
      </footer>
    </div>
  )
}

const navLink = { color: '#11203D', textDecoration: 'none', fontSize: 15, fontWeight: 500, opacity: 0.8 }

function FeatureCard({ title, body, children }) {
  return (
    <div style={{ background: '#fff', borderRadius: 16, padding: 26, border: '1px solid rgba(17,32,61,0.06)', boxShadow: '0 14px 30px -22px rgba(17,32,61,0.4)' }}>
      {children}
      <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 500, fontSize: 20, margin: '0 0 10px', color: '#11203D' }}>{title}</h3>
      <p style={{ fontSize: 14.5, lineHeight: 1.6, color: '#5C6B73', margin: 0 }}>{body}</p>
    </div>
  )
}

function RailRow({ accent, width, amount, amountColor }) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
      <div style={{ width: 3, height: 22, borderRadius: 2, background: accent }} />
      <div style={{ height: 8, flex: 1, maxWidth: width, borderRadius: 4, background: 'rgba(17,32,61,0.10)' }} />
      <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 12, color: amountColor }}>{amount}</div>
    </div>
  )
}

function ShowcaseRow({ accent, date, time, label, who, whoColor = '#11203D', amount, amountColor = accent, balance, last }) {
  return (
    <div data-row style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '18px 22px', borderBottom: last ? 'none' : '1px solid #e4e7e0', position: 'relative' }}>
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: accent }} />
      <div style={{ position: 'absolute', left: 0, top: 14, width: 7, height: 7, borderRadius: '50%', background: accent, transform: 'translateX(-2px)' }} />
      <div style={{ width: 96, flex: 'none' }}>
        <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 13, color: '#11203D' }}>{date}</div>
        <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: '#5C6B73' }}>{time}</div>
      </div>
      <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: accent, border: `1px solid ${accent}66`, borderRadius: 999, padding: '3px 11px', flex: 'none' }}>{label}</span>
      <span style={{ flex: 1, fontSize: 15, fontWeight: 500, color: whoColor }}>{who}</span>
      <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 17, fontWeight: 500, color: amountColor, fontFeatureSettings: "'tnum'", minWidth: 118, textAlign: 'right' }}>{amount}</span>
      <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 13, color: '#5C6B73', fontFeatureSettings: "'tnum'", minWidth: 118, textAlign: 'right' }}>{balance}</span>
    </div>
  )
}
