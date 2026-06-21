<?php

namespace App\Services\Otp;

use App\Contracts\OtpChannel;
use Illuminate\Support\Facades\Log;

/**
 * Dev channel: writes the OTP to the application log instead of sending it.
 * In APP_ENV=local the controller also returns the code in the API response,
 * so you can build and test the whole flow without paying a provider.
 */
class LogOtpChannel implements OtpChannel
{
    public function send(string $phone, string $code, string $purpose = 'login'): void
    {
        Log::info("[OTP/{$purpose}] kode untuk {$phone} adalah: {$code}");
    }
}
