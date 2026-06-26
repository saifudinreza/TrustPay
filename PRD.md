# PRD — TrustPay: Buku Tabungan Digital (Mini Wallet)
**Exam Penyaluran Kerja — Full Stack Web Development Bootcamp (Dibimbing.id)**

| Item | Detail |
|---|---|
| Author | Saifudin Reza |
| Versi | 2.0 |
| Tanggal | 26 Juni 2026 |
| Deadline | 27 Juni 2026, 23.50 WIB |

---

## 1. Ringkasan Produk

TrustPay adalah aplikasi **dompet digital (e-wallet)** dengan konsep **Buku Tabungan Digital** — setiap rupiah tercatat secara permanen layaknya buku tabungan bank. Pengguna dapat melakukan top up saldo, transfer antar pengguna, bayar tagihan (Pulsa/PLN/PDAM/Internet), scan & bayar QRIS, redeem voucher, dan mendapatkan cashback dari setiap transaksi.

---

## 2. Tujuan

1. Membangun sistem dompet digital dengan integritas transaksi penuh (atomic, rollback-safe).
2. Menyediakan autentikasi aman (Laravel Sanctum + Google OAuth + OTP WhatsApp).
3. Menyediakan dashboard SPA real-time dengan React.
4. Mengintegrasikan fitur promo, cashback, dan voucher untuk engagement pengguna.
5. Mendemonstrasikan kemampuan full stack: Laravel API, React SPA, integrasi pihak ketiga.

---

## 3. Tech Stack

| Layer | Teknologi |
|---|---|
| Backend | Laravel 13, PHP 8.3 |
| Database | MySQL (SQLite fallback) |
| Auth | Sanctum (token/cookie), Socialite (Google OAuth), OTP WhatsApp (Fonnte) |
| Payment Gateway | Midtrans Snap (sandbox/production) |
| Frontend | React 18, Vite 5, Tailwind CSS 3 |
| Deployment BE | Docker / Render |
| Deployment FE | Vercel |

---

## 4. Fitur-Fitur

### 4.1 Autentikasi
- Register: name, username, email, phone (opsional), password
- Login: email/username + password → token Sanctum
- OTP WhatsApp (bonus): login tanpa password via kode OTP
- Google OAuth (bonus): login satu klik via Google
- Atur PIN transaksi 6 digit

### 4.2 Dompet Digital (Wallet)
- Cek saldo real-time
- Top up saldo (**Direct Mode** untuk demo, **Midtrans Snap** untuk production)
- Transfer antar pengguna (via email/username/phone)
- Riwayat transaksi (filter, cari, export CSV, cetak PDF)

### 4.3 Pembayaran Tagihan
- Pulsa, Listrik PLN, Air PDAM, Internet
- Potong saldo langsung dengan verifikasi PIN

### 4.4 QRIS
- **Scan QRIS**: kamera langsung (BarcodeDetector API) baca QRIS merchant → bayar otomatis
- Demo mode untuk browser yang tidak mendukung kamera
- **Terima QR**: generate QR untuk menerima transfer

### 4.5 Promo & Cashback
- Cashback 10% untuk transfer sesama TrustPay (maks Rp 50.000)
- Cashback 5% untuk bayar tagihan (maks Rp 25.000)
- Cashback otomatis masuk ke saldo sebagai transaksi TOPUP

### 4.6 Voucher
- Redeem kode voucher untuk saldo gratis
- Validasi: kode aktif, belum kadaluarsa, kuota tersedia, belum pernah dipakai
- Voucher contoh: `WELCOME10` (Rp 10.000), `BONUS50` (Rp 50.000), `FREEBAL` (Rp 15.000)

---

## 5. Entity Relationship Diagram

```
users (1) ────── (1) wallets
users (1) ────── (n) transactions
users (n) ────── (n) vouchers  [pivot: user_voucher]
```

### Tabel `users`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | bigint, PK | |
| name | string | |
| username | string, unique | |
| email | string, unique | |
| phone | string, nullable, unique | |
| password | string (hashed) | nullable (untuk user OTP) |
| pin | string (hashed), nullable | PIN 6 digit untuk transaksi |
| google_id | string, nullable | ID dari Google OAuth |
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
| type | enum(TOPUP,TRANSFER_IN,TRANSFER_OUT) | |
| status | enum(PENDING,SUCCESS,FAILED) | khusus TOPUP via Midtrans |
| amount | decimal(15,2) | selalu positif |
| balance_after | decimal(15,2), nullable | saldo setelah transaksi |
| description | string, nullable | |
| created_at / updated_at | timestamp | |

### Tabel `vouchers`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | bigint, PK | |
| code | string(32), unique | kode redeem |
| value | decimal(15,2) | nominal saldo |
| max_uses | integer, nullable | kuota global (null = tak terbatas) |
| max_uses_per_user | integer, default 1 | |
| expires_at | timestamp, nullable | |
| is_active | boolean | |
| description | string, nullable | |

### Tabel `user_voucher` (pivot)
| Kolom | Tipe |
|---|---|
| user_id | bigint, FK |
| voucher_id | bigint, FK |
| used_at | timestamp |

---

## 6. API Endpoints

| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| POST | `/api/register` | ✗ | Daftar akun baru |
| POST | `/api/login` | ✗ | Login email/username + password |
| POST | `/api/login/request-otp` | ✗ | Minta OTP WhatsApp |
| POST | `/api/verify-otp` | ✗ | Verifikasi OTP |
| GET | `/api/auth/google/redirect` | ✗ | Redirect ke Google OAuth |
| GET | `/api/auth/google/callback` | ✗ | Callback Google OAuth |
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
| GET | `/api/promos` | ✓ | Daftar promo aktif |
| POST | `/api/vouchers/redeem` | ✓ | Redeem kode voucher |
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
4. Jika eligible → cashback otomatis masuk ke sender

