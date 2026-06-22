<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tabel wallets — satu baris per user, berisi saldo saat ini.
 *
 * Desain sengaja sederhana: saldo disimpan sebagai satu kolom decimal
 * dan diupdate atomik via DB transaction + lockForUpdate di WalletService.
 * Riwayat lengkap ada di tabel transactions (ledger).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('wallets', function (Blueprint $table) {
            $table->id();
            // user_id unique: tepat 1 wallet per user; cascade delete agar bersih
            $table->foreignId('user_id')->constrained()->cascadeOnDelete()->unique();
            // decimal(15,2) cukup menampung ratusan miliar Rupiah dengan presisi sen
            $table->decimal('balance', 15, 2)->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wallets');
    }
};
