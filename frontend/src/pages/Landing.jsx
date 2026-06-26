import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Logo from '../components/Logo.jsx'
import HeroScene from '../components/HeroScene.jsx'
import { CheckIcon, PlusIcon, TransferIcon, QrIcon, LockIcon, ShieldCheckIcon } from '../components/icons.jsx'
import { T, FONT } from '../lib/theme.js'

// Black + Gold palette (dark mode)
const INK = T.ink
const MUTED = T.muted
const SURFACE = T.surface
const SURFACE2 = T.surface2
const BORDER = T.border
const GOLD = T.gold
const GOLDBRIGHT = T.goldBright
const GREEN = T.inGreen
const ROSE = T.outRose
const DARKGRAD = 'linear-gradient(155deg, #241D12 0%, #0C0905 100%)'

/**
 * Landing — parallax, scroll-reveal, dan ambient motion (tema gelap + ungu).
 * Semua efek digerakkan dua listener global (scroll + IntersectionObserver)
 * dan menurun anggun saat prefers-reduced-motion.
 */
export default function Landing() {
  const [scrolled, setScrolled] = useState(false)

  // ---- scroll-driven parallax + progress bar ----
  useEffect(() => {
    let raf = 0
    const bar = document.getElementById('scroll-progress')
    let items = []
    const measure = () => {
      items = Array.from(document.querySelectorAll('[data-parallax]')).map((el) => ({
        el,
        speed: parseFloat(el.dataset.parallax) || 0,
        base: el.getBoundingClientRect().top + window.scrollY,
      }))
    }
    const apply = () => {
      raf = 0
      const y = window.scrollY
      const vh = window.innerHeight
      const max = document.documentElement.scrollHeight - vh
      if (bar) bar.style.setProperty('--p', max > 0 ? (y / max).toFixed(4) : '0')
      setScrolled(y > 12)
      for (const it of items) {
        const rel = y + vh / 2 - it.base
        it.el.style.setProperty('--py', (rel * it.speed).toFixed(1) + 'px')
      }
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(apply) }
    const onResize = () => { measure(); apply() }
    measure()
    apply()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  // ---- reveal-on-scroll ----
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('in-view')
            io.unobserve(e.target)
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    )
    document.querySelectorAll('.reveal').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflowX: 'clip', background: T.pageGrad }}>
      {/* scroll progress bar */}
      <div id="scroll-progress" className="scroll-progress" />

      {/* ===== NAV ===== */}
      <nav
        style={{
          position: 'sticky', top: 0, zIndex: 40,
          transition: 'background .3s ease, box-shadow .3s ease, backdrop-filter .3s ease',
          background: scrolled ? 'rgba(11,10,7,0.82)' : 'transparent',
          backdropFilter: scrolled ? 'blur(10px)' : 'none',
          boxShadow: scrolled ? `0 1px 0 ${BORDER}` : 'none',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '18px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Logo />
          <div style={{ display: 'flex', alignItems: 'center', gap: 30 }}>
            <div className="nav-links" style={{ display: 'flex', gap: 30 }}>
              <a href="#fitur" className="ul-link" style={navLink}>Fitur</a>
              <a href="#cara" className="ul-link" style={navLink}>Cara Kerja</a>
              <a href="#riwayat" className="ul-link" style={navLink}>Riwayat</a>
            </div>
            <Link to="/masuk" className="nav-cta" style={{ textDecoration: 'none', padding: '9px 20px', borderRadius: 10, border: `1.5px solid ${T.border2}`, color: INK, fontSize: 14, fontWeight: 600, letterSpacing: '0.01em' }}>
              Masuk
            </Link>
          </div>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section data-hero className="hero landing-section" style={{ position: 'relative', maxWidth: 1200, margin: '0 auto', padding: '34px 28px 70px', display: 'flex', alignItems: 'center', gap: 40, justifyContent: 'space-between' }}>
        <div className="blob blob-gold blob-anim parallax" data-parallax="0.12" style={{ width: 460, height: 460, left: '52%', top: -120 }} />
        <div className="blob blob-carbon blob-anim parallax" data-parallax="0.06" style={{ width: 360, height: 360, left: -140, top: 120, animationDelay: '3s' }} />

        <div data-hero-copy className="hero-copy" style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', maxWidth: 540 }}>
          <div className="reveal" style={{ display: 'inline-flex', alignItems: 'center', gap: 9, padding: '7px 14px', borderRadius: 999, background: T.goldSoft, border: `1px solid ${T.border2}`, marginBottom: 24 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: GOLDBRIGHT, boxShadow: '0 0 0 4px rgba(245,206,83,0.25)' }} />
            <span style={{ fontFamily: FONT.mono, fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: MUTED }}>E-wallet modern · aman</span>
          </div>

          <h1 className="reveal" style={{ '--d': '.06s', fontFamily: FONT.display, fontWeight: 700, fontSize: 'clamp(38px, 5.4vw, 66px)', lineHeight: 1.04, letterSpacing: '-0.025em', margin: '0 0 22px', color: INK, textWrap: 'balance' }}>
            Dompet digital,<br />kini <span className="gold-grad">dalam genggaman.</span>
          </h1>

          <p className="reveal" style={{ '--d': '.12s', fontSize: 17, lineHeight: 1.6, color: T.inkSoft, margin: '0 0 34px', maxWidth: 470, textWrap: 'pretty' }}>
            Top up, transfer, dan bayar tagihan dalam satu dompet yang transparan. Setiap transaksi keluar diamankan PIN 6 digit — dana & data pribadimu terlindungi.
          </p>

          <div data-hero-cta className="hero-cta reveal" style={{ '--d': '.18s', display: 'flex', gap: 14, alignItems: 'center', marginBottom: 26, flexWrap: 'wrap' }}>
            <Link to="/daftar" className="cta-gold-btn" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 9, padding: '15px 28px', borderRadius: 12, background: T.btnGrad, color: T.onGold, fontSize: 15, fontWeight: 700, letterSpacing: '0.01em', boxShadow: '0 14px 30px -10px rgba(201,149,43,0.7)' }}>
              Buka TrustPay Gratis
            </Link>
            <a href="#riwayat" className="cta-ghost" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, padding: '15px 24px', borderRadius: 12, border: `1.5px solid ${T.border2}`, color: INK, fontSize: 15, fontWeight: 600 }}>
              Lihat Demo →
            </a>
          </div>

          <div data-trustline className="reveal" style={{ '--d': '.24s', display: 'flex', alignItems: 'center', gap: 18, fontFamily: FONT.mono, fontSize: 12, letterSpacing: '0.04em', textTransform: 'uppercase', color: MUTED }}>
            <span>Tanpa biaya bulanan</span>
            <span style={{ width: 4, height: 4, borderRadius: '50%', background: GOLDBRIGHT }} />
            <span>PIN keamanan</span>
            <span style={{ width: 4, height: 4, borderRadius: '50%', background: GOLDBRIGHT }} />
            <span>Audit-ready</span>
          </div>
        </div>

        <div className="parallax" data-parallax="-0.05" style={{ position: 'relative', zIndex: 1 }}>
          <HeroScene />
        </div>
      </section>

      {/* ===== STATS BAND ===== */}
      <section className="landing-section" style={{ maxWidth: 1200, margin: '0 auto', padding: '10px 28px 56px' }}>
        <div className="stats-grid reveal" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
          <Stat value={0} prefix="Rp " label="Biaya admin bulanan" />
          <Stat value={100} suffix="%" label="Transaksi tercatat" />
          <Stat value={6} suffix=" digit" label="PIN tiap transaksi" />
          <Stat value={24} suffix="/7" label="Akses kapan saja" />
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="fitur" className="landing-section" style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 28px 40px' }}>
        <div className="reveal" style={{ maxWidth: 640, marginBottom: 44 }}>
          <span style={{ fontFamily: FONT.mono, fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: GOLDBRIGHT }}>Elemen Signature</span>
          <h2 style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 'clamp(28px,3.4vw,40px)', lineHeight: 1.12, letterSpacing: '-0.02em', margin: '12px 0 0', color: INK, textWrap: 'balance' }}>
            E-wallet yang aman, simpel, dan transparan.
          </h2>
        </div>

        <div data-feat-grid className="feat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 22 }}>
          <FeatureCard delay=".02s" title="PIN Keamanan" body="Setiap transfer & pembayaran wajib PIN 6 digit. Token bocor pun, dana tetap aman tanpa PIN-mu.">
            <div style={{ height: 96, display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <span key={i} style={{ width: 14, height: 14, borderRadius: '50%', background: i < 4 ? GOLDBRIGHT : 'transparent', border: `2px solid ${i < 4 ? GOLDBRIGHT : T.border2}` }} />
              ))}
              <span style={{ marginLeft: 6, color: GOLDBRIGHT, display: 'flex' }}><LockIcon size={22} /></span>
            </div>
          </FeatureCard>

          <FeatureCard delay=".1s" title="Stempel BERHASIL" body="Konfirmasi yang terasa nyata. Tiap transaksi sukses dicap stempel digital — bukan toast yang lewat begitu saja.">
            <div style={{ height: 96, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', marginBottom: 14 }}>
              <div style={{ width: 86, height: 86, border: `2.5px solid ${GOLDBRIGHT}`, borderRadius: '50%', transform: 'rotate(-8deg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: GOLDBRIGHT, display: 'flex' }}><CheckIcon size={22} strokeWidth={2.6} /></span>
                <span style={{ fontFamily: FONT.mono, fontSize: 10, letterSpacing: '0.14em', color: GOLDBRIGHT, textTransform: 'uppercase', marginTop: 3 }}>Berhasil</span>
              </div>
            </div>
          </FeatureCard>

          <FeatureCard delay=".18s" title="Bayar Tagihan" body="Pulsa, PLN, PDAM, internet — input nominal, saldo otomatis terpotong. Cepat dan tanpa ribet.">
            <div style={{ height: 96, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
              {[PlusIcon, TransferIcon, QrIcon].map((Ic, i) => (
                <span key={i} style={{ width: 46, height: 46, borderRadius: 14, background: T.goldSoft, color: GOLDBRIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${T.border2}` }}><Ic size={20} /></span>
              ))}
            </div>
          </FeatureCard>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="cara" className="landing-section" style={{ maxWidth: 1200, margin: '0 auto', padding: '50px 28px 30px' }}>
        <div className="reveal" style={{ textAlign: 'center', maxWidth: 560, margin: '0 auto 40px' }}>
          <span style={{ fontFamily: FONT.mono, fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: GOLDBRIGHT }}>Tiga Langkah</span>
          <h2 style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 'clamp(26px,3vw,38px)', lineHeight: 1.12, letterSpacing: '-0.02em', margin: '12px 0 0', color: INK }}>
            Mulai dalam hitungan menit.
          </h2>
        </div>
        <div className="steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 22 }}>
          <StepCard n="01" delay=".02s" Icon={PlusIcon} title="Daftar & Atur PIN" body="Buat akun gratis, atur PIN transaksi 6 digit. Tanpa biaya bulanan." />
          <StepCard n="02" delay=".12s" Icon={TransferIcon} title="Transfer & Bayar" body="Kirim ke sesama pengguna atau bayar tagihan. Konfirmasi dengan PIN." />
          <StepCard n="03" delay=".22s" Icon={QrIcon} title="Audit & Ekspor" body="Filter, cari, dan ekspor riwayat ke CSV/PDF. Setiap baris self-explanatory." />
        </div>
      </section>

      {/* ===== LEDGER SHOWCASE ===== */}
      <section id="riwayat" className="landing-section" style={{ maxWidth: 1200, margin: '0 auto', padding: '50px 28px 60px' }}>
        <div className="reveal zoom" style={{ background: DARKGRAD, borderRadius: 24, padding: '46px 44px', position: 'relative', overflow: 'hidden', border: `1px solid ${BORDER}` }}>
          <div className="parallax" data-parallax="0.08" style={{ position: 'absolute', right: -40, top: -40, width: 220, height: 220, border: '2px solid rgba(245,206,83,0.30)', borderRadius: '50%', transform: 'rotate(-8deg)' }} />
          <div className="parallax" data-parallax="0.14" style={{ position: 'absolute', right: 60, bottom: -30, width: 120, height: 120, border: '2px solid rgba(245,206,83,0.16)', borderRadius: '50%' }} />
          <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, marginBottom: 30, flexWrap: 'wrap' }}>
            <div>
              <span style={{ fontFamily: FONT.mono, fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: GOLDBRIGHT }}>Mutasi Rekening</span>
              <h2 style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 'clamp(26px,3vw,36px)', lineHeight: 1.12, letterSpacing: '-0.02em', margin: '12px 0 0', color: INK, maxWidth: 520, textWrap: 'balance' }}>
                Riwayat yang menjelaskan dirinya sendiri.
              </h2>
            </div>
            <span style={{ fontFamily: FONT.mono, fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase', color: MUTED }}>Per baris · audit-ready</span>
          </div>

          <div style={{ position: 'relative', background: SURFACE, borderRadius: 16, overflow: 'hidden', border: `1px solid ${BORDER}`, boxShadow: '0 30px 60px -24px rgba(0,0,0,0.6)' }}>
            <ShowcaseRow accent={GREEN} date="21 Jun 2026" time="09:12" label="Masuk" who="dari Budi S." amount="+ Rp 500.000" balance="Rp 2.450.000" delay=".05s" />
            <ShowcaseRow accent={ROSE} date="20 Jun 2026" time="14:30" label="Keluar" who="ke Siti A." amount="− Rp 150.000" balance="Rp 1.950.000" delay=".12s" />
            <ShowcaseRow accent={GOLDBRIGHT} date="18 Jun 2026" time="08:00" label="Top Up" who="—" whoColor={MUTED} amount="+ Rp 1.000.000" amountColor={GREEN} balance="Rp 2.100.000" delay=".19s" />
            <ShowcaseRow accent={ROSE} date="15 Jun 2026" time="19:45" label="Keluar" who="ke Reza P." amount="− Rp 75.000" balance="Rp 1.100.000" last delay=".26s" />
          </div>
        </div>
      </section>

      {/* ===== MARQUEE TRUSTBAND ===== */}
      <section className="marquee-mask" style={{ overflow: 'hidden', padding: '8px 0 36px' }}>
        <div className="marquee" style={{ alignItems: 'center' }}>
          {[...MARQUEE, ...MARQUEE].map((t, i) => (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 18, padding: '0 26px', fontFamily: FONT.mono, fontSize: 13, letterSpacing: '0.06em', textTransform: 'uppercase', color: MUTED, whiteSpace: 'nowrap' }}>
              {t}
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: GOLDBRIGHT }} />
            </span>
          ))}
        </div>
      </section>

      {/* ===== CLOSING CTA ===== */}
      <section id="keamanan" className="landing-section" style={{ maxWidth: 1100, margin: '0 auto', padding: '20px 28px 90px' }}>
        <div className="reveal" style={{ position: 'relative', overflow: 'hidden', textAlign: 'center', borderRadius: 28, padding: 'clamp(40px,6vw,72px) 28px', background: T.cardGrad }}>
          <div className="parallax" data-parallax="0.1" style={{ position: 'absolute', left: '50%', top: -80, width: 320, height: 320, transform: 'translateX(-50%)', background: 'radial-gradient(circle, rgba(255,255,255,0.25), transparent 70%)', filter: 'blur(30px)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', maxWidth: 640, margin: '0 auto' }}>
            <div style={{ width: 64, height: 64, margin: '0 auto 26px', border: '2px solid rgba(255,255,255,0.85)', borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <ShieldCheckIcon size={26} />
            </div>
            <h2 style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 'clamp(30px,4vw,46px)', lineHeight: 1.1, letterSpacing: '-0.025em', margin: '0 0 18px', color: '#fff', textWrap: 'balance' }}>
              Amankan setiap transaksimu hari ini.
            </h2>
            <p style={{ fontSize: 17, lineHeight: 1.6, color: 'rgba(255,255,255,0.85)', margin: '0 0 32px' }}>
              PIN transaksi, riwayat permanen, dan ekspor audit — keamanan dana dan data pribadi jadi prioritas.
            </p>
            <Link to="/daftar" className="cta-gold-btn" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 9, padding: '16px 34px', borderRadius: 12, background: '#fff', color: T.goldDeep, fontSize: 16, fontWeight: 700, letterSpacing: '0.01em', boxShadow: '0 14px 30px -10px rgba(0,0,0,0.4)' }}>
              Buka TrustPay Gratis →
            </Link>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer style={{ borderTop: `1px solid ${BORDER}`, maxWidth: 1200, margin: '0 auto', padding: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <Logo size={32} textSize={15} />
        <span style={{ fontFamily: FONT.mono, fontSize: 12, letterSpacing: '0.04em', color: MUTED }}>© 2026 Mini Wallet · Dibimbing.id</span>
      </footer>
    </div>
  )
}

const MARQUEE = ['Tanpa biaya bulanan', 'PIN keamanan', 'Ekspor CSV & PDF', 'OTP WhatsApp', 'QR terima uang', 'Audit-ready']

const navLink = { color: INK, textDecoration: 'none', fontSize: 15, fontWeight: 500, opacity: 0.82 }

// Animated count-up statistic.
function Stat({ value, prefix = '', suffix = '', label }) {
  const ref = useRef(null)
  const [n, setN] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) { setN(value); return }
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      io.disconnect()
      const dur = 1100
      const t0 = performance.now()
      const tick = (t) => {
        const p = Math.min(1, (t - t0) / dur)
        setN(Math.round(value * (1 - Math.pow(1 - p, 3))))
        if (p < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }, { threshold: 0.4 })
    io.observe(el)
    return () => io.disconnect()
  }, [value])
  return (
    <div ref={ref} style={{ background: SURFACE, borderRadius: 16, border: `1px solid ${BORDER}`, boxShadow: '0 18px 44px -30px rgba(0,0,0,0.8)', padding: '22px 22px' }}>
      <div style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 'clamp(30px,3.4vw,40px)', letterSpacing: '-0.02em', color: INK, lineHeight: 1 }}>
        {prefix}{n.toLocaleString('id-ID')}{suffix}
      </div>
      <div style={{ marginTop: 8, fontSize: 13.5, color: MUTED }}>{label}</div>
    </div>
  )
}

function StepCard({ n, Icon, title, body, delay }) {
  return (
    <div className="feat-card reveal" style={{ '--d': delay, background: SURFACE, borderRadius: 18, padding: 28, border: `1px solid ${BORDER}`, boxShadow: '0 18px 44px -30px rgba(0,0,0,0.8)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <span style={{ width: 46, height: 46, borderRadius: 14, background: T.goldSoft, color: GOLDBRIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${T.border2}` }}>
          <Icon size={22} />
        </span>
        <span style={{ fontFamily: FONT.mono, fontSize: 28, fontWeight: 500, color: 'rgba(255,255,255,0.12)' }}>{n}</span>
      </div>
      <h3 style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 20, margin: '0 0 10px', color: INK }}>{title}</h3>
      <p style={{ fontSize: 14.5, lineHeight: 1.6, color: MUTED, margin: 0 }}>{body}</p>
    </div>
  )
}

function FeatureCard({ title, body, children, delay }) {
  return (
    <div className="feat-card reveal" style={{ '--d': delay, background: SURFACE, borderRadius: 16, padding: 26, border: `1px solid ${BORDER}`, boxShadow: '0 18px 44px -30px rgba(0,0,0,0.8)' }}>
      {children}
      <h3 style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 20, margin: '0 0 10px', color: INK }}>{title}</h3>
      <p style={{ fontSize: 14.5, lineHeight: 1.6, color: MUTED, margin: 0 }}>{body}</p>
    </div>
  )
}

function ShowcaseRow({ accent, date, time, label, who, whoColor = INK, amount, amountColor = accent, balance, last, delay }) {
  return (
    <div data-row className="reveal from-left" style={{ '--d': delay, display: 'flex', alignItems: 'center', gap: 18, padding: '18px 22px', borderBottom: last ? 'none' : `1px solid ${BORDER}`, position: 'relative' }}>
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: accent }} />
      <div style={{ position: 'absolute', left: 0, top: 14, width: 7, height: 7, borderRadius: '50%', background: accent, transform: 'translateX(-2px)' }} />
      <div style={{ width: 96, flex: 'none' }}>
        <div style={{ fontFamily: FONT.mono, fontSize: 13, color: INK }}>{date}</div>
        <div style={{ fontFamily: FONT.mono, fontSize: 11, color: MUTED }}>{time}</div>
      </div>
      <span style={{ fontFamily: FONT.mono, fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: accent, border: `1px solid ${accent}66`, borderRadius: 999, padding: '3px 11px', flex: 'none' }}>{label}</span>
      <span style={{ flex: 1, fontSize: 15, fontWeight: 500, color: whoColor }}>{who}</span>
      <span style={{ fontFamily: FONT.mono, fontSize: 17, fontWeight: 500, color: amountColor, fontFeatureSettings: "'tnum'", minWidth: 118, textAlign: 'right' }}>{amount}</span>
      <span style={{ fontFamily: FONT.mono, fontSize: 13, color: MUTED, fontFeatureSettings: "'tnum'", minWidth: 118, textAlign: 'right' }}>{balance}</span>
    </div>
  )
}