### Redeem Voucher
1. User input kode → `POST /vouchers/redeem`
2. Validasi: kode ada, aktif, belum expired, kuota tersisa, belum dipakai user
3. Saldo bertambah + catat transaksi TOPUP + tandai pivot

---

## 8. Cara Menjalankan

```bash
# Backend
cd backend
composer install
cp .env.example .env   # lalu edit konfigurasi database & Midtrans
php artisan key:generate
php artisan migrate
php artisan db:seed
php artisan serve

# Frontend
cd frontend
npm install
npm run dev
```

### Voucher Demo (Seeder)
| Kode | Nilai | Kuota |
|---|---|---|
| WELCOME10 | Rp 10.000 | 100 |
| RAMADHAN25 | Rp 25.000 | 50 |
| BONUS50 | Rp 50.000 | 20 |
| FREEBAL | Rp 15.000 | ∞ |

---

## 9. Validasi Input

### Nominal (top up, transfer, pay)
| Skenario | Respon |
|---|---|
| Kosong | 422 — "Nominal tidak boleh kosong." |
| Huruf/simbol | 422 — "Nominal harus berupa angka." |
| Negatif | 422 — "Nominal tidak boleh negatif." |
| Desimal | 422 — "Nominal harus berupa bilangan bulat." |
| Melebihi batas | 422 — "Nominal melebihi batas maksimum transaksi." |
| Saldo tidak cukup | 400 — "Saldo tidak cukup." |

### Transfer
| Skenario | Respon |
|---|---|
| Penerima tidak ditemukan | 422 — "Penerima tidak ditemukan." |
| Transfer ke diri sendiri | 422 — "Tidak dapat transfer ke diri sendiri." |
| PIN salah | 422 — "PIN salah." |
| PIN belum diatur | 403 — "Atur PIN transaksi terlebih dahulu." |

### Voucher
| Skenario | Respon |
|---|---|
| Kode tidak ditemukan | 404 — "Kode voucher tidak ditemukan." |
| Voucher tidak aktif | 400 — "Voucher sudah tidak aktif." |
| Voucher kedaluwarsa | 400 — "Voucher sudah kedaluwarsa." |
| Kuota habis | 400 — "Kuota voucher sudah habis." |
| Sudah pernah pakai | 400 — "Kamu sudah pernah menggunakan voucher ini." |

---

## 10. Arsitektur Keamanan

- **Sanctum Token**: semua endpoint mutasi dilindungi `auth:sanctum`
- **Row-level locking**: `lockForUpdate()` pada wallet saat transfer mencegah race condition
- **Atomic transaction**: semua transaksi keuangan dalam `DB::transaction` — rollback otomatis jika ada kegagalan
- **PIN transaksi**: setiap transfer/pay wajib verifikasi PIN 6 digit (bcrypt)
- **Authorization**: user hanya bisa akses data milik sendiri (`where user_id = auth()->id()`)
- **Token di cookie**: token disimpan di cookie (SameSite=Strict) bukan localStorage, lebih aman dari XSS

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
├── AuthController.php        # Register, Login, Logout, OTP
├── WalletController.php      # Wallet, TopUp, Transfer, Pay, Promo, Voucher
├── ProfileController.php     # Update profil, PIN
├── SocialAuthController.php  # Google OAuth
├── MidtransWebhookController.php

app/Services/
├── WalletService.php          # Logic bisnis wallet + cashback
├── OtpService.php             # Logic OTP WhatsApp

app/Models/
├── User.php
├── Wallet.php
├── Transaction.php
├── Voucher.php

app/Http/Requests/
├── TopUpRequest.php
├── TransferRequest.php
├── RegisterRequest.php
├── LoginRequest.php

config/
├── wallet.php                 # Config: max amount, direct topup, promos
├── midtrans.php               # Config Midtrans

database/migrations/           # 11 file migrasi
database/seeders/
├── DatabaseSeeder.php         # Seed users + vouchers

routes/api.php                 # Semua routing API
```

### Frontend (`frontend/`)
```
src/
├── pages/
│   ├── Dashboard.jsx          # Halaman utama (saldo, transaksi, promo, modal)
│   ├── Landing.jsx            # Halaman depan
│   ├── Login.jsx              # Login
│   ├── Register.jsx           # Register
│   ├── Profile.jsx            # Profil & PIN
│   └── AuthCallback.jsx       # Callback Google OAuth

├── components/
│   ├── TopUpModal.jsx         # Modal top up saldo
│   ├── TransferModal.jsx      # Modal transfer
│   ├── PayModal.jsx           # Modal bayar tagihan
│   ├── ScanQRModal.jsx        # Scan QRIS via kamera
│   ├── ReceiveQRModal.jsx     # Generate QR untuk terima
│   ├── PinModal.jsx           # Verifikasi PIN
│   ├── PinSetupModal.jsx      # Atur PIN
│   ├── ReceiptModal.jsx       # Bukti transaksi
│   ├── VoucherModal.jsx       # Redeem voucher
│   └── ...

├── hooks/
│   ├── useAuth.js             # Hook autentikasi
│   └── useWallet.js           # Hook wallet (saldo, transaksi)

├── lib/
│   ├── api.js                 # HTTP client wrapper
│   ├── auth.js                # Manajemen token & sesi
│   ├── wallet.js              # Format, validasi, filter
│   └── theme.js               # Design tokens Black + Gold
```
