import { useRef } from 'react'
import { CheckIcon, TransferIcon } from './icons.jsx'

// The interactive 3D card stack from the landing hero. Pointer tilt + glare,
// idle float, ported from the design's DC logic into a React component.
export default function HeroScene({ tiltStrength = 1 }) {
  const stageRef = useRef(null)
  const glareRef = useRef(null)

  const handleMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width
    const py = (e.clientY - r.top) / r.height
    const rx = (0.5 - py) * 18 * tiltStrength
    const ry = (px - 0.5) * 22 * tiltStrength
    if (stageRef.current) {
      stageRef.current.style.transform = `rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`
    }
    if (glareRef.current) {
      glareRef.current.style.background = `radial-gradient(360px circle at ${(px * 100).toFixed(1)}% ${(py * 100).toFixed(1)}%, rgba(255,255,255,0.30), rgba(255,255,255,0) 60%)`
    }
  }

  const handleLeave = () => {
    if (stageRef.current) stageRef.current.style.transform = 'rotateX(0deg) rotateY(0deg)'
    if (glareRef.current) glareRef.current.style.background = 'transparent'
  }

  return (
    <div
      data-scene-box
      style={{ position: 'relative', width: 480, height: 540, flex: 'none' }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      {/* ambient glow under the stack */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '62%',
          width: 380,
          height: 240,
          transform: 'translate(-50%,-50%)',
          background: 'radial-gradient(closest-side, rgba(17,32,61,0.18), transparent)',
          filter: 'blur(18px)',
          borderRadius: '50%',
        }}
      />

      <div
        data-floatwrap
        style={{
          position: 'absolute',
          inset: 0,
          animation: 'floatY 7s ease-in-out infinite',
          transformStyle: 'preserve-3d',
        }}
      >
        <div
          ref={stageRef}
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            transformStyle: 'preserve-3d',
            transition: 'transform 160ms cubic-bezier(.2,.7,.3,1)',
            willChange: 'transform',
          }}
        >
          {/* LAYER: ledger page behind */}
          <div
            style={{
              position: 'absolute',
              left: 70,
              top: 78,
              width: 340,
              height: 380,
              transform: 'translateZ(-50px) rotate(-3deg)',
              borderRadius: 16,
              boxShadow: '0 40px 70px -30px rgba(17,32,61,0.45)',
              overflow: 'hidden',
              background: '#fbfcf9',
              backgroundImage:
                'repeating-linear-gradient(#fbfcf9 0px, #fbfcf9 33px, #e4e7e0 33px, #e4e7e0 34px)',
            }}
          >
            <div
              style={{
                position: 'absolute',
                right: 18,
                bottom: 18,
                width: 96,
                height: 96,
                border: '2px solid rgba(201,138,43,0.28)',
                borderRadius: '50%',
                transform: 'rotate(-8deg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span
                style={{
                  fontFamily: "'IBM Plex Mono',monospace",
                  fontSize: 11,
                  letterSpacing: '0.14em',
                  color: 'rgba(201,138,43,0.4)',
                  textTransform: 'uppercase',
                }}
              >
                LUNAS
              </span>
            </div>
            <Dot top={14} color="#2F6F4E" />
            <Dot top={120} color="#7A3142" />
            <Dot top={226} color="#C98A2B" />
          </div>

          {/* LAYER: Card Saldo (digital wallet card) */}
          <div
            style={{
              position: 'absolute',
              left: 22,
              top: 132,
              width: 362,
              height: 256,
              transform: 'translateZ(24px)',
              borderRadius: 20,
              padding: '22px 24px',
              color: '#EFF1EC',
              overflow: 'hidden',
              background: 'linear-gradient(155deg,#1f3560 0%,#11203D 58%,#0d1830 100%)',
              boxShadow: '0 26px 50px -18px rgba(17,32,61,0.6)',
            }}
          >
            <div ref={glareRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', borderRadius: 20, background: 'transparent' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(160px 80px at 82% 6%, rgba(201,138,43,0.16), transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', right: -22, bottom: -26, width: 120, height: 120, border: '2px solid rgba(201,138,43,0.18)', borderRadius: '50%', transform: 'rotate(-8deg)' }} />

            {/* top row: wordmark + contactless */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#C98A2B' }} />
                <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 15, letterSpacing: '0.01em' }}>TrustPay</span>
              </div>
              <Contactless />
            </div>

            {/* chip + card number */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 16, position: 'relative' }}>
              <Chip />
              <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 15, letterSpacing: '0.1em', color: 'rgba(239,241,236,0.85)', fontFeatureSettings: "'tnum'" }}>•••• •••• •••• 4021</span>
            </div>

            {/* saldo */}
            <div style={{ marginTop: 16, position: 'relative' }}>
              <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(239,241,236,0.55)', marginBottom: 4 }}>Saldo Anda</div>
              <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontWeight: 500, fontSize: 32, letterSpacing: '-0.01em', fontFeatureSettings: "'tnum'" }}>Rp 2.450.000</div>
            </div>

            {/* buttons */}
            <div style={{ display: 'flex', gap: 10, marginTop: 18, position: 'relative' }}>
              <div style={{ flex: 1, textAlign: 'center', padding: '11px 0', borderRadius: 10, background: '#C98A2B', color: '#1a1205', fontSize: 14, fontWeight: 700 }}>+ Top Up</div>
              <div style={{ flex: 1, padding: '11px 0', borderRadius: 10, border: '1.5px solid rgba(239,241,236,0.4)', color: '#EFF1EC', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}><TransferIcon size={16} /> Transfer</div>
            </div>
          </div>

          {/* floating chip — masuk */}
          <FloatChip
            style={{ right: -6, top: 64, width: 236, transform: 'translateZ(88px)' }}
            accent="#2F6F4E"
            label="Masuk"
            who="dari Budi S."
            date="21 JUN · 09:12"
            amount="+500K"
          />

          {/* floating chip — keluar */}
          <FloatChip
            style={{ left: -22, bottom: 42, width: 240, transform: 'translateZ(104px)' }}
            accent="#7A3142"
            label="Keluar"
            who="ke Siti A."
            date="20 JUN · 14:30"
            amount="−150K"
          />

          {/* stempel BERHASIL */}
          <div style={{ position: 'absolute', right: 18, bottom: 74, width: 104, height: 104, transform: 'translateZ(150px)', animation: 'stampPulse 3.6s ease-in-out infinite' }}>
            <div
              style={{
                width: '100%',
                height: '100%',
                border: '2.5px solid #C98A2B',
                borderRadius: '50%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(239,241,236,0.86)',
                backdropFilter: 'blur(2px)',
                boxShadow: '0 18px 30px -12px rgba(201,138,43,0.55)',
              }}
            >
              <span style={{ color: '#C98A2B', display: 'flex' }}><CheckIcon size={24} strokeWidth={2.6} /></span>
              <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, letterSpacing: '0.16em', color: '#C98A2B', textTransform: 'uppercase', marginTop: 4 }}>Berhasil</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Dot({ top, color }) {
  return <div style={{ position: 'absolute', left: 20, top, width: 8, height: 8, borderRadius: '50%', background: color }} />
}

