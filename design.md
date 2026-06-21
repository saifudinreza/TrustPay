# Design System — Mini Wallet Dashboard
**Tema: "Buku Tabungan Digital" (Ledger & Stamp)**
Mengacu pada `PRD.md` v1.0 — Mini Wallet API & Dashboard (Dibimbing.id)

---

## 0. Kenapa tema ini

PRD-nya sendiri sudah punya satu insight desain yang kuat di §6.4: pola **ledger per baris**, bukan saldo yang ditimpa diam-diam. Setiap baris transaksi *self-explanatory* untuk audit. Itu bukan cuma keputusan database — itu identitas visual.

Hampir semua orang Indonesia pernah pegang **buku tabungan** fisik: sampul gelap, ada stempel teller, halaman bergaris dengan kolom debit/kredit/saldo dicetak mesin dot-matrix yang angkanya rata kanan. Dashboard ini akan terasa familiar dan *trustworthy* — bukan generik fintech neon, bukan juga template cream+serif yang sekarang dipakai di mana-mana — kalau dibangun dari metafora itu:

- Card saldo = **sampul buku tabungan**
- Tabel riwayat = **halaman buku tabungan bergaris**, dengan rail kecil di kiri tiap baris yang menunjukkan arah uang (masuk/keluar) — ini bukan dekorasi, ini informasi struktural
- Konfirmasi sukses = **stempel teller** ("BERHASIL"), bukan toast generik
- Form top up/transfer = **slip setoran/transfer**, lengkap dengan motif tepi berlubang (perforasi)

Ini juga otomatis menjawab requirement non-fungsional "audit trail" dan "clean architecture" di §6.4 dan §12 — kamu bisa jelaskan ke mentor bahwa *desain* dan *struktur data* sengaja dibuat selaras, bukan dua hal terpisah. Itu poin presentasi yang bagus (§14, kategori Presentation).

Dua hal yang sengaja dihindari karena terlalu sering dipakai AI design tool sekarang: (1) background krem hangat + serif + aksen terakota, dan (2) dark mode nyaris hitam + satu aksen neon. Tema di bawah pakai paper dingin (bukan krem), dan aksen gold yang dipakai sangat terbatas — bukan default.

---

## 1. Design Tokens

### 1.1 Warna

| Nama Token | Hex | Peran |
|---|---|---|
| `--ink` | `#11203D` | Navy gelap. Header, navbar, teks utama, sampul card saldo |
| `--paper` | `#EFF1EC` | Latar utama. Abu-kehijauan pucat & dingin — *bukan* krem |
| `--stamp` | `#C98A2B` | Gold/amber. **Hanya** untuk CTA utama (Top Up) & elemen stempel/signature. Pakai hemat |
| `--masuk` | `#2F6F4E` | Hijau tua desaturasi. Indikator dana masuk (`TRANSFER_IN`, `TOPUP`) |
| `--keluar` | `#7A3142` | Wine/maroon desaturasi. Indikator dana keluar (`TRANSFER_OUT`) |
| `--tepi` | `#5C6B73` | Slate abu-biru. Border, teks sekunder, placeholder, garis ledger |

Aturan pemakaian:
- `--stamp` (gold) tidak pernah dipakai untuk dua elemen yang berkompetisi dalam satu layar. Kalau tombol "Top Up" gold, tombol "Transfer" di sebelahnya harus outline/secondary, bukan gold juga.
- `--masuk` dan `--keluar` *hanya* dipakai untuk menandai arah transaksi (rail tabel, badge tipe, nominal di tabel). Jangan dipakai untuk status sistem umum (error pakai `--keluar`, tapi error validasi form pakai warna error standar terpisah, lihat §5).
- Kontras `--ink` di atas `--paper` ≈ 13:1, aman untuk teks body sekecil 14px.

### 1.2 Tipografi

| Role | Font | Pemakaian |
|---|---|---|
| Display | **Space Grotesk** | Judul halaman, label besar di sampul Card Saldo ("Saldo Anda") |
| Body / UI | **Plus Jakarta Sans** | Semua label, button, paragraf, navigasi |
| Mono / Angka | **IBM Plex Mono** | Nominal uang, tanggal, kode transaksi, saldo setelah transaksi — *selalu* `font-feature-settings: "tnum"` agar digit rata |

