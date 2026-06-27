<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Laravel\Socialite\Facades\Socialite;

/**
 * SocialAuthController — login / register via Google OAuth (Laravel Socialite).
 *
 * Alur:
 *  1. Frontend redirect ke GET /api/auth/google/redirect
 *  2. Backend (Socialite stateless) redirect ke accounts.google.com
 *  3. User login di Google → Google redirect ke GET /api/auth/google/callback
 *  4. Backend ambil data Google, cari/buat user + wallet, buat Sanctum token
 *  5. Backend redirect ke {FRONTEND_URL}/auth/callback?token=xxx&user=yyy
 *  6. Frontend baca param, simpan sesi, masuk Dashboard
 *
 * Stateless: tidak membutuhkan session server (aman untuk deployment multi-instance
 * di Railway / Vercel). Google OAuth state dikelola via parameter URL saja.
 */
class SocialAuthController extends Controller
{
    /** Redirect user ke halaman consent Google. */
    public function redirectToGoogle(): RedirectResponse
    {
        return Socialite::driver('google')->stateless()->redirect();
    }

    /** Handle callback dari Google setelah user mengizinkan akses. */
    public function handleGoogleCallback(): RedirectResponse
    {
        $frontendUrl = rtrim(env('FRONTEND_URL', 'http://localhost:5173'), '/');

        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
        } catch (\Throwable) {
            return redirect("{$frontendUrl}/masuk?error=google_gagal");
        }

        // Cari user: coba cocokkan via google_id dulu, fallback ke email.
        $user = User::where('google_id', $googleUser->getId())
            ->orWhere('email', $googleUser->getEmail())
            ->first();

        $isNewUser = false;

        if ($user) {
            // Tautkan google_id jika user lama belum punya (daftar via email dulu).
            if (! $user->google_id) {
                $user->update(['google_id' => $googleUser->getId()]);
            }
        } else {
            // Buat akun baru dari data Google — mulai sebagai pending, butuh persetujuan admin.
            $isNewUser = true;
            $user = User::create([
                'name'        => $googleUser->getName() ?: 'Pengguna Google',
                'username'    => $this->uniqueUsername($googleUser->getEmail(), $googleUser->getName()),
                'email'       => $googleUser->getEmail(),
                'google_id'   => $googleUser->getId(),
                'password'    => null,
                'is_approved' => false,
            ]);

            // Buat wallet awal saldo 0 (aktif setelah disetujui admin).
            $user->wallet()->create(['balance' => 0]);
        }

        // Blokir akun Google yang belum disetujui admin.
        if (! $user->is_approved) {
            return redirect("{$frontendUrl}/menunggu?email=" . urlencode($user->email));
        }

        $token = $user->createToken('api-google')->plainTextToken;

        $userData = urlencode(json_encode($user->toApiArray()));

        return redirect("{$frontendUrl}/auth/callback?token={$token}&user={$userData}");
    }

    /**
     * Buat username unik dari email Google.
     * Contoh: "reza.pratama@gmail.com" → "rezapratama" → "rezapratama2" jika sudah ada.
     */
    private function uniqueUsername(string $email, ?string $name): string
    {
        // Ambil bagian sebelum @ dari email, hapus karakter non-alphanumeric.
        $base = strtolower(preg_replace('/[^a-z0-9_]/i', '', explode('@', $email)[0]));

        // Fallback ke nama jika base kosong.
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