function Contactless() {
  return (
    <div style={{ width: 16, height: 22, overflow: 'hidden', position: 'relative', opacity: 0.55 }}>
      <div style={{ position: 'absolute', left: -9, top: 4, width: 13, height: 13, border: '1.5px solid #EFF1EC', borderRadius: '50%' }} />
      <div style={{ position: 'absolute', left: -13, top: 0, width: 21, height: 21, border: '1.5px solid #EFF1EC', borderRadius: '50%' }} />
      <div style={{ position: 'absolute', left: -17, top: -4, width: 29, height: 29, border: '1.5px solid #EFF1EC', borderRadius: '50%' }} />
    </div>
  )
}

function Chip() {
  return (
    <div style={{ width: 38, height: 28, borderRadius: 6, background: 'linear-gradient(150deg,#EAD08A,#C98A2B)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
      <div style={{ width: 22, height: 15, border: '1px solid rgba(17,32,61,0.35)', borderRadius: 3 }} />
    </div>
  )
}

function FloatChip({ style, accent, label, who, date, amount }) {
  return (
    <div
      style={{
        position: 'absolute',
        background: '#fff',
        borderRadius: 13,
        padding: '13px 15px',
        boxShadow: '0 22px 40px -16px rgba(17,32,61,0.4)',
        display: 'flex',
        gap: 11,
        alignItems: 'center',
        ...style,
      }}
    >
      <div style={{ width: 3, alignSelf: 'stretch', borderRadius: 2, background: accent }} />
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
          <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: accent, border: `1px solid ${accent}66`, borderRadius: 999, padding: '2px 8px' }}>{label}</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#11203D' }}>{who}</span>
        </div>
        <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: '#5C6B73', letterSpacing: '0.04em' }}>{date}</div>
      </div>
      <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 15, fontWeight: 500, color: accent, fontFeatureSettings: "'tnum'" }}>{amount}</div>
    </div>
  )
}