Google Fonts import:
```html
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Plus+Jakarta+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
```

Skala tipe (dasar 16px):
| Token | Size | Weight | Pakai untuk |
|---|---|---|---|
| `text-display` | 32px / 1.15 | Space Grotesk 700 | Angka saldo besar |
| `text-h1` | 22px / 1.3 | Space Grotesk 500 | Judul halaman/card |
| `text-body` | 15px / 1.5 | Jakarta Sans 400 | Paragraf, label form |
| `text-button` | 14px / 1 | Jakarta Sans 600, tracking 0.01em | Tombol |
| `text-mono-lg` | 18px | Plex Mono 500, tabular-nums | Nominal di tabel |
| `text-mono-sm` | 12px | Plex Mono 400, tabular-nums, uppercase, tracking 0.06em | Tanggal, kode, label stempel |

### 1.3 Spacing, Radius, Shadow

- Grid dasar: 8px.
- Radius: `--r-card: 16px`, `--r-input: 10px`, `--r-button: 10px`, `--r-pill: 999px` (badge tipe transaksi).
- Shadow card saldo: `0 8px 24px -8px rgba(17,32,61,0.25)` — cukup untuk efek "diangkat", tidak berlebihan.
- Tidak ada elemen dengan radius 0 di seluruh UI (membedakan dari gaya broadsheet/hairline yang dingin — wallet butuh terasa hangat & aman, bukan koran).

### 1.4 CSS Variables siap pakai

```css
:root {
  --ink: #11203D;
  --paper: #EFF1EC;
  --stamp: #C98A2B;
  --masuk: #2F6F4E;
  --keluar: #7A3142;
  --tepi: #5C6B73;
  --r-card: 16px;
  --r-input: 10px;
  --r-button: 10px;
}
```

Tailwind `tailwind.config.js` extension:
```js
theme: {
  extend: {
    colors: {
      ink: '#11203D',
      paper: '#EFF1EC',
      stamp: '#C98A2B',
      masuk: '#2F6F4E',
      keluar: '#7A3142',
      tepi: '#5C6B73',
    },
    fontFamily: {
      display: ['"Space Grotesk"', 'sans-serif'],
      body: ['"Plus Jakarta Sans"', 'sans-serif'],
      mono: ['"IBM Plex Mono"', 'monospace'],
    },
  },
}
```

---

## 2. Elemen Signature

### 2.1 Stempel "BERHASIL"
Lingkaran tipis 64px, border 2px `--stamp`, dirotasi -8deg, teks `text-mono-sm` uppercase warna `--stamp` melingkar/center: "✓ BERHASIL". Muncul:
- Di toast konfirmasi setelah top up/transfer sukses (bukan toast generik dengan ikon centang biasa — pakai stempel ini).
- Sebagai watermark samar (opacity 6%) di pojok Card Saldo, sebagai *brand mark* tetap.

### 2.2 Ledger Rail
Garis vertikal tipis 3px di sisi kiri setiap baris tabel riwayat, warnanya `--masuk` (hijau) kalau dana masuk, `--keluar` (wine) kalau dana keluar. Di ujung atas rail tiap baris ada bullet kecil (dot 6px) warna sama — meniru lubang perforasi di pinggir buku tabungan fisik. Rail ini yang membawa makna arah transaksi; badge teks tipe transaksi tetap ada sebagai redundansi untuk aksesibilitas (jangan andalkan warna saja).

### 2.3 Tepi Perforasi (slip form)
Pada modal Top Up dan Form Transfer, tepi atas card dibuat seperti slip yang baru disobek: garis dashed `--tepi` dengan deretan setengah-lingkaran kecil (radius 4px) di atasnya. Murni motif kosmetik bagian header modal, tidak mengganggu form di bawahnya.

---

## 3. Layout per Halaman

### 3.1 Halaman Login

