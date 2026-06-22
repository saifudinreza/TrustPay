<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tabel transactions — ledger append-only, satu baris per peristiwa keuangan.
 *
 * Filosofi: tidak ada update saldo di sini; tiap mutasi menghasilkan baris baru
 * dengan balance_after yang tercatat permanen. Ini membuat riwayat self-explanatory
 * dan audit-ready (mirip buku tabungan bank).
 *
 * Transfer menghasilkan DUA baris: TRANSFER_OUT (pengirim) + TRANSFER_IN (penerima),
 * diikat oleh transfer_code (UUID) sehingga bisa ditelusuri sebagai satu peristiwa.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->string('code', 32)->unique();               // kode human-readable, mis. TRX-20260621-AB1234
            $table->uuid('transfer_code')->nullable()->index(); // pengikat pasangan TRANSFER_OUT ↔ TRANSFER_IN

            // user_id = pemilik baris; counterpart = lawan transaksi (null untuk TOPUP)
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('counterpart_user_id')->nullable()->constrained('users')->nullOnDelete();

            $table->enum('type', ['TOPUP', 'TRANSFER_IN', 'TRANSFER_OUT']);
            $table->enum('status', ['PENDING', 'SUCCESS', 'FAILED'])->default('SUCCESS');

            $table->decimal('amount', 15, 2);           // selalu positif; tanda dari tipe
            $table->decimal('balance_after', 15, 2)->nullable(); // null selama TOPUP masih PENDING

            $table->string('description')->nullable();  // catatan opsional dari user
            $table->timestamps();

            // Index gabungan: kueri riwayat per user diurutkan waktu (SELECT ... WHERE user_id = ? ORDER BY created_at DESC)
            $table->index(['user_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
