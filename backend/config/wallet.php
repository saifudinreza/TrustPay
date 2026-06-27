<?php

// Konfigurasi domain Wallet.
return [

    // Batas maksimum 1 kali transaksi (top up / transfer), dalam Rupiah.
    'max_transaction_amount' => (int) env('WALLET_MAX_TRANSACTION', 50_000_000),

    // Jika true, topup langsung menambah saldo tanpa Midtrans (untuk demo/pengembangan).
    'direct_topup_enabled' => (bool) env('DIRECT_TOPUP_ENABLED', false),


];
