# TrustPay — Dokumentasi API

**Base URL:** `http://localhost:8000/api`  
**Format:** JSON  
**Auth:** Bearer token (header `Authorization: Bearer <token>`)

---

## Autentikasi

### POST /register
Daftarkan akun baru. Mengembalikan token Sanctum + data user.

**Request Body**
```json
{
  "name": "Aldi Pratama",
  "username": "aldi_p",
  "email": "aldi@example.com",
  "phone": "08123456789",
  "password": "rahasia123",
  "password_confirmation": "rahasia123"
}
```

**Response 201 Created**
```json
{
  "message": "Registrasi berhasil.",
  "token": "1|abc123...",
  "user": {
    "id": 1,
    "name": "Aldi Pratama",
    "username": "@aldi_p",
    "email": "aldi@example.com",
    "phone": "628123456789"
  }
}
```

**Response 422 Unprocessable Entity** (validasi gagal)
```json
{
  "message": "Username sudah digunakan.",
  "errors": {
    "username": ["Username sudah digunakan."]
  }
}
```

Skenario gagal yang diuji:
- Email format salah (`user@`) → `"Format email tidak valid."`
- Password < 8 karakter → `"Password minimal 8 karakter."`
- Username sudah dipakai → `"Username sudah digunakan."`

---

### POST /login
Login dengan email/username + password.

**Request Body**
```json
{
  "login": "aldi@example.com",
  "password": "rahasia123"
}
```
> `login` bisa berisi email ATAU username (mis. `aldi_p` atau `@aldi_p`).

**Response 200 OK**
```json
{
  "token": "2|xyz789...",
  "user": {
    "id": 1,
    "name": "Aldi Pratama",
    "username": "@aldi_p",
    "email": "aldi@example.com",
    "phone": "628123456789"
  }
}
```

**Response 401 Unauthorized**
```json
{
  "message": "Email/username atau password salah."
}
```

---

### POST /logout *(Butuh Auth)*
Hapus token yang sedang dipakai.

**Response 200 OK**
```json
{
  "message": "Logout berhasil."
}
```

---

### GET /me *(Butuh Auth)*
Ambil data user yang sedang login (untuk validasi token saat refresh halaman).

**Response 200 OK**
```json
{
  "user": {
    "id": 1,
    "name": "Aldi Pratama",
    "username": "@aldi_p",
    "email": "aldi@example.com",
    "phone": "628123456789"
  }
}
```

---

## BONUS — Login OTP WhatsApp

### POST /login/request-otp
Kirim kode OTP 6 digit ke WhatsApp untuk nomor yang terdaftar.

**Request Body**
```json
{
  "phone": "08123456789"
}
```

**Response 200 OK**
```json
{
  "message": "Kode verifikasi dikirim ke WhatsApp kamu.",
  "phone": "628123456789",
  "dev_code": "123456"
}
```
> `dev_code` hanya ada di `APP_ENV=local` untuk kemudahan development.

**Response 404** — nomor tidak terdaftar  
**Response 429** — throttle (kirim ulang terlalu cepat)
```json
{
  "message": "Tunggu 38 detik sebelum meminta kode lagi.",
  "retry_after": 38
}
```

---

### POST /verify-otp
Verifikasi kode OTP → dapat token.

**Request Body**
```json
{
  "phone": "08123456789",
  "code": "123456"
}
```

**Response 200 OK** — sama dengan respons `/login`  
**Response 422** — kode salah atau kedaluwarsa
```json
{
  "message": "Kode OTP salah atau kedaluwarsa."
}
```

---

## Dompet

### GET /wallet *(Butuh Auth)*
Ambil saldo user yang sedang login.

**Response 200 OK**
```json
{
  "balance": 2450000.00
}
```

---

### POST /topup *(Butuh Auth)*
Inisialisasi top up via Midtrans Snap. Mengembalikan token Snap untuk membuka popup pembayaran.

**Request Body**
```json
{
  "amount": 100000
}
```

**Response 200 OK**
```json
{
  "message": "Top up diinisialisasi.",
  "snap_token": "66e4fa55-fdac-4ef9-91a5-...",
  "redirect_url": "https://app.sandbox.midtrans.com/snap/v2/vtweb/...",
  "transaction": {
    "id": 1,
    "code": "TRX-20260621-AB1234",
    "type": "TOPUP",
    "status": "PENDING",
    "amount": 100000.00,
    "balance_after": null,
    "description": "Top up saldo via Midtrans",
    "transfer_code": null,
    "counterpart_user": null,
    "created_at": "2026-06-21T10:00:00.000000Z"
  }
}
```

