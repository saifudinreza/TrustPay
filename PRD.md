# PRD — Mini Wallet API & Dashboard
**Exam Penyaluran Kerja — Full Stack Web Development Bootcamp (Dibimbing.id)**

| Item | Detail |
|---|---|
| Author | Saifudin Reza |
| Versi | 1.0 |
| Tanggal dibuat | 21 Juni 2026 |
| Deadline submit | 27 Juni 2026, 23.50 WIB |
| Presentasi | H+7 dari Take Home Test diberikan |
| Status | Draft — menunggu konfirmasi beberapa keputusan teknis (lihat §16) |

---

## 1. Overview

Mini Wallet API & Dashboard adalah aplikasi simulasi dompet digital (e-wallet) yang memungkinkan user melakukan **top-up saldo**, **transfer saldo antar user**, dan **melihat riwayat mutasi**. Project ini dibangun sebagai bukti kompetensi (take home test) yang menilai kemampuan implementasi autentikasi aman, integritas transaksi finansial (transactional integrity), validasi ketat, dan dashboard SPA berbasis React.

Konteks penting: ini adalah **exam berbobot kelulusan** (skor minimum lulus Penyaluran Kerja: 80), dipresentasikan ke mentor, dan ada sanksi skor 0 jika terdeteksi 100% mengandalkan AI. PRD ini disusun supaya proses pengerjaan tetap terstruktur dan **dipahami penuh oleh pengerjanya**, bukan sekadar di-generate.

---

## 2. Tujuan (Objectives)

1. Mengimplementasikan sistem autentikasi aman (register & login) menggunakan Laravel Sanctum.
2. Membangun sistem Wallet dengan prinsip **transactional integrity** (atomic, rollback-safe).
3. Menerapkan validasi ketat & security best practice di setiap endpoint mutasi saldo.
4. Membangun Dashboard SPA dengan React yang responsif terhadap state loading & error dari API.
5. Menunjukkan kemampuan problem solving & clean architecture yang bisa dijelaskan ulang secara verbal saat presentasi.

---

## 3. User & Persona

| Persona | Kebutuhan |
|---|---|
| **User terdaftar** | Bisa register, login, lihat saldo, top up, transfer ke user lain, lihat riwayat transaksi miliknya sendiri |
| **Mentor / Penilai** | Bisa cek clean code, transactional integrity, validasi, dan hasil presentasi |

---

## 4. Scope

### 4.1 In Scope
- Auth: Register, Login (Sanctum token / cookie session)
- Wallet: cek saldo, top up, transfer, riwayat transaksi
- Validasi ketat di BE dan FE
- DB transaction + rollback pada transfer
- Middleware auth di semua endpoint mutasi/lihat data sensitif
- Dashboard SPA: Login page, Dashboard page (saldo, top up, transfer form, tabel riwayat)
- Error handling & loading state di FE
- Dokumentasi API (Postman/PDF) — optional tapi disarankan untuk poin tambahan

### 4.2 Out of Scope
- Payment gateway sungguhan (top up murni simulasi, tidak ada proses pembayaran eksternal)
- Multi-currency
- Notifikasi email/SMS
- Role admin / manajemen user oleh admin
- Reset password / forgot password (tidak diminta di requirement, bisa jadi nice-to-have kalau waktu cukup)

---

## 5. Tech Stack

| Layer | Teknologi | Catatan |
|---|---|---|
| Backend | Laravel 11 | REST API |
| Auth | Laravel Sanctum | Token-based / cookie-based (lihat §16) |
| Database | MySQL | Pakai DB transaction (`DB::transaction`) untuk transfer |
| Frontend | React + Vite | SPA, tanpa SSR supaya setup lebih ringan & cepat |
| HTTP Client | Axios atau Fetch API | Axios disarankan (interceptor untuk token/cookie) |
| State management | React Context / useState (cukup untuk skala app ini, tidak perlu Redux) |
| Styling | Tailwind CSS | Cepat untuk styling dashboard |
| Deployment BE | Railway (Docker) | Konsisten dengan project sebelumnya (KasirAI) |
| Deployment FE | Vercel | |

---

## 6. Data Model

### 6.1 Entity Overview

```
users (1) ────── (1) wallets
users (1) ────── (n) transactions  [sebagai sender / receiver]
```

### 6.2 Tabel `users`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | bigint, PK | |
| name | string | |
| username | string, unique | |
| email | string, unique | format email valid |
| phone | string, nullable, unique | digunakan sebagai alternatif identifier transfer |
| password | string (hashed) | min 8 karakter |
| created_at / updated_at | timestamp | |

