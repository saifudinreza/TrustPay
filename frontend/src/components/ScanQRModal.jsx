import { useCallback, useEffect, useRef, useState } from 'react'
import jsQR from 'jsqr'
import { Overlay, SubmitButton, modalTitle, closeBtn, label } from './TopUpModal.jsx'
import { CloseIcon, AlertIcon, CheckIcon, CameraIcon } from './icons.jsx'
import { group, validateNominal, fmtRp } from '../lib/wallet.js'
import { T, FONT } from '../lib/theme.js'

export default function ScanQRModal({ balance, onClose, onPay }) {
  const videoRef   = useRef(null)
  const canvasRef  = useRef(null)
  const streamRef  = useRef(null)
  const timerRef   = useRef(null)

  const [phase, setPhase]           = useState('init')
  const [merchant, setMerchant]     = useState('')
  const [raw, setRaw]               = useState('')
  const [rawTouched, setRawTouched] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [balErr, setBalErr]         = useState(false)

  const v       = validateNominal(raw)
  const showErr = rawTouched && !!v.err
  const amt     = v.n || 0
  const canPay  = !v.err && amt > 0 && amt <= balance && !submitting

  const stopCam = useCallback(() => {
    clearTimeout(timerRef.current)
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
    streamRef.current = null
  }, [])

  const processQR = useCallback((data) => {
    let name = ''
    let prefillAmt = ''

    if (data.startsWith('00020101') || data.startsWith('000201')) {
      const mLen = data.match(/5902(\d{2})/)
      if (mLen) {
        const len = parseInt(mLen[1], 10)
        const idx = data.indexOf(mLen[0]) + mLen[0].length
        name = data.substring(idx, idx + len).trim()
      }
      const aLen = data.match(/5403(\d+)/)
      if (aLen) prefillAmt = aLen[1]
      if (!name) name = 'Merchant QRIS'
    } else {
      name = data.length > 50 ? data.substring(0, 50) + '…' : data
    }

    setMerchant(name)
    if (prefillAmt && parseInt(prefillAmt, 10) > 0) {
      setRaw(group(parseInt(prefillAmt, 10)))
    }
    setPhase('found')
  }, [])

  const startCamera = useCallback(() => {
    setPhase('init')
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: 640, height: 480 } })
      .then(stream => {
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play()
        }
        setPhase('scanning')

        const scan = () => {
          const video  = videoRef.current
          const canvas = canvasRef.current
          if (!video || !canvas || video.readyState < 2) {
            timerRef.current = setTimeout(scan, 150)
            return
          }

          const w = video.videoWidth
          const h = video.videoHeight
          if (!w || !h) { timerRef.current = setTimeout(scan, 150); return }

          canvas.width  = w
          canvas.height = h
          const ctx = canvas.getContext('2d', { willReadFrequently: true })
          ctx.drawImage(video, 0, 0, w, h)
          const imageData = ctx.getImageData(0, 0, w, h)

          // jsQR — works in all browsers
          const code = jsQR(imageData.data, w, h, { inversionAttempts: 'dontInvert' })
          if (code) {
            stopCam()
            processQR(code.data)
            return
          }

          // BarcodeDetector — native, faster (Chrome/Edge)
          if ('BarcodeDetector' in window) {
            new window.BarcodeDetector({ formats: ['qr_code'] })
              .detect(canvas)
              .then(codes => {
                if (codes.length > 0) { stopCam(); processQR(codes[0].rawValue) }
                else { timerRef.current = setTimeout(scan, 200) }
              })
              .catch(() => { timerRef.current = setTimeout(scan, 200) })
          } else {
            timerRef.current = setTimeout(scan, 200)
          }
        }

        timerRef.current = setTimeout(scan, 300)
      })
      .catch(() => setPhase('cam-error'))
  }, [stopCam, processQR])

  useEffect(() => {
    startCamera()
    return stopCam
  }, [startCamera, stopCam])

  const runDemo = () => {
    stopCam()
    processQR('00020101021226580016ID.CO.BCA.WWW011893600023010292000007202030359140014WARTEG SEDERHANA6007JAKARTA')
  }

  const handleScanUlang = () => {
    setMerchant('')
    setRaw('')
    setRawTouched(false)
    setBalErr(false)
    startCamera()
  }

  const handlePay = () => {
    if (!canPay) { setRawTouched(true); return }
    if (amt > balance) { setBalErr(true); return }
    setSubmitting(true)
    setTimeout(() => {
      onPay({ amount: amt, counterparty: merchant || 'QRIS Merchant', description: 'Bayar QRIS' })
      onClose()
    }, 700)
  }

  const onBlur = () => {
    if (!v.err && v.n) setRaw(group(v.n))
    setRawTouched(true)
  }

  return (
    <Overlay onClose={() => { stopCam(); onClose() }}>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <div
        onClick={e => e.stopPropagation()}
        style={{ width: 430, maxWidth: '100%', background: T.surface, borderRadius: 22, overflow: 'hidden', border: `1px solid ${T.border}`, boxShadow: '0 40px 90px -24px rgba(0,0,0,0.85)', animation: 'popIn .24s cubic-bezier(.2,.8,.3,1)' }}
      >
        <div style={{ height: 4, background: T.btnGrad }} />

        <div style={{ padding: '20px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={modalTitle}>Scan QRIS</h3>
          <button onClick={() => { stopCam(); onClose() }} style={closeBtn} aria-label="Tutup"><CloseIcon size={18} /></button>
        </div>

        {/* Camera feed */}
        {(phase === 'init' || phase === 'scanning') && (
          <>
            <div style={{ margin: '18px 0 0', position: 'relative', background: '#0C0E11', height: 280, overflow: 'hidden' }}>
              <video
                ref={videoRef}
                muted
                playsInline
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 200, height: 200, position: 'relative' }}>
                  <Corner pos={{ top: 0, left: 0 }} b={{ right: 'none', bottom: 'none' }} br="4px 0 0 0" />
                  <Corner pos={{ top: 0, right: 0 }} b={{ left: 'none', bottom: 'none' }} br="0 4px 0 0" />
                  <Corner pos={{ bottom: 0, left: 0 }} b={{ right: 'none', top: 'none' }} br="0 0 0 4px" />
                  <Corner pos={{ bottom: 0, right: 0 }} b={{ left: 'none', top: 'none' }} br="0 0 4px 0" />
                  <div style={{ position: 'absolute', left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, #F5CE53 30%, #F5CE53 70%, transparent)', animation: 'scanLine 2.4s linear infinite' }} />
                </div>
              </div>
              {phase === 'init' && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)' }}>
                  <span style={{ color: 'rgba(239,241,236,0.6)', fontSize: 14 }}>Memulai kamera…</span>
                </div>
              )}
            </div>
            <div style={{ padding: '16px 24px 20px', textAlign: 'center' }}>
              <p style={{ margin: '0 0 14px', fontSize: 14, color: T.muted }}>Arahkan kamera ke QR Code merchant</p>
              <button
                onClick={runDemo}
                style={{ background: T.surface2, border: `1px solid ${T.border}`, borderRadius: 10, padding: '9px 18px', fontSize: 13, fontWeight: 600, color: T.ink, cursor: 'pointer', fontFamily: FONT.sans }}
              >
                Demo: Scan Merchant
              </button>
            </div>
          </>
        )}

        {/* No support */}
        {phase === 'no-support' && (
          <div style={{ padding: '28px 24px 24px', textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: T.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', color: T.muted }}>
              <CameraIcon size={26} />
            </div>
            <p style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 600, color: T.ink }}>Browser tidak mendukung</p>
            <p style={{ margin: '0 0 20px', fontSize: 14, color: T.muted }}>Gunakan mode demo untuk presentasi.</p>
            <button onClick={runDemo} style={{ width: '100%', padding: '14px 0', borderRadius: 12, border: 'none', background: T.btnGrad, color: T.onGold, fontFamily: FONT.sans, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
              Demo: Scan Merchant
            </button>
          </div>
        )}

        {/* Cam error */}
        {phase === 'cam-error' && (
          <div style={{ padding: '28px 24px 24px', textAlign: 'center' }}>
            <div style={{ color: T.outRose, marginBottom: 12, display: 'flex', justifyContent: 'center' }}><AlertIcon size={36} /></div>
            <p style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 600, color: T.ink }}>Kamera tidak dapat diakses</p>
            <p style={{ margin: '0 0 20px', fontSize: 14, color: T.muted }}>Pastikan izin kamera sudah diberikan, atau gunakan mode demo.</p>
            <button onClick={runDemo} style={{ width: '100%', padding: '14px 0', borderRadius: 12, border: 'none', background: T.btnGrad, color: T.onGold, fontFamily: FONT.sans, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
              Demo: Scan Merchant
            </button>
          </div>
        )}

        {/* QR found */}
        {phase === 'found' && (
          <div style={{ padding: '20px 24px 26px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 12, background: 'rgba(52,211,153,0.10)', border: '1px solid rgba(52,211,153,0.25)', marginBottom: 22 }}>
              <span style={{ color: T.inGreen, display: 'flex' }}><CheckIcon size={22} strokeWidth={2.2} /></span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.inGreen }}>QR Terdeteksi</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.ink, marginTop: 2 }}>{merchant}</div>
              </div>
            </div>

            <label style={label}>Nominal Pembayaran</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px', height: 52, borderRadius: 12, border: `1.5px solid ${showErr ? T.outRose : T.border}`, background: T.surface2, marginBottom: showErr ? 0 : 4 }}>
              <span style={{ fontFamily: FONT.mono, fontSize: 16, color: T.muted }}>Rp</span>
              <input
                value={raw}
                onChange={e => { setRaw(e.target.value); setRawTouched(true); setBalErr(false) }}
                onBlur={onBlur}
                inputMode="numeric"
                placeholder="0"
                autoFocus
                style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontFamily: FONT.mono, fontSize: 20, color: T.ink }}
              />
            </div>
            {showErr && <div style={{ marginTop: 6, fontFamily: FONT.mono, fontSize: 12, color: T.outRose, marginBottom: 4 }}>{v.err}</div>}
            {balErr && (
              <div style={{ marginTop: 10, padding: '10px 14px', borderRadius: 12, background: 'rgba(251,113,133,0.12)', border: '1px solid rgba(251,113,133,0.3)', display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ color: T.outRose, display: 'flex' }}><AlertIcon size={15} /></span>
                <span style={{ fontSize: 14, fontWeight: 500, color: T.outRose }}>Saldo tidak cukup.</span>
              </div>
            )}

            <div style={{ marginTop: 20 }}>
              <SubmitButton enabled={canPay} onClick={handlePay}>
                {submitting ? 'Memproses…' : `Lanjut${amt > 0 ? ' · ' + fmtRp(amt) : ''}`}
              </SubmitButton>
            </div>

            <button
              onClick={handleScanUlang}
              style={{ width: '100%', marginTop: 10, padding: '11px 0', borderRadius: 12, border: `1px solid ${T.border}`, background: 'transparent', color: T.muted, fontFamily: FONT.sans, fontSize: 14, fontWeight: 500, cursor: 'pointer' }}
            >
              ← Scan ulang
            </button>
          </div>
        )}
      </div>
    </Overlay>
  )
}

function Corner({ pos, b, br }) {
  return (
    <div style={{
      position: 'absolute', ...pos,
      width: 28, height: 28,
      border: '3px solid #F5CE53',
      borderRightWidth: b.right !== undefined ? 0 : 3,
      borderBottomWidth: b.bottom !== undefined ? 0 : 3,
      borderLeftWidth: b.left !== undefined ? 0 : 3,
      borderTopWidth: b.top !== undefined ? 0 : 3,
      borderRadius: br,
    }} />
  )
}
