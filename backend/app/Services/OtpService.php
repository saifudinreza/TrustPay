<?php

namespace App\Services;

use App\Contracts\OtpChannel;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;

/**
 * Generates, stores, throttles and verifies one-time codes. The code itself is
 * stored hashed in the cache with a short TTL — never in plaintext, never in the
 * database. Delivery is delegated to the configured OtpChannel.
 */
class OtpService
{
    private const TTL = 300;          // code valid for 5 minutes
    private const RESEND_WAIT = 45;   // min seconds between sends to one number
    private const MAX_ATTEMPTS = 5;   // wrong-code attempts before invalidation

    public function __construct(private readonly OtpChannel $channel) {}

    /** Seconds the caller must wait before requesting another code (0 = ok now). */
    public function retryAfter(string $phone): int
    {
        $until = Cache::get($this->throttleKey($phone));

        return $until ? max(0, $until - now()->timestamp) : 0;
    }

    /** Generate + deliver + store a code. Returns the plaintext code (for dev display). */
    public function send(string $phone, string $purpose = 'login'): string
    {
        $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        // Deliver first — if the channel throws (e.g. WhatsApp send failed), we
        // don't store the code or set the throttle, so the user can retry at once.
        $this->channel->send($phone, $code, $purpose);

        Cache::put($this->codeKey($phone), ['hash' => Hash::make($code), 'attempts' => 0], self::TTL);
        Cache::put($this->throttleKey($phone), now()->timestamp + self::RESEND_WAIT, self::RESEND_WAIT);

        return $code;
    }

    /** True if $code matches the stored code; consumes it on success. */
    public function verify(string $phone, string $code): bool
    {
        $rec = Cache::get($this->codeKey($phone));
        if (! $rec) {
            return false;
        }
        if ($rec['attempts'] >= self::MAX_ATTEMPTS) {
            Cache::forget($this->codeKey($phone));

            return false;
        }
        if (Hash::check($code, $rec['hash'])) {
            Cache::forget($this->codeKey($phone));

            return true;
        }

        $rec['attempts']++;
        Cache::put($this->codeKey($phone), $rec, self::TTL);

        return false;
    }

    private function codeKey(string $phone): string
    {
        return "otp:code:{$phone}";
    }

    private function throttleKey(string $phone): string
    {
        return "otp:throttle:{$phone}";
    }
}
