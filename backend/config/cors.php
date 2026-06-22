<?php

/**
 * Konfigurasi CORS (Cross-Origin Resource Sharing) untuk TrustPay API.
 *
 * Frontend (React/Vite) berjalan di origin berbeda dengan backend (Laravel).
 * Tanpa CORS, browser akan memblokir semua request dari frontend ke backend.
 *
 * BONUS #6 — Cookie:
 *  'supports_credentials' => true  → wajib agar browser mengirim cookie
 *  (dipakai bersama `credentials: 'include'` di fetch frontend)
 *  PENTING: jika supports_credentials = true, allowed_origins TIDAK boleh '*'
 *  harus domain spesifik (keamanan CORS standar).
 *
 * Variabel .env:
 *  FRONTEND_URL=http://localhost:5173  (dev)
 *  FRONTEND_URL=https://trustpay.vercel.app  (production)
 */
return [
    'paths'                    => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods'          => ['*'],
    'allowed_origins'          => [env('FRONTEND_URL', 'http://localhost:5173')],
    'allowed_origins_patterns' => [],
    'allowed_headers'          => ['*'],
    'exposed_headers'          => [],
    'max_age'                  => 0,
    // true = browser kirim cookie antar origin (dibutuhkan untuk auth cookie bonus)
    'supports_credentials'     => true,
];
