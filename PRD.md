# PRD — TrustPay: Buku Tabungan Digital (Mini Wallet)
**Exam Penyaluran Kerja — Full Stack Web Development Bootcamp (Dibimbing.id)**

| Item | Detail |
|---|---|
| Author | Saifudin Reza |
| Versi | 4.0 |
| Tanggal | 30 Juni 2026 |
| Deadline | 27 Juni 2026, 23.50 WIB |

---

## 1. Ringkasan Produk

TrustPay adalah aplikasi **dompet digital (e-wallet)** dengan konsep **Buku Tabungan Digital** — setiap rupiah tercatat secara permanen layaknya buku tabungan bank. Pengguna dapat melakukan top up saldo, transfer antar pengguna, bayar tagihan (Pulsa/PLN/PDAM/Internet), dan scan & bayar QRIS.

**Live Demo:**
- Frontend: https://trust-pay-blush.vercel.app
- Backend API: https://trustpay-api-ieep.onrender.com

---

## 2. Tujuan

1. Membangun sistem dompet digital dengan integritas transaksi penuh (atomic, rollback-safe).
2. Menyediakan autentikasi aman (Laravel Sanctum + Google OAuth).
3. Menyediakan dashboard SPA real-time dengan React.
4. Mengintegrasikan Midtrans Snap sebagai payment gateway top up.
5. Mendemonstrasikan kemampuan full stack: Laravel API, React SPA, integrasi pihak ketiga.

---

## 3. Tech Stack

| Layer | Teknologi |
|---|---|
| Backend | Laravel 11, PHP 8.4 |
| Database | PostgreSQL (production via Neon) / MySQL (local) |
| Auth | Sanctum (token), Socialite (Google OAuth) |
| Payment Gateway | Midtrans Snap (sandbox) |
| Frontend | React 18, Vite 5, inline styles (design tokens) |
| QR Scanner | jsQR (cross-browser) + BarcodeDetector API (native Chrome/Edge) |
| Deployment BE | Docker / Render.com |
| Deployment FE | Vercel |

---

## 4. Fitur-Fitur

### 4.1 Autentikasi
- Register: name, username, email, password
- Login: email/username + password → token Sanctum
- Google OAuth (bonus): login satu klik via Google → langsung masuk dashboard tanpa OTP
- Atur & ubah PIN transaksi 6 digit
- Update profil (nama, username, email)

### 4.2 Dompet Digital (Wallet)
- Cek saldo real-time
- Top up saldo (**Direct Mode** untuk demo, **Midtrans Snap** untuk production)
- Transfer antar pengguna (via email/username)
- Bayar tagihan: Pulsa, Listrik PLN, Air PDAM, Internet
- Riwayat transaksi lengkap

### 4.3 QRIS
- **Scan QRIS**: kamera langsung → jsQR decode frame via canvas → tampil form bayar
  - Format QRIS standard (EMV): nama merchant & nominal otomatis terbaca
  - Format QR lain (URL, proprietary): terdeteksi, nominal diisi manual
  - Demo mode untuk presentasi (simulasi QRIS merchant)
- **Terima QR**: generate QR Code untuk menerima transfer dari pengguna lain

### 4.4 Keamanan Transaksi
- PIN 6 digit wajib untuk setiap transfer dan pembayaran
- Token disimpan di cookie (SameSite=Strict) bukan localStorage

---

## 5. Entity Relationship Diagram

```
users (1) ────── (1) wallets
users (1) ────── (n) transactions
```

### Tabel `users`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | bigint, PK | |
| name | string | |
| username | string, unique | |
| email | string, unique | |
| password | string (hashed), nullable | nullable untuk user Google OAuth |
| pin | string (hashed), nullable | PIN 6 digit untuk transaksi |
| google_id | string, nullable | ID dari Google OAuth |
| is_approved | boolean, default true | |
| created_at / updated_at | timestamp | |

### Tabel `wallets`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | bigint, PK | |
| user_id | bigint, FK, unique | 1 user = 1 wallet |
| balance | decimal(15,2) | saldo saat ini |
| created_at / updated_at | timestamp | |

