<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->string('code', 32)->unique();
            $table->uuid('transfer_code')->nullable()->index();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('counterpart_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('type', ['TOPUP', 'TRANSFER_IN', 'TRANSFER_OUT']);
            $table->decimal('amount', 15, 2);
            $table->decimal('balance_after', 15, 2);
            $table->string('description')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
