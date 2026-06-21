<?php

namespace Database\Seeders;

use App\Models\User;
use App\Support\Phone;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    // Akun demo (juga jadi DIRECTORY penerima transfer di frontend: @budi, @siti, …)
    // plus user utama @aldi. Semua punya password yang sama untuk memudahkan
    // pengujian login: PASSWORD = "password123". Bisa juga login via OTP WhatsApp.
    public function run(): void
    {
        $users = [
            ['name' => 'Aldi P.',     'username' => 'aldi', 'email' => 'demo@trustpay.id', 'phone' => '0812-3344-4021', 'balance' => 2_450_000],
            ['name' => 'Budi S.',     'username' => 'budi', 'email' => 'budi@trustpay.id', 'phone' => '0811-2233-0001', 'balance' => 500_000],
            ['name' => 'Siti A.',     'username' => 'siti', 'email' => 'siti@trustpay.id', 'phone' => '0811-2233-0002', 'balance' => 750_000],
            ['name' => 'Saifudin R.', 'username' => 'reza', 'email' => 'reza@trustpay.id', 'phone' => '0811-2233-0003', 'balance' => 1_200_000],
            ['name' => 'Dewi K.',     'username' => 'dewi', 'email' => 'dewi@trustpay.id', 'phone' => '0811-2233-0004', 'balance' => 300_000],
            ['name' => 'Rina W.',     'username' => 'rina', 'email' => 'rina@trustpay.id', 'phone' => '0811-2233-0005', 'balance' => 950_000],
        ];

        foreach ($users as $data) {
            $user = User::updateOrCreate(
                ['email' => $data['email']],
                [
                    'name'              => $data['name'],
                    'username'          => $data['username'],
                    'phone'             => Phone::normalize($data['phone']),
                    'password'          => Hash::make('password123'),
                    'phone_verified_at' => now(),
                ],
            );
            $user->wallet()->updateOrCreate(
                ['user_id' => $user->id],
                ['balance' => $data['balance']],
            );
        }
    }
}
