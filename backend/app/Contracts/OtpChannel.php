<?php

namespace App\Contracts;

/**
 * A delivery channel for OTP codes. Swap the implementation (Log / Fonnte /
 * Twilio / WhatsApp Cloud API) via config('services.otp.channel') — the auth
 * flow never changes.
 */
interface OtpChannel
{
    /**
     * Deliver $code to $phone (normalized "62..." form).
     *
     * @param  string  $purpose  'register' | 'login' (for message wording/logging)
     */
    public function send(string $phone, string $code, string $purpose = 'login'): void;
}
