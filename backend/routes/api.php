<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SocialAuthController;
use App\Http\Controllers\WalletController;
use Illuminate\Support\Facades\Route;

// ---- public auth ----
Route::post('/register', [AuthController::class, 'register']);           // utama: email/username + password → token
Route::post('/login',    [AuthController::class, 'login']);              // utama: email/username + password → token
// bonus: login via OTP WhatsApp (Fonnte)
Route::post('/login/request-otp', [AuthController::class, 'requestLoginOtp']); // phone → kirim OTP
Route::post('/verify-otp',        [AuthController::class, 'verifyOtp']);       // phone+code → token

// ---- Google OAuth (Socialite stateless) ----
Route::get('/auth/google/redirect',  [SocialAuthController::class, 'redirectToGoogle']);   // redirect ke Google
Route::get('/auth/google/callback',  [SocialAuthController::class, 'handleGoogleCallback']); // callback dari Google

// Midtrans Webhook
Route::post('/webhooks/midtrans', [\App\Http\Controllers\MidtransWebhookController::class, 'handleNotification']);

// ---- protected ----
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me',      [AuthController::class, 'me']);

    // profil & keamanan
    Route::put('/me',  [ProfileController::class, 'update']);  // edit nama/username/email/HP
    Route::post('/pin', [ProfileController::class, 'setPin']); // atur / ubah PIN transaksi

    Route::get('/wallet',       [WalletController::class, 'show']);
    Route::post('/topup',        [WalletController::class, 'topup']);
    Route::post('/topup/confirm',[WalletController::class, 'confirmTopUp']);
    Route::post('/transfer',     [WalletController::class, 'transfer']);
    Route::post('/pay',          [WalletController::class, 'pay']);
    Route::get('/transactions', [WalletController::class, 'transactions']);
    Route::get('/promos',       [WalletController::class, 'promos']);
    Route::post('/vouchers/redeem', [WalletController::class, 'redeemVoucher']);
});
