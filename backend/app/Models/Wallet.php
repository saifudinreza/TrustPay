<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Wallet — dompet digital per user.
 *
 * Satu user punya satu baris wallet. Saldo disimpan sebagai decimal(15,2)
 * untuk menghindari floating-point error — operasi saldo selalu menggunakan
 * bcmath (bcadd, bcsub, bccomp) bukan operator PHP biasa, agar presisi terjaga.
 *
 * Kolom:
 *  - user_id  → FK ke users (unique: 1 user = 1 wallet)
 *  - balance  → saldo dalam Rupiah; selalu >= 0 (dijaga di WalletService)
 */
class Wallet extends Model
{
    protected $fillable = ['user_id', 'balance'];

    /**
     * Cast 'balance' ke 'decimal:2' agar saat dibaca dari DB selalu
     * berupa string dengan 2 desimal (aman untuk bcmath).
     */
    protected $casts = ['balance' => 'decimal:2'];

    /**
     * Wallet dimiliki oleh satu user.
     * Digunakan di WalletService untuk `lockForUpdate()` sebelum mutasi saldo.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
