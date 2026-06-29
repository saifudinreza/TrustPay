<?php

namespace App\Providers;

use App\Contracts\OtpChannel;
use App\Services\Otp\FonnteOtpChannel;
use App\Services\Otp\LogOtpChannel;
use App\Services\Otp\MailOtpChannel;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Pick the OTP delivery channel from config. Add new providers (Twilio,
        // WhatsApp Cloud API, …) by implementing OtpChannel and adding a case here.
        $this->app->bind(OtpChannel::class, function () {
            $channel = config('services.otp.channel', 'log');
            $fonnteToken = config('services.otp.fonnte.token');

            // Fonnte (WhatsApp) — but fall back to the log channel if no token is
            // configured yet, so the app never breaks while you're setting it up.
            if ($channel === 'mail') {
                return new MailOtpChannel();
            }

            if ($channel === 'fonnte' && $fonnteToken) {
                return new FonnteOtpChannel($fonnteToken);
            }

            return new LogOtpChannel();
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
