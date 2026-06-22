<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Modifikasi tabel users agar mendukung login tanpa password (bonus OTP WhatsApp).
 *
 * Mengapa password nullable?
 * User yang mendaftar via OTP tidak menyetel password. Kolom tetap ada agar
 * user yang mendaftar via email+password tetap kompatibel — keduanya bisa hidup
 * berdampingan dalam tabel yang sama.
 *
 * phone_verified_at ditambahkan untuk kemungkinan verifikasi nomor HP di masa depan
 * (saat ini tidak dipakai untuk gating akses, hanya disimpan).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('password')->nullable()->change(); // nullable = user OTP tidak perlu password
            $table->timestamp('phone_verified_at')->nullable()->after('email_verified_at');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('phone_verified_at');
            $table->string('password')->nullable(false)->change(); // rollback: password wajib lagi
        });
    }
};
