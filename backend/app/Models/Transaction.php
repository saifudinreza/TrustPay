<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Transaction — satu baris catatan per peristiwa keuangan (ledger model).
 *
 * Setiap mutasi saldo menghasilkan minimal 1 baris (TOPUP), atau 2 baris
 * (TRANSFER: TRANSFER_OUT untuk pengirim + TRANSFER_IN untuk penerima).
 * Pasangan transfer diikat oleh kolom `transfer_code` (UUID yang sama).
 *
 * Kolom:
 *  - code              → kode unik per baris, format TRX-YYYYMMDD-XXXXXX
 *  - transfer_code     → UUID bersama antara TRANSFER_OUT dan TRANSFER_IN pasangannya
 *  - user_id           → pemilik baris ini (pengirim untuk OUT, penerima untuk IN)
 *  - counterpart_user_id → lawan transaksi (nullable: tidak ada untuk TOPUP)
 *  - type              → TOPUP | TRANSFER_IN | TRANSFER_OUT
 *  - status            → PENDING | SUCCESS | FAILED (TOPUP bisa PENDING saat menunggu Midtrans)
 *  - amount            → nominal transaksi (selalu positif; tanda +/- dari tipe)
 *  - balance_after     → saldo user setelah transaksi ini (null jika PENDING)
 *  - description       → catatan opsional dari user
 */
class Transaction extends Model
{
    protected $fillable = [
        'code',
        'transfer_code',
        'user_id',
        'counterpart_user_id',
        'type',
        'status',
        'amount',
        'balance_after',
        'description',
    ];

    /**
     * Cast decimal agar konsisten saat dibaca — selalu string 2 desimal
     * (aman untuk bcmath dan serialisasi JSON).
     */
    protected $casts = [
        'amount' => 'decimal:2',
        'balance_after' => 'decimal:2',
    ];

    /**
     * Pemilik transaksi (bukan selalu pengirim — TRANSFER_IN dimiliki penerima).
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Lawan transaksi: penerima (untuk TRANSFER_OUT) atau pengirim (untuk TRANSFER_IN).
     * Nullable karena TOPUP tidak punya counterpart.
     * Kolom FK berbeda (counterpart_user_id) sehingga perlu parameter kedua.
     */
    public function counterpartUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'counterpart_user_id');
    }
}