```
┌─────────────────────────────────────────────────────┐
│  ░░░░░░░░░░░░░░  │                                   │
│  ░░ INK PANEL ░░ │   Masuk ke Wallet                 │
│  ░░░░░░░░░░░░░░  │   ─────────────────               │
│   [stempel mark] │   Email atau Username             │
│                   │   [_____________________]         │
│   "Setiap rupiah  │                                   │
│    tercatat,      │   Password                        │
│    setiap waktu." │   [_____________________]         │
│                   │                                   │
│                   │   [ Masuk ]  (gold, full width)   │
│                   │   Belum punya akun? Daftar         │
└─────────────────────────────────────────────────────┘
```
- Panel kiri (`--ink`, 40% lebar di desktop) berisi watermark stempel + satu baris tagline. Di mobile, panel ini menyusut jadi strip header tinggi 96px di atas form.
- Error 401 ("kredensial salah") muncul sebagai banner tipis merah-wine di atas form, teks generik sesuai PRD §7.1 — **jangan** sebutkan email atau password yang mana yang salah.
- Tombol "Masuk" disabled (abu, opacity 50%) sampai kedua field terisi & format email valid (kalau pakai email). Saat submit: spinner kecil di dalam tombol, label berubah jadi "Memproses…", tombol tetap disabled.

### 3.2 Dashboard — Card Saldo

```
┌─────────────────────────────────────────┐
│  ╭─ sampul navy, radius 16 ───────────╮  │
│  │  SALDO ANDA                [stempel]│  │
│  │  Rp 2.450.000                       │  │
│  │  •••• terakhir update 09:42         │  │
│  ╰──────────────────────────────────────╯  │
│                                           │
│   [ + Top Up ]   [ ⇄ Transfer ]          │
│    (gold fill)    (outline ink)          │
└───────────────────────────────────────────┘
```
- Angka saldo: `text-display`, IBM Plex Mono, warna `--paper` di atas `--ink` (kontras tinggi), tabular-nums.
- "Top Up" = aksi gold (satu-satunya gold di layar ini). "Transfer" = outline, border `--ink`, teks `--ink`.
- Saldo auto-refresh setelah aksi sukses: angka transisi cross-fade 200ms, tidak ada animasi melompat/odometer berlebihan (sesuai prinsip "less is more" — ini wallet, bukan game).

### 3.3 Modal Top Up

```
┌─ слip, tepi perforasi ──────────────┐
│  ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░    │
│  Top Up Saldo                    ✕ │
│  ───────────────────────────────── │
│  Nominal                            │
│  Rp [______________]               │
│  ⓘ Hanya angka bulat, tanpa desimal│
│                                      │
│  [ Konfirmasi Top Up ]  (disabled  │
│                          sampai     │
│                          valid)     │
└──────────────────────────────────────┘
```
- Input nominal: prefix "Rp" statis di kiri (bukan placeholder, biar nggak hilang saat user mengetik), font mono, tabular-nums, auto-format pemisah ribuan saat blur.
- Validasi realtime persis mapping PRD §9.2, ditampilkan sebagai teks kecil `text-mono-sm` warna `--keluar` *langsung di bawah field* (bukan di toast):
  - Kosong → "Nominal tidak boleh kosong."
  - Huruf/simbol → "Nominal harus berupa angka."
  - Desimal → "Nominal harus berupa bilangan bulat."
  - Negatif → "Nominal tidak boleh negatif."
  - > batas maks → "Nominal melebihi batas maksimum transaksi."
- Tombol "Konfirmasi Top Up": disabled (abu `--tepi` 30% + teks `--tepi`) sampai semua validasi lolos. Saat request berjalan: disabled + spinner + label "Memproses…" — mencegah double-submit sesuai requirement §7.6.
- Sukses → modal tertutup, stempel "BERHASIL" muncul sebentar (1.5s) menimpa posisi Card Saldo, lalu saldo & label "terakhir update" ter-refresh.

### 3.4 Form Transfer

Sama strukturnya dengan Top Up, ditambah field `recipient` di atas nominal:

