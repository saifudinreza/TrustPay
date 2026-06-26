// lib/theme.js — palet "Black + Gold" terpusat untuk seluruh aplikasi.
//
// Riwayat: navy/gold → Carbon+Lime → Black+Purple → **Black + Gold (luxury)** pada
// 2026-06-26 atas permintaan user (referensi: public/gold). Tampilan e-wallet mewah:
// dasar hitam hangat, aksen emas, tombol emas terang dengan teks gelap, kartu hitam-emas.
//
// Semua warna diekspor lewat objek `T`. Catatan: nama token tetap `gold*` sejak
// migrasi ini — komponen mengimpor { T, FONT }.

export const T = {
  // ---- background berlapis (paling gelap → paling terang), nuansa hangat ----
  bg: '#0B0A07', // dasar aplikasi (near-black hangat)
  bg2: '#110F0B',
  surface: '#18150F', // permukaan kartu
  surface2: '#201C14', // input / elemen elevated
  surface3: '#2A2418', // hover / active

  // ---- garis & pemisah ----
  border: 'rgba(255,255,255,0.08)',
  border2: 'rgba(230,184,76,0.28)', // border beraksen emas (fokus / aktif)

  // ---- aksen emas ----
  gold: '#E6B84C', // emas utama (teks aksen, ikon, rail)
  goldBright: '#F5CE53', // emas terang (highlight)
  goldDeep: '#C9952B', // emas pekat
  goldSoft: 'rgba(230,184,76,0.14)', // latar lembut untuk ikon/chip
  goldSoft2: 'rgba(230,184,76,0.22)',

  // ---- teks (di atas latar gelap) ----
  ink: '#F7F3EA', // teks utama (krem-putih)
  inkSoft: '#DAD3C3', // teks sekunder
  muted: '#A99F89', // label/keterangan redup — tetap terbaca (kontras cukup)
  mutedDim: '#74694F', // paling redup (hint)

  // ---- teks di atas tombol/kartu EMAS terang (gelap agar terbaca) ----
  onGold: '#1B1407',

  // ---- status transaksi (gold palette — tema Black + Gold) ----
  inGreen: '#F5CE53', // dana masuk (gold terang)
  outRose: '#C9952B', // dana keluar (gold pekat/amber)
  topupGold: '#E6B84C', // top up
  warn: '#F5B53D',

  // ---- gradien ----
  // Kartu besar: hitam-emas mewah (teks PUTIH tetap terbaca) — gaya referensi #1/#2/#5/#7.
  cardGrad: 'linear-gradient(150deg, #3A2E16 0%, #261F12 50%, #100C07 100%)',
  cardGradDark: 'linear-gradient(150deg, #221C12 0%, #15110A 55%, #0C0905 100%)',
  // Tombol/CTA: emas terang (teks GELAP = T.onGold).
  btnGrad: 'linear-gradient(135deg, #F7D560 0%, #E6B84C 45%, #D4A636 100%)',
  pageGrad:
    'radial-gradient(900px 480px at 88% -12%, rgba(230,184,76,0.16), transparent 60%), radial-gradient(760px 560px at -8% 8%, rgba(201,149,43,0.10), transparent 55%), #0B0A07',
}

// ---- font stack yang dipakai di seluruh app (sudah dimuat di index.html) ----
export const FONT = {
  display: "'Space Grotesk',sans-serif",
  sans: "'Plus Jakarta Sans',sans-serif",
  mono: "'IBM Plex Mono',monospace",
}

// ---- preset style yang sering dipakai ----
export const card = {
  background: T.surface,
  borderRadius: 18,
  border: `1px solid ${T.border}`,
  boxShadow: '0 20px 50px -30px rgba(0,0,0,0.8)',
}

// input bertema gelap
export const inputBox = (error) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '0 14px',
  height: 52,
  borderRadius: 12,
  border: `1.5px solid ${error ? T.outRose : T.border}`,
  background: T.surface2,
})

export const inputText = {
  flex: 1,
  border: 'none',
  outline: 'none',
  background: 'transparent',
  fontFamily: FONT.sans,
  fontSize: 15,
  color: T.ink,
}
