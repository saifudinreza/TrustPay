<?php

namespace App\Services\Otp;

use App\Contracts\OtpChannel;
use Illuminate\Support\Facades\Mail;

class MailOtpChannel implements OtpChannel
{
    public function send(string $phone, string $code, string $purpose = 'login'): void
    {
        // $phone here is the user's email address when using this channel
        Mail::raw(
            "Halo!\n\nKode OTP TrustPay kamu: {$code}\n\nBerlaku 5 menit. Jangan bagikan kode ini ke siapa pun.",
            fn ($m) => $m->to($phone)->subject("Kode OTP TrustPay: {$code}")
        );
    }
}
