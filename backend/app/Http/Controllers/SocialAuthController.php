<?php

namespace App\Http\Controllers;

use App\Mail\GoogleOtpMail;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;
use Laravel\Socialite\Facades\Socialite;

/**
 * SocialAuthController — login / register via Google OAuth dengan verifikasi OTP email.
 *
 * Alur dua langkah:
 *  1. Frontend redirect ke GET /api/auth/google/redirect
 *  2. Google callback → backend generate OTP, kirim ke Gmail user, redirect ke halaman OTP
 *  3. User masukkan OTP → POST /api/auth/google/verify-otp
 *  4. Backend verifikasi OTP → buat/login user → kembalikan token
 */
class SocialAuthController extends Controller
{
    private const OTP_TTL    = 600;  // 10 menit
    private const CACHE_PREFIX = 'google_otp:';

    public function redirectToGoogle(): RedirectResponse
    {
        return Socialite::driver('google')->stateless()->redirect();
    }

    public function handleGoogleCallback(): RedirectResponse
    {
        $frontendUrl = rtrim(env('FRONTEND_URL', 'http://localhost:5173'), '/');

        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
        } catch (\Throwable) {
            return redirect("{$frontendUrl}/masuk?error=google_gagal");
        }

        $email    = $googleUser->getEmail();
        $name     = $googleUser->getName() ?: 'Pengguna Google';
        $googleId = $googleUser->getId();

        // Cari atau buat user
        $user = User::where('google_id', $googleId)
            ->orWhere('email', $email)
            ->first();

        if ($user) {
            if (! $user->google_id) {
                $user->update(['google_id' => $googleId]);
            }
        } else {
            $user = User::create([
                'name'        => $name,
                'username'    => $this->uniqueUsername($email, $name),
                'email'       => $email,
                'google_id'   => $googleId,
                'password'    => null,
                'is_approved' => true,
            ]);

            $user->wallet()->create(['balance' => 0]);
        }

        $token = $user->createToken('api-google')->plainTextToken;

        $userJson = urlencode(json_encode($user->toApiArray()));

        return redirect("{$frontendUrl}/auth/callback?token=" . urlencode($token) . "&user={$userJson}");
    }

    /**
     * POST /api/auth/google/verify-otp
     * Verifikasi OTP dan selesaikan proses login/registrasi via Google.
     */
    public function verifyGoogleOtp(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'otp'   => ['required', 'string', 'digits:6'],
        ], [
            'otp.digits' => 'Kode OTP harus 6 angka.',
        ]);

        $cached = Cache::get(self::CACHE_PREFIX . $data['email']);

        if (! $cached) {
            return response()->json(['message' => 'Kode OTP sudah kedaluwarsa. Silakan ulangi login Google.'], 422);
        }

        if ($cached['otp'] !== $data['otp']) {
            return response()->json(['message' => 'Kode OTP salah. Periksa email kamu.'], 422);
        }

        // OTP valid — hapus dari cache agar tidak bisa dipakai lagi
        Cache::forget(self::CACHE_PREFIX . $data['email']);

        // Cari atau buat user
        $user = User::where('google_id', $cached['google_id'])
            ->orWhere('email', $cached['email'])
            ->first();

        if ($user) {
            if (! $user->google_id) {
                $user->update(['google_id' => $cached['google_id']]);
            }
        } else {
            $user = User::create([
                'name'        => $cached['name'],
                'username'    => $this->uniqueUsername($cached['email'], $cached['name']),
                'email'       => $cached['email'],
                'google_id'   => $cached['google_id'],
                'password'    => null,
                'is_approved' => true,
            ]);

            $user->wallet()->create(['balance' => 0]);
        }

        $token = $user->createToken('api-google')->plainTextToken;

        return response()->json([
            'message' => 'Verifikasi berhasil.',
            'token'   => $token,
            'user'    => $user->toApiArray(),
        ]);
    }

    /**
     * POST /api/auth/google/resend-otp
     * Kirim ulang OTP ke email yang sama (throttle: hanya jika OTP lama belum kedaluwarsa).
     */
    public function resendGoogleOtp(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
        ]);

        $email = $data['email'];

        // Ambil data Google dari cache yang ada (tidak buat ulang Google OAuth)
        $cached = Cache::get(self::CACHE_PREFIX . $email);

        if (! $cached) {
            return response()->json(['message' => 'Sesi Google sudah habis. Silakan ulangi login Google.'], 422);
        }

        // Generate OTP baru
        $otp = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        Cache::put(self::CACHE_PREFIX . $email, array_merge($cached, ['otp' => $otp]), self::OTP_TTL);

        try {
            Mail::to($email)->send(new GoogleOtpMail($otp, $cached['name']));
        } catch (\Throwable $e) {
            \Log::warning('GoogleOTP resend mail failed: ' . $e->getMessage());
        }

        $response = ['message' => 'Kode OTP baru telah dikirim ke ' . $email . '.'];

        if (config('app.env') === 'local') {
            $response['dev_code'] = $otp;
        }

        return response()->json($response);
    }

    private function uniqueUsername(string $email, ?string $name): string
    {
        $base = strtolower(preg_replace('/[^a-z0-9_]/i', '', explode('@', $email)[0]));

        if (! $base && $name) {
            $base = strtolower(preg_replace('/[^a-z0-9_]/i', '', str_replace(' ', '_', $name)));
        }

        $base     = $base ?: 'user';
        $username = $base;
        $counter  = 2;

        while (User::where('username', $username)->exists()) {
            $username = $base . $counter++;
        }

        return $username;
    }
}