```
│  Kirim ke (email atau no. HP)       │
│  [______________________]            │
│  ⓘ Ditemukan: Saifudin R. — @reza   │  ← preview nama setelah lookup, opsional nice-to-have
│                                      │
│  Nominal                            │
│  Rp [______________]               │
│                                      │
│  Catatan (opsional)                 │
│  [______________________]            │
│                                      │
│  [ Kirim Transfer ]                 │
```
- Error "Saldo tidak cukup" (400, bukan 422) ditampilkan dengan styling sedikit beda dari error validasi format — pakai banner penuh lebar di atas tombol submit, bukan teks kecil di bawah field, karena ini bukan salah input tapi kondisi bisnis. Teks: "Saldo tidak cukup untuk transfer ini." warna `--keluar`, background `--keluar` 8% opacity.
- "Penerima tidak ditemukan" dan "Tidak dapat transfer ke diri sendiri" tetap di bawah field `recipient`, sama seperti error nominal.
- Tombol disabled dengan logika sama seperti Top Up.

### 3.5 Tabel Riwayat Transaksi

```
 │ 21 Jun 2026     [MASUK]   dari Budi S.       + Rp 500.000   Rp 2.450.000
 │ 09:12 mono                                    (--masuk)      (--tepi, kecil)
 │
 │ 20 Jun 2026     [KELUAR]  ke Siti A.          − Rp 150.000   Rp 1.950.000
 │ 14:30
 │
 │ 18 Jun 2026     [TOP UP]  —                   + Rp 1.000.000 Rp 2.100.000
 │ 08:00
```
(`│` di paling kiri = ledger rail berwarna, dengan dot di tiap baris)

- Kolom: Tanggal+waktu (mono, dua baris kecil), Badge tipe (pill, border tipis, teks `text-mono-sm` uppercase — warna ikut arah: masuk/keluar/netral untuk top up), Lawan transaksi (nama, bukan ID — sesuai §11 jangan expose data sensitif user lain selain nama), Nominal (mono, rata kanan, `+`/`−` prefix, warna arah), Saldo setelah (mono, rata kanan, `--tepi`, lebih kecil — ini kolom audit, sengaja dibuat lebih senyap dari nominal utama).
- **Skeleton loading**: 5 baris placeholder dengan blok abu `--tepi` 12% opacity berbentuk pill, shimmer halus kiri-ke-kanan 1.2s, tanpa rail warna (rail muncul setelah data nyata datang).
- **Empty state**: bukan ikon generik "kotak kosong". Tampilkan satu baris ledger kosong dengan teks dim di posisi kolom nominal: "Belum ada catatan — mulai dengan Top Up pertamamu." + tombol kecil "+ Top Up" inline. Ini *invitation*, bukan pesan kegagalan.
- Pagination di bawah tabel: tombol "Sebelumnya / Selanjutnya" sederhana, bukan nomor halaman penuh (cukup untuk skala data wallet personal).

---

## 4. Microcopy — Mapping Lengkap dari PRD §9.2

Semua pesan error backend dipakai **verbatim** di FE (jangan diparafrase ulang oleh frontend, supaya konsisten dengan dokumentasi API saat presentasi):

| Skenario | Pesan | Lokasi tampil |
|---|---|---|
| Nominal kosong | "Nominal tidak boleh kosong." | Inline di bawah field nominal |
| Nominal huruf/simbol | "Nominal harus berupa angka." | Inline di bawah field nominal |
| Nominal negatif | "Nominal tidak boleh negatif." | Inline di bawah field nominal |
| Nominal desimal | "Nominal harus berupa bilangan bulat." | Inline di bawah field nominal |
| Nominal > batas maks | "Nominal melebihi batas maksimum transaksi." | Inline di bawah field nominal |
| Saldo tidak cukup | "Saldo tidak cukup." | Banner di atas tombol submit (form transfer) |
| Recipient tidak ditemukan | "Penerima tidak ditemukan." | Inline di bawah field recipient |
| Transfer ke diri sendiri | "Tidak dapat transfer ke diri sendiri." | Inline di bawah field recipient |
| Login gagal | pesan generik (jangan sebutkan field) | Banner di atas form login |

