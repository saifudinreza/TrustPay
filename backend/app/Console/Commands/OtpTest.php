<?php

namespace App\Console\Commands;

use App\Contracts\OtpChannel;
use App\Support\Phone;
use Illuminate\Console\Command;

/**
 * Quick check that the configured OTP channel can deliver a message.
 * Usage: php artisan otp:test 0812-3456-7890
 */
class OtpTest extends Command
{
    protected $signature = 'otp:test {phone : Nomor HP tujuan (08xx / +62 / 62)}';

    protected $description = 'Kirim kode OTP percobaan lewat channel yang aktif (log/fonnte)';

    public function handle(OtpChannel $channel): int
    {
        $phone = Phone::normalize($this->argument('phone'));
        $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        $this->info('Channel aktif : ' . config('services.otp.channel', 'log'));
        $this->info('Target        : ' . $phone);

        try {
            $channel->send($phone, $code, 'test');
        } catch (\Throwable $e) {
            $this->error('GAGAL: ' . $e->getMessage());

            return self::FAILURE;
        }

        $this->info('Terkirim ✓ (kode percobaan: ' . $code . ')');

        return self::SUCCESS;
    }
}
