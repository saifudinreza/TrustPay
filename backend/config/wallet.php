<?php

// Konfigurasi domain Wallet. Diakses via config('wallet.max_transaction_amount').
// Dipakai oleh TopUpRequest & TransferRequest untuk aturan 'max' nominal —
// dipisah ke config supaya batas mudah diubah tanpa menyentuh kode validasi.
return [

    // Batas maksimum 1 kali transaksi (top up / transfer), dalam Rupiah.
    // Bisa dioverride lewat .env: WALLET_MAX_TRANSACTION=...
    'max_transaction_amount' => (int) env('WALLET_MAX_TRANSACTION', 50_000_000),

];
