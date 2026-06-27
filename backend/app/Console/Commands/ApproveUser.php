<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('user:approve {email : Email akun Google yang akan disetujui}')]
#[Description('Setujui akun Google yang sedang menunggu verifikasi')]
class ApproveUser extends Command
{
    public function handle(): int
    {
        $email = $this->argument('email');

        $user = User::where('email', $email)->first();

        if (! $user) {
            $this->error("User dengan email '{$email}' tidak ditemukan.");
            return self::FAILURE;
        }

        if ($user->is_approved) {
            $this->info("User '{$email}' sudah disetujui sebelumnya.");
            return self::SUCCESS;
        }

        $user->update(['is_approved' => true]);

        $this->info("✓ Akun '{$user->name}' ({$email}) berhasil disetujui.");
        $this->line("  User sekarang bisa login menggunakan Google.");

        return self::SUCCESS;
    }
}