### Tabel `transactions`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | bigint, PK | |
| code | string(32), unique | TRX-YYYYMMDD-XXXXXX |
| transfer_code | uuid, nullable | pengikat pasangan TRANSFER_OUT ↔ TRANSFER_IN |
| user_id | bigint, FK | pemilik baris ledger |
| counterpart_user_id | bigint, FK, nullable | lawan transaksi |
| type | enum(TOPUP,TRANSFER_IN,TRANSFER_OUT,PAYMENT) | |
| status | enum(PENDING,SUCCESS,FAILED) | |
| amount | decimal(15,2) | selalu positif |
| balance_after | decimal(15,2), nullable | saldo setelah transaksi |
| description | string, nullable | |
| created_at / updated_at | timestamp | |

---

## 6. API Endpoints

| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| POST | `/api/register` | ✗ | Daftar akun baru |
| POST | `/api/login` | ✗ | Login email/username + password |
| GET | `/api/auth/google/redirect` | ✗ | Redirect ke Google OAuth (prompt: select_account) |
| GET | `/api/auth/google/callback` | ✗ | Callback Google → langsung terbit token Sanctum |
| POST | `/api/logout` | ✓ | Hapus sesi |
| GET | `/api/me` | ✓ | Data user saat ini |
| PUT | `/api/me` | ✓ | Update profil |
| POST | `/api/pin` | ✓ | Atur/Ubah PIN |
| GET | `/api/wallet` | ✓ | Cek saldo |
| POST | `/api/topup` | ✓ | Top up saldo (direct atau Midtrans) |
| POST | `/api/topup/confirm` | ✓ | Konfirmasi status Midtrans |
| POST | `/api/transfer` | ✓ | Transfer ke user lain |
| POST | `/api/pay` | ✓ | Bayar tagihan |
| GET | `/api/transactions` | ✓ | Riwayat transaksi |
| POST | `/webhooks/midtrans` | ✗ | Webhook Midtrans |

**Catatan:** Semua endpoint yang dilindungi auth menggunakan middleware `auth:sanctum`.

---

## 7. Alur Transaksi

### Top Up
1. User input nominal → `POST /topup`
2. Jika `DIRECT_TOPUP_ENABLED=true` → saldo langsung bertambah (mode demo)
3. Jika tidak → inisialisasi Midtrans Snap → popup pembayaran → konfirmasi status

### Transfer
1. User input penerima + nominal + PIN → `POST /transfer`
2. Backend lock wallet sender → validasi saldo → debit sender → kredit recipient
3. Semua dalam satu DB transaction (atomic rollback)

### Bayar Tagihan
1. User pilih jenis tagihan + nominal + PIN → `POST /pay`
2. Backend validasi saldo → potong saldo → catat transaksi PAYMENT

### Google OAuth
1. User klik "Lanjutkan dengan Google" → redirect ke Google (tampil account picker)
2. Google callback → backend cari/buat user → langsung terbit token Sanctum
3. Redirect ke `/auth/callback?token=...&user=...` → frontend simpan sesi → dashboard

### Scan QRIS
1. User buka Scan QRIS → izin kamera → video feed aktif
2. jsQR snapshot canvas tiap 200ms → decode QR Code
3. Jika QRIS standard (EMV) → nama merchant & nominal terbaca otomatis
4. User konfirmasi nominal + PIN → `POST /pay` → saldo terpotong

---

## 8. Cara Menjalankan

```bash
# Backend
cd backend
composer install
cp .env.example .env   # edit DB, Midtrans, Google OAuth
php artisan key:generate
php artisan migrate
php artisan serve

# Frontend
cd frontend
npm install
npm run dev
```

### Akun Demo
| Email | Password | Saldo Awal |
|---|---|---|
| donojomi@gmail.com | password123 | Rp 500.000 |
| demo@trustpay.id | password123 | Rp 250.000 |

### Environment Variables Penting (Render)
| Key | Keterangan |
|---|---|
| `APP_ENV` | `production` |
| `DB_CONNECTION` | `pgsql` |
| `FRONTEND_URL` | `https://trust-pay-blush.vercel.app` |
| `GOOGLE_CLIENT_ID` | Client ID dari Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | Client Secret Google |
| `MIDTRANS_SERVER_KEY` | Key Midtrans sandbox |
| `MIDTRANS_CLIENT_KEY` | Client Key Midtrans sandbox |
| `DIRECT_TOPUP_ENABLED` | `true` (demo) |