**Response 422** — validasi gagal
```json
{
  "message": "Nominal harus berupa bilangan bulat.",
  "errors": { "amount": ["Nominal harus berupa bilangan bulat."] }
}
```

---

### POST /topup/confirm *(Butuh Auth)*
Cek status pembayaran dari Midtrans API dan update saldo jika SUCCESS.  
Dipanggil frontend setelah user selesai di Snap popup (onSuccess / onPending / onError / onClose).

**Request Body**
```json
{
  "code": "TRX-20260621-AB1234"
}
```

**Response 200 OK**
```json
{
  "message": "Status transaksi diperbarui.",
  "transaction": {
    "id": 1,
    "code": "TRX-20260621-AB1234",
    "type": "TOPUP",
    "status": "SUCCESS",
    "amount": 100000.00,
    "balance_after": 2550000.00,
    "description": "Top up saldo via Midtrans",
    "transfer_code": null,
    "counterpart_user": null,
    "created_at": "2026-06-21T10:00:00.000000Z"
  },
  "wallet": {
    "balance": 2550000.00
  }
}
```

---

### POST /transfer *(Butuh Auth)*
Transfer ke user lain (debit pengirim + kredit penerima dalam satu DB transaction).

**Request Body**
```json
{
  "recipient": "budi@example.com",
  "amount": 50000,
  "description": "bayar makan siang"
}
```
> `recipient` bisa berisi email, nomor HP, atau username (`@budi` atau `budi`).

**Response 200 OK**
```json
{
  "message": "Transfer berhasil.",
  "wallet": {
    "balance": 2400000.00
  },
  "transaction": {
    "id": 2,
    "code": "TRX-20260621-CD5678",
    "type": "TRANSFER_OUT",
    "status": "SUCCESS",
    "amount": 50000.00,
    "balance_after": 2400000.00,
    "description": "bayar makan siang",
    "transfer_code": "uuid-...",
    "counterpart_user": {
      "id": 2,
      "name": "Budi S.",
      "username": "budi_s"
    },
    "created_at": "2026-06-21T10:05:00.000000Z"
  }
}
```

**Response 400** — saldo tidak cukup
```json
{
  "message": "Saldo tidak cukup."
}
```

**Response 422** — penerima tidak ditemukan / transfer ke diri sendiri
```json
{
  "message": "Penerima tidak ditemukan."
}
```

---

### GET /transactions *(Butuh Auth)*
Riwayat semua transaksi user, terbaru dulu.

**Response 200 OK**
```json
{
  "data": [
    {
      "id": 2,
      "code": "TRX-20260621-CD5678",
      "type": "TRANSFER_OUT",
      "status": "SUCCESS",
      "amount": 50000.00,
      "balance_after": 2400000.00,
      "description": "bayar makan siang",
      "transfer_code": "uuid-...",
      "counterpart_user": {
        "id": 2,
        "name": "Budi S.",
        "username": "budi_s"
      },
      "created_at": "2026-06-21T10:05:00.000000Z"
    },
    {
      "id": 1,
      "code": "TRX-20260621-AB1234",
      "type": "TOPUP",
      "status": "SUCCESS",
      "amount": 100000.00,
      "balance_after": 2450000.00,
      "description": "Top up saldo via Midtrans",
      "transfer_code": null,
      "counterpart_user": null,
      "created_at": "2026-06-21T10:00:00.000000Z"
    }
  ]
}
```

---

## Kode HTTP yang Dipakai

| Kode | Arti |
|------|------|
| 200 | Berhasil |
| 201 | Berhasil (resource baru dibuat) |
| 400 | Gagal — error bisnis (mis. saldo tidak cukup) |
| 401 | Unauthorized — token tidak ada / tidak valid |
| 404 | Data tidak ditemukan |
| 422 | Validasi gagal (field errors tersedia) |
| 429 | Too Many Requests (throttle OTP) |
| 500/502 | Error server (mis. Midtrans tidak bisa dihubungi) |

---

## Header yang Diperlukan

```
Accept: application/json
Content-Type: application/json
Authorization: Bearer <token>   ← semua endpoint yang butuh auth
```

---

## Catatan Seeder

Password default untuk akun seeder: `password123`  
Jalankan: `php artisan db:seed`
