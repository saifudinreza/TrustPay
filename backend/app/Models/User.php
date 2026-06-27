<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

/**
 * User — model utama autentikasi TrustPay.
 *
 * Kolom penting:
 *  - name, username, email → identitas
 *  - phone → opsional, dipakai untuk OTP WhatsApp (bonus) + identifier transfer
 *  - password → nullable: user yang daftar via OTP tidak perlu password
 *
 * Relasi:
 *  - hasOne(Wallet)       → setiap user punya tepat 1 dompet (dibuat otomatis saat register)
 *  - hasMany(Transaction) → semua transaksi yang dilakukan atau diterima user
 *
 * Trait HasApiTokens memungkinkan `$user->createToken(...)` dari Sanctum.
 */
#[Fillable(['name', 'username', 'email', 'phone', 'password', 'pin', 'google_id', 'is_approved'])]
#[Hidden(['password', 'pin', 'remember_token'])] // JANGAN pernah kirim password/pin/token ke frontend
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * Konversi tipe otomatis saat model diambil dari DB:
     *  - 'hashed' → password di-hash Bcrypt otomatis saat diisi (tidak perlu Hash::make manual)
     *  - 'datetime' → email_verified_at menjadi Carbon instance
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
            'pin'               => 'hashed',
            'is_approved'       => 'boolean',
        ];
    }

    /**
     * Bentuk data user yang aman dikirim ke frontend (TANPA password/pin/token).
     * Dipakai oleh AuthController & ProfileController agar formatnya konsisten.
     *  - username selalu diberi prefix '@'
     *  - has_pin → frontend tahu apakah user perlu mengatur PIN dulu sebelum transaksi
     */
    public function toApiArray(): array
    {
        return [
            'id'          => $this->id,
            'name'        => $this->name,
            'username'    => '@' . $this->username,
            'email'       => $this->email,
            'phone'       => $this->phone,
            'has_pin'     => ! is_null($this->pin),
            'is_approved' => (bool) $this->is_approved,
        ];
    }

    /**
     * Satu user memiliki tepat satu dompet.
     * Dibuat setelah register: `$user->wallet()->create(['balance' => 0])`.
     */
    public function wallet(): HasOne
    {
        return $this->hasOne(Wallet::class);
    }

    /**
     * Semua transaksi yang berasal dari/ke user ini.
     * Termasuk TOPUP, TRANSFER_IN, dan TRANSFER_OUT.
     */
    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }
}
