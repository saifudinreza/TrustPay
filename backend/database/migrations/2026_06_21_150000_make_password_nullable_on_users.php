<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Passwordless auth: accounts log in via phone + OTP, so password is optional.
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('password')->nullable()->change();
            $table->timestamp('phone_verified_at')->nullable()->after('email_verified_at');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('phone_verified_at');
            $table->string('password')->nullable(false)->change();
        });
    }
};
