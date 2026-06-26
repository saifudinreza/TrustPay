<?php

// Konfigurasi domain Wallet.
return [

    // Batas maksimum 1 kali transaksi (top up / transfer), dalam Rupiah.
    'max_transaction_amount' => (int) env('WALLET_MAX_TRANSACTION', 50_000_000),

    // Jika true, topup langsung menambah saldo tanpa Midtrans (untuk demo/pengembangan).
    'direct_topup_enabled' => (bool) env('DIRECT_TOPUP_ENABLED', false),

    // Daftar promo & cashback aktif.
    'promos' => [
        [
            'id' => 1,
            'title' => 'Cashback 10%',
            'description' => 'Transfer sesama TrustPay',
            'tag' => 'Sampai 30 Jun',
            'type' => 'transfer',
            'cashback_percent' => 10,
            'max_cashback' => 50000,
            'min_amount' => 10000,
            'dark' => false,
        ],
        [
            'id' => 2,
            'title' => 'Top Up Gratis',
            'description' => 'Via VA BCA / BNI / BRI',
            'tag' => 'Min Rp 100.000',
            'type' => 'topup',
            'cashback_percent' => 0,
            'max_cashback' => 0,
            'min_amount' => 100000,
            'dark' => true,
        ],
        [
            'id' => 3,
            'title' => 'Cashback 5% Bayar Tagihan',
            'description' => 'Pulsa, PLN, PDAM, Internet',
            'tag' => 'Maks Rp 25.000',
            'type' => 'pay',
            'cashback_percent' => 5,
            'max_cashback' => 25000,
            'min_amount' => 20000,
            'dark' => false,
        ],
    ],

];