### 6.3 Tabel `wallets`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | bigint, PK | |
| user_id | bigint, FK → users.id, unique | 1 user = 1 wallet |
| balance | decimal(15,2), default 0 | tidak boleh minus (constraint di level aplikasi) |
| created_at / updated_at | timestamp | |

### 6.4 Tabel `transactions`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | bigint, PK | |
| transfer_code | uuid, nullable | menghubungkan pasangan baris debit-kredit pada transfer (null untuk top up) |
| user_id | bigint, FK → users.id | pemilik baris ledger ini |
| counterpart_user_id | bigint, FK → users.id, nullable | lawan transaksi (null untuk top up) |
| type | enum(`TOPUP`, `TRANSFER_IN`, `TRANSFER_OUT`) | |
| amount | decimal(15,2) | selalu positif, makna +/- ditentukan oleh `type` |
| balance_after | decimal(15,2) | saldo setelah transaksi ini tercatat, untuk audit trail |
| description | string, nullable | |
| created_at / updated_at | timestamp | |

> **Catatan desain:** pakai pola **ledger per baris** (bukan update saldo langsung tanpa jejak) supaya riwayat transaksi gampang ditarik tanpa join rumit, dan setiap baris self-explanatory untuk audit. Saat presentasi, ini poin bagus untuk dijelaskan ke mentor sebagai bentuk "clean architecture".

---

## 7. Functional Requirements

### 7.1 Authentication

**Register**
- Field: `name`, `username`, `email`, `phone` (opsional), `password`, `password_confirmation`
- Validasi:
  - `email`: format valid (reject `user@` tanpa domain), unique
  - `username`: required, unique
  - `password`: min 8 karakter
- Sukses → buat `User` + `Wallet` (balance 0) dalam satu DB transaction, lalu kembalikan token/cookie session
- Skenario invalid → 422 dengan pesan per-field

**Login**
- Field: `email` (atau `username`) + `password`
- Sukses → balikan token Sanctum (atau set cookie httpOnly, lihat §16) + data user
- Gagal kredensial → 401 Unauthorized, pesan generik (jangan bocorkan apakah email atau password yang salah, demi security)

### 7.2 Wallet — Lihat Saldo
`GET /api/wallet`
- Wajib auth
- Balikan saldo wallet milik user yang login saja (cek `wallet.user_id === auth()->id()`)

### 7.3 Wallet — Top Up
`POST /api/topup`
- Field: `amount`
- Validasi:
  - Wajib angka (reject huruf/simbol) → "Nominal harus berupa angka."
  - Tidak boleh kosong → "Nominal tidak boleh kosong."
  - Tidak boleh negatif
  - Wajib bilangan bulat (integer, reject desimal)
  - Ada batas maksimum per transaksi (mis. konfigurasi `MAX_TRANSACTION_AMOUNT`, default disarankan 50.000.000) → "Nominal melebihi batas maksimum transaksi."
- Proses: dalam `DB::transaction`, tambahkan `balance`, insert row `transactions` (type `TOPUP`)
- Response sukses: saldo terbaru + data transaksi

### 7.4 Wallet — Transfer
`POST /api/transfer`
- Field: `recipient` (email atau nomor HP), `amount`, `description` (opsional)
- Validasi:
  - Semua validasi nominal di §7.3 berlaku juga di sini
  - `recipient` harus ditemukan di tabel users, dan **tidak boleh transfer ke diri sendiri**
  - Saldo pengirim harus cukup (`balance >= amount`), kalau tidak → pesan jelas, mis. "Saldo tidak cukup."
- Proses (atomic, dalam satu `DB::transaction`):
  1. Lock baris wallet pengirim (`lockForUpdate`) untuk hindari race condition
  2. Validasi ulang saldo di dalam transaction (defense in depth)
  3. Kurangi saldo pengirim, insert `transactions` row (`TRANSFER_OUT`)
  4. Tambah saldo penerima, insert `transactions` row (`TRANSFER_IN`), keduanya pakai `transfer_code` yang sama
  5. Jika salah satu langkah gagal (exception) → seluruh transaction **rollback otomatis**, tidak ada data tersimpan
- Response sukses: saldo terbaru pengirim + detail transaksi

### 7.5 Wallet — Riwayat Transaksi
`GET /api/transactions`
- Wajib auth
- Hanya menampilkan baris milik user yang login (`where user_id = auth()->id()`)
- Disarankan: pagination (`?page=`), filter by tipe/tanggal (nice-to-have)
- Response: list transaksi terurut terbaru → terlama

