<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class GoogleOtpMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly string $otp,
        public readonly string $name,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '[TrustPay] Kode Verifikasi Google Anda',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'mail.google-otp',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
