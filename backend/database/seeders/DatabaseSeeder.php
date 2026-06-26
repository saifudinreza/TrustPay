<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Voucher;
use App\Support\Phone;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $vouchers = [
            ['code' => 'WELCOME10',  'value' => 10000,  'description' => 'Voucher selamat datang Rp 10.000',  'max_uses' => 100, 'expires_at' => now()->addYear()],
            ['code' => 'RAMADHAN25', 'value' => 25000,  'description' => 'Voucher spesial Rp 25.000',          'max_uses' => 50,  'expires_at' => now()->addMonths(3)],
            ['code' => 'BONUS50',    'value' => 50000,  'description' => 'Voucher bonus Rp 50.000',             'max_uses' => 20,  'expires_at' => now()->addMonths(6)],
            ['code' => 'FREEBAL',    'value' => 15000,  'description' => 'Saldo gratis Rp 15.000',              'max_uses' => null, 'expires_at' => null],
        ];

        foreach ($vouchers as $v) {
            Voucher::updateOrCreate(
                ['code' => $v['code']],
                $v,
            );
        }
    }
}