### 7.6 Frontend Dashboard

**Halaman Login**
- Form email/username + password
- Validasi client-side dasar sebelum submit (required, format email)
- Tampilkan error dari API (401) dengan pesan ramah
- Loading state saat submit (disable tombol, spinner)

**Halaman Dashboard**
- **Card Saldo**: tampil saldo real-time, refresh otomatis setelah top up/transfer sukses
- **Tombol Top Up** → buka modal/form input nominal
  - Validasi input nominal real-time (hanya angka, integer, tidak boleh kosong/negatif)
  - Tombol submit **disabled** sampai input valid, dan disabled lagi selama request berjalan (cegah double-submit / spam klik)
  - Tampilkan error spesifik dari API kalau gagal
- **Form Transfer**: input `recipient` + `amount`
  - Sama seperti top up: validasi real-time, loading state, error handling (mis. "Saldo tidak cukup" ditampilkan langsung di bawah field)
- **Tabel Riwayat Transaksi**: kolom tanggal, tipe (masuk/keluar — beri warna beda), nominal, lawan transaksi, saldo setelah transaksi
  - Loading skeleton saat fetch awal
  - Empty state kalau belum ada transaksi

---

## 8. API Specification

| Method | Endpoint | Auth | Body | Sukses | Error |
|---|---|---|---|---|---|
| POST | `/api/register` | tidak | `name, username, email, phone?, password, password_confirmation` | 201 | 422 |
| POST | `/api/login` | tidak | `email/username, password` | 200 + token/cookie | 401, 422 |
| POST | `/api/logout` | ya | — | 200 | 401 |
| GET | `/api/wallet` | ya | — | 200 | 401 |
| POST | `/api/topup` | ya | `amount` | 200 | 400, 401, 422 |
| POST | `/api/transfer` | ya | `recipient, amount, description?` | 200 | 400, 401, 422 |
| GET | `/api/transactions` | ya | query: `page?` | 200 | 401 |

---

## 9. Validation Rules — Detail Lengkap

### 9.1 Auth
| Field | Rule |
|---|---|
| email | `required, email, unique:users` (saat register) |
| username | `required, unique:users` |
| password | `required, min:8, confirmed` |

### 9.2 Nominal (top up & transfer)
| Skenario Input | Expected Response |
|---|---|
| Huruf (`abc`) | 422 — "Nominal harus berupa angka." |
| Kosong (`""`) | 422 — "Nominal tidak boleh kosong." |
| Mengandung simbol (`Rp100.000`, `100k`) | 422 — "Nominal harus berupa angka." |
| Negatif (top up) | 422 — "Nominal tidak boleh negatif." |
| Desimal (`100.5`) | 422 — "Nominal harus berupa bilangan bulat." |
| Melebihi batas maksimum | 422 — "Nominal melebihi batas maksimum transaksi." |
| Saldo tidak cukup (transfer) | 400 — "Saldo tidak cukup." |
| Recipient tidak ditemukan | 404/422 — "Penerima tidak ditemukan." |
| Transfer ke diri sendiri | 422 — "Tidak dapat transfer ke diri sendiri." |

> Semua skenario invalid: **tidak ada perubahan apapun di database**, dan FE tidak boleh bisa submit tombol sebelum validasi client-side lolos.

---

## 10. Error Handling Standard

Format response error konsisten (mengikuti default Laravel `ValidationException` + custom exception handler):

```json
{
  "message": "Nominal tidak boleh kosong.",
  "errors": {
    "amount": ["Nominal tidak boleh kosong."]
  }
}
```

| Status | Kapan dipakai |
|---|---|
| 400 Bad Request | Logic error yang bukan validasi format (mis. saldo tidak cukup) |
| 401 Unauthorized | Token invalid/tidak ada, atau kredensial login salah |
| 422 Unprocessable Entity | Validasi format input gagal (FormRequest) |

---

## 11. Security Requirements

- Semua endpoint wallet/transaksi **wajib** middleware `auth:sanctum`
- Setiap query data wallet/transaksi **wajib** difilter `where user_id = auth()->id()` — user A tidak boleh bisa akses data user B (cegah lewat manipulasi ID di request)
- Password di-hash (bcrypt, default Laravel)
- Rate limiting disarankan di `/api/login` untuk cegah brute force (nice-to-have)
- Gunakan `lockForUpdate()` saat baca saldo dalam transaction transfer, untuk cegah race condition dua transfer bersamaan

