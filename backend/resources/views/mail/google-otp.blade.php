<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kode Verifikasi TrustPay</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #0B0A07; font-family: 'Helvetica Neue', Arial, sans-serif; }
  </style>
</head>
<body>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0B0A07; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px; background:#18150F; border-radius:20px; border:1px solid rgba(255,255,255,0.08); overflow:hidden;">

          <!-- Gold accent bar -->
          <tr>
            <td style="height:4px; background:linear-gradient(135deg,#F7D560 0%,#E6B84C 45%,#D4A636 100%);"></td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 0; text-align:center;">
              <div style="display:inline-flex; align-items:center; gap:8px;">
                <span style="width:10px; height:10px; border-radius:50%; background:#F5CE53; display:inline-block;"></span>
                <span style="font-size:20px; font-weight:700; color:#F7F3EA; letter-spacing:-0.02em;">TrustPay</span>
              </div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 28px 32px 36px;">
              <p style="font-size:15px; color:#DAD3C3; margin-bottom:8px;">
                Halo, <strong style="color:#F7F3EA;">{{ $name }}</strong>
              </p>
              <p style="font-size:15px; color:#A99F89; line-height:1.6; margin-bottom:28px;">
                Gunakan kode OTP berikut untuk menyelesaikan verifikasi akun Google kamu di TrustPay. Kode ini berlaku selama <strong style="color:#F7F3EA;">10 menit</strong>.
              </p>

              <!-- OTP Box -->
              <div style="background:#201C14; border:1.5px solid rgba(230,184,76,0.28); border-radius:16px; padding:24px; text-align:center; margin-bottom:28px;">
                <div style="font-size:11px; letter-spacing:0.14em; text-transform:uppercase; color:#A99F89; margin-bottom:12px; font-family:monospace;">Kode Verifikasi</div>
                <div style="font-family:monospace; font-size:42px; font-weight:700; letter-spacing:0.18em; color:#F5CE53;">{{ $otp }}</div>
              </div>

              <div style="background:rgba(251,113,133,0.08); border:1px solid rgba(251,113,133,0.2); border-radius:12px; padding:14px 16px; margin-bottom:28px;">
                <p style="font-size:13px; color:#C9952B; line-height:1.5;">
                  ⚠️ Jangan bagikan kode ini kepada siapapun. TrustPay tidak pernah meminta kode OTP kamu.
                </p>
              </div>

              <p style="font-size:13px; color:#74694F; line-height:1.5;">
                Jika kamu tidak meminta kode ini, abaikan email ini. Akun kamu tetap aman.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px; border-top:1px solid rgba(255,255,255,0.06); text-align:center;">
              <p style="font-size:12px; color:#74694F;">
                © {{ date('Y') }} TrustPay — Email ini dikirim otomatis, jangan dibalas.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
