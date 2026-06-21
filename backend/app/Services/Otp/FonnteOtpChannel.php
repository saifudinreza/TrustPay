<?php

namespace App\Services\Otp;

use App\Contracts\OtpChannel;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

/**
 * WhatsApp delivery via Fonnte (https://fonnte.com) — a cheap Indonesian gateway.
 * Enable with OTP_CHANNEL=fonnte and FONNTE_TOKEN=<device token> in .env. The
 * target must be an international number without '+', e.g. 6281234567890 — which
 * is exactly what App\Support\Phone::normalize produces.
 */
class FonnteOtpChannel implements OtpChannel
{
    public function __construct(private readonly string $token) {}

    public function send(string $phone, string $code, string $purpose = 'login'): void
    {
        $message = "*{$code}* adalah kode verifikasi TrustPay kamu.\n"
            . "Berlaku 5 menit. Demi keamanan, jangan bagikan kode ini ke siapa pun.";

        $res = Http::asForm()
            ->timeout(20)
            ->withHeaders(['Authorization' => $this->token])
            ->post('https://api.fonnte.com/send', [
                'target'      => $phone,
                'message'     => $message,
                'countryCode' => '62',
            ]);

        // Fonnte returns 200 with {"status": false, "reason": "..."} on failure.
        $ok = $res->successful() && $res->json('status') !== false;

        if (! $ok) {
            $reason = $res->json('reason') ?? $res->body();
            Log::error("[OTP/fonnte] gagal kirim ke {$phone}: {$reason}");
            throw new RuntimeException('Gagal mengirim OTP via WhatsApp.');
        }
    }
}