---

## 12. Non-Functional Requirements

- **Konsistensi data**: tidak boleh ada kondisi saldo terpotong tapi gagal masuk ke penerima (atomic transaction)
- **Performance**: query list transaksi pakai index pada `user_id` dan `created_at`
- **Code readability**: ikut struktur Laravel standar — Controller tipis, logic bisnis di Service/Action class, validasi di FormRequest
- **Testability**: disarankan ada minimal beberapa test (unit/feature) untuk transfer (sukses, saldo kurang, rollback)

---

## 13. UI/UX Flow (ringkas)

```
[Login Page] --sukses--> [Dashboard]
                            ├── Card Saldo (auto refresh)
                            ├── Tombol "Top Up" → Modal Input Nominal → Submit (loading) → Toast sukses/gagal → refresh saldo
                            ├── Form Transfer (recipient + nominal) → Submit (loading) → Toast sukses/gagal → refresh saldo + tabel
                            └── Tabel Riwayat Transaksi (paginated)
```

---

## 14. Acceptance Criteria (mapping ke Rubrik Penilaian)

| Kategori Rubrik | Acceptance Criteria |
|---|---|
| Code Readability (15) | Struktur folder rapi, naming konsisten, tidak ada logic bisnis di Controller |
| Code Effectivity (5) | Query tidak N+1, pakai eager loading bila perlu, index di kolom yang sering di-query |
| FE: Login & Dashboard (10) | Kedua halaman berfungsi penuh, responsif |
| API Integration (10) | FE terhubung benar ke semua endpoint, error API tertangani di UI |
| FE Requirement (15) | Loading state, validasi real-time, error message spesifik semua terpenuhi |
| BE: Authentication (10) | Register/login sesuai semua skenario invalid di requirement |
| BE: Wallet API (10) | 4 endpoint wallet semua berjalan sesuai spec |
| BE Requirement (15) | DB transaction + rollback teruji, validasi ketat semua skenario, middleware auth aktif |
| Presentation (10) | Bisa jelaskan alur & keputusan teknis secara verbal tanpa membaca script |

---

## 15. Timeline Pengerjaan (vs deadline 27 Juni 2026, 23.50 WIB)

| Hari | Tanggal | Fokus |
|---|---|---|
| 1 | 21 Jun | Setup project (Laravel + React), desain ERD, migration & model |
| 2 | 22 Jun | Auth: register + login + semua skenario validasi invalid |
| 3 | 23 Jun | Wallet: GET saldo + top up (dengan DB transaction) |
| 4 | 24 Jun | Transfer (atomic + rollback) + riwayat transaksi + security check (user A vs B) |
| 5 | 25 Jun | FE: Login page + Dashboard skeleton + integrasi API saldo |
| 6 | 26 Jun | FE: Form top up & transfer + error handling + loading state + polish |
| 7 | 27 Jun | Testing end-to-end, deploy, README, Postman collection, susun slide, submit sebelum 23.50 WIB |

> Setelah submit, sisa waktu sebelum presentasi (H+7) dipakai untuk latihan menjelaskan arsitektur secara lisan — bukan baca slide.

---

## 16. Assumptions & Open Decisions

Beberapa hal di bawah ini masih perlu dikonfirmasi/diputuskan — PRD ini akan disesuaikan begitu diputuskan:

1. **Starting point project** — asumsi sementara: mulai dari nol (belum ada boilerplate). *(belum dikonfirmasi)*
2. **React tooling** — asumsi: React + Vite (lebih ringan & cepat dibanding Next.js untuk SPA sederhana seperti ini). *(belum dikonfirmasi)*
3. **Strategi token auth** — asumsi: httpOnly cookie (sesuai rekomendasi bonus di guideline). Kalau waktu terbatas, fallback ke Bearer token di localStorage (lebih cepat implementasi, tapi tidak dapat poin bonus). *(belum dikonfirmasi)*
4. **Batas maksimum nominal transaksi** — disarankan default Rp 50.000.000 per transaksi, bisa diubah sesuai kebutuhan.
5. **Identifier transfer** — asumsi: bisa pakai email **atau** nomor HP (sesuai requirement "berdasarkan email/nomor HP").

---

## 17. Out of Scope / Nice-to-have (kalau waktu lebih)

- Rate limiting login
- Export riwayat transaksi ke PDF/CSV
- Notifikasi real-time (WebSocket) saat menerima transfer
- Dark mode dashboard
- Unit/feature test coverage lebih lengkap