---

## 9. Validasi Input

### Nominal (top up, transfer, pay)
| Skenario | Respon |
|---|---|
| Kosong | 422 — "Nominal tidak boleh kosong." |
| Huruf/simbol | 422 — "Nominal harus berupa angka." |
| Negatif | 422 — "Nominal tidak boleh negatif." |
| Melebihi batas | 422 — "Nominal melebihi batas maksimum transaksi." |
| Saldo tidak cukup | 400 — "Saldo tidak cukup." |

### Transfer
| Skenario | Respon |
|---|---|
| Penerima tidak ditemukan | 422 — "Penerima tidak ditemukan." |
| Transfer ke diri sendiri | 422 — "Tidak dapat transfer ke diri sendiri." |
| PIN salah | 422 — "PIN salah." |
| PIN belum diatur | 403 — "Atur PIN transaksi terlebih dahulu." |

---

## 10. Arsitektur Keamanan

- **Sanctum Token**: semua endpoint mutasi dilindungi `auth:sanctum`
- **Row-level locking**: `lockForUpdate()` pada wallet saat transfer mencegah race condition
- **Atomic transaction**: semua transaksi keuangan dalam `DB::transaction` — rollback otomatis jika ada kegagalan
- **PIN transaksi**: setiap transfer/pay wajib verifikasi PIN 6 digit (bcrypt)
- **Authorization**: user hanya bisa akses data milik sendiri
- **Token di cookie**: token disimpan di cookie (SameSite=Strict) bukan localStorage
- **Google OAuth account picker**: `prompt=select_account` memaksa Google selalu tampil pilihan akun

---

## 11. Rubrik Penilaian

| Kategori | Bobot |
|---|---|
| Code Readability | 15 |
| Code Effectivity (N+1, indexing) | 5 |
| FE: Login & Dashboard | 10 |
| API Integration (FE ↔ BE) | 10 |
| FE Requirement (loading, validasi, error) | 15 |
| BE: Authentication | 10 |
| BE: Wallet API | 10 |
| BE Requirement (DB transaction, validasi, middleware) | 15 |
| Presentation | 10 |
| **Total** | **100** |

---

## 12. Daftar File Penting

### Backend (`backend/`)
```
app/Http/Controllers/
├── AuthController.php            # Register, Login, Logout
├── WalletController.php          # Wallet, TopUp, Transfer, Pay
├── ProfileController.php         # Update profil, PIN
├── SocialAuthController.php      # Google OAuth (direct token, prompt=select_account)
├── MidtransWebhookController.php

app/Services/
├── WalletService.php             # Logic bisnis wallet

app/Models/
├── User.php
├── Wallet.php
├── Transaction.php

config/
├── wallet.php                    # max_transaction_amount, direct_topup_enabled
├── midtrans.php

database/migrations/
database/seeders/
├── DatabaseSeeder.php            # Seed 2 demo users

routes/api.php
```

### Frontend (`frontend/`)
```
src/
├── pages/
│   ├── Dashboard.jsx             # Halaman utama (saldo, transaksi, aksi)
│   ├── Landing.jsx               # Halaman depan
│   ├── Login.jsx                 # Login password + Google OAuth
│   ├── Register.jsx              # Register
│   ├── Profile.jsx               # Profil & PIN
│   └── AuthCallback.jsx          # Penerima redirect Google OAuth + token

├── components/
│   ├── TopUpModal.jsx
│   ├── TransferModal.jsx
│   ├── PayModal.jsx
│   ├── ScanQRModal.jsx           # jsQR + canvas scanning + demo mode
│   ├── ReceiveQRModal.jsx
│   ├── PinModal.jsx
│   ├── PinSetupModal.jsx
│   └── ReceiptModal.jsx

├── hooks/
│   ├── useAuth.js
│   └── useWallet.js

├── lib/
│   ├── api.js
│   ├── auth.js
│   ├── wallet.js
│   └── theme.js                  # Design tokens: Black + Gold luxury theme
```
