<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            [
                'name'     => 'Saifudin Reza',
                'username' => 'donoj',
                'email'    => 'donojomi@gmail.com',
                'password' => 'password123',
                'balance'  => 500000,
            ],
            [
                'name'     => 'Demo User',
                'username' => 'demo',
                'email'    => 'demo@trustpay.id',
                'password' => 'password123',
                'balance'  => 250000,
            ],
        ];

        foreach ($users as $data) {
            $balance = $data['balance'];
            unset($data['balance']);

            $user = User::firstOrCreate(['email' => $data['email']], $data);

            if (! $user->wallet) {
                $user->wallet()->create(['balance' => $balance]);
            }
        }
    }
}