Prinsip umum (sesuai panduan menulis UI): tombol selalu memakai kata kerja aktif yang sama dari awal sampai akhir alur — tombol "Top Up" → toast "Top up berhasil", bukan "Submit" → "Transaksi diproses". Pesan error tidak pernah minta maaf, langsung bilang apa yang salah dan bagaimana memperbaikinya.

---

## 5. States

| State | Treatment |
|---|---|
| Loading (fetch awal) | Skeleton (lihat §3.5), bukan spinner full-page |
| Loading (submit) | Tombol disabled + spinner kecil inline + label berubah ("Memproses…") |
| Disabled (validasi belum lolos) | Background `--tepi` 15%, teks `--tepi`, cursor not-allowed |
| Error validasi format (422) | Teks kecil warna `--keluar` langsung di bawah field, field border berubah `--keluar` |
| Error logic (400, contoh saldo kurang) | Banner lebar di atas submit, bukan inline field |
| Error auth (401) | Banner di atas form, generik |
| Sukses | Stempel "BERHASIL" sekilas + data ter-refresh, bukan modal konfirmasi tambahan |
| Empty | Invitation copy + CTA inline, bukan ilustrasi generik |

---

## 6. Aksesibilitas & Responsive

- Semua makna warna (arah transaksi, error/sukses) selalu didampingi teks atau ikon — tidak pernah warna sebagai satu-satunya sinyal.
- Fokus keyboard terlihat jelas: outline 2px `--stamp` offset 2px di semua elemen interaktif.
- Kontras minimum: teks body di atas `--paper` dan di atas `--ink` keduanya di atas rasio 7:1.
- `prefers-reduced-motion`: nonaktifkan shimmer skeleton dan transisi cross-fade saldo, ganti dengan tampil instan.
- Breakpoint: di bawah 640px, Card Saldo full-width, dua tombol aksi jadi stack vertikal, tabel riwayat berubah jadi list card (tanggal+badge di baris pertama, nominal besar di kanan, saldo setelah kecil di bawahnya) — bukan tabel di-scroll horizontal.

---

## 7. Cara Pakai untuk Generate Mockup

Karena tech stack FE-nya React + Tailwind (§5 PRD), dokumen ini bisa langsung jadi input untuk generate komponen. Saran urutan kalau mau pakai Claude (Artifacts) untuk generate mockup per halaman:

1. Generate satu halaman dulu (mulai dari Dashboard — paling representatif), paste §1 (tokens) + §3.2 + §3.5 dari dokumen ini sebagai konteks.
2. Setelah Card Saldo + tabel oke, baru generate Modal Top Up (§3.3) sebagai komponen terpisah yang reuse token yang sama.
3. Terakhir Login (§3.1) dan Form Transfer (§3.4).

Contoh prompt singkat yang bisa langsung dipakai:
> "Buatkan komponen React + Tailwind untuk Dashboard wallet, pakai design token dan layout di §1 dan §3.2–§3.5 file design.md ini (warna ink/paper/stamp/masuk/keluar/tepi, font Space Grotesk + Plus Jakarta Sans + IBM Plex Mono, signature element ledger rail di tabel riwayat dan stempel BERHASIL di toast sukses)."

Generate satu komponen per giliran lebih gampang dikoreksi daripada minta semua halaman sekaligus — dan ini juga lebih mudah kamu jelaskan ulang ke mentor bagian per bagian saat presentasi (§14, kategori Presentation), karena kamu paham keputusan di tiap komponen, bukan satu blok besar yang di-generate sekali jalan.

---

## 8. Yang Sengaja Tidak Dipakai

- ❌ Background krem hangat + font serif + aksen terakota — terlalu sering jadi default AI design tool, dan tidak match dengan konteks finansial/audit.
- ❌ Dark mode nyaris hitam dengan satu aksen neon — kesannya lebih ke aplikasi trading/crypto spekulatif, bukan wallet personal yang tenang dan dipercaya.
- ❌ Ikon generik dompet/uang 3D — sudah terlalu umum dipakai di semua starter template fintech, tidak menambah identitas apapun ke project ini.
- ❌ Animasi angka "menghitung naik" (odometer) di setiap perubahan saldo — terasa gimmicky untuk aplikasi yang fungsinya serius soal uang.
