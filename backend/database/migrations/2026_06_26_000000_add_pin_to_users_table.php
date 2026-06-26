<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tambah kolom `pin` ke tabel users.
 *
 * PIN = 6 digit untuk mengotorisasi transaksi keluar (transfer & pembayaran).
 * Disimpan dalam bentuk hash (cast 'hashed' di model User) — tidak pernah plaintext.
 * Nullable: user yang belum mengatur PIN tidak bisa bertransaksi sampai PIN dibuat.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('pin')->nullable()->after('password');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('pin');
        });
    }
};
