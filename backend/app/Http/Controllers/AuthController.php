<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Models\User;
use App\Services\OtpService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

/**
 * AuthController — autentikasi dengan Laravel Sanctum (token-based).
 *
 * Alur UTAMA (sesuai rubrik): register & login pakai email/username + password,
 * keduanya mengembalikan Sanctum token.
 * Alur BONUS: login tanpa password via OTP Email (requestLoginOtp + verifyOtp).
 *
 * OtpService di-inject lewat constructor (dependency injection) supaya controller
 * tidak tahu detail pengiriman OTP — implementasinya bisa diganti (log/mail/Fonnte).
 */
class AuthController extends Controller
{
    public function __construct(private readonly OtpService $otp) {}

    /**
     * REGISTER — buat user + wallet, lalu langsung kembalikan token.
     * RegisterRequest sudah memvalidasi input (email valid, password >= 8,
     * username unik) sebelum method ini dipanggil.
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        // validated() = hanya field yang lolos aturan validasi (aman dari mass-assignment).
        $data = $request->validated();

        $user = User::create([
            'name'     => $data['name'],
            'username' => $data['username'],
            'email'    => $data['email'],
            'phone'    => $data['phone'] ?? null,
            'password' => $data['password'], // otomatis di-hash oleh cast 'password' => 'hashed' di model User
        ]);

        // Relasi User hasOne Wallet — setiap user punya 1 dompet, saldo awal 0.
        $user->wallet()->create(['balance' => 0]);

        // createToken() = bikin Sanctum personal access token; plainTextToken hanya
        // tampil sekali (frontend menyimpannya untuk header Authorization: Bearer).
        $token = $user->createToken('api')->plainTextToken;

        return response()->json([
            'message' => 'Registrasi berhasil.',
            'token'   => $token,
            'user'    => $this->formatUser($user),
        ], 201); // 201 Created
    }

    /**
     * LOGIN — email/username + password. Mengembalikan token bila benar,
     * atau 401 Unauthorized bila kredensial salah (pesan disamakan demi keamanan
     * agar penyerang tidak tahu mana yang salah: email atau password).
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $login = trim($request->input('login'));

        // Cari user berdasarkan email ATAU username (boleh login pakai salah satu).
        $user = User::where('email', $login)
            ->orWhere('username', ltrim($login, '@'))
            ->first();

        // Hash::check membandingkan password polos dengan hash di DB (tahan timing attack).
        if (! $user || ! $user->password || ! Hash::check($request->input('password'), $user->password)) {
            return response()->json(['message' => 'Email/username atau password salah.'], 401);
        }

        $token = $user->createToken('api')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user'  => $this->formatUser($user),
        ]);
    }

    /**
     * (BONUS) Minta OTP login via Email. Hanya untuk email yang sudah terdaftar.
     */
    public function requestLoginOtp(Request $request): JsonResponse
    {
        $request->validate(
            ['email' => ['required', 'email']],
            ['email.required' => 'Email wajib diisi.'],
        );
        $email = strtolower(trim($request->input('email')));

        if (! User::where('email', $email)->exists()) {
            return response()->json(['message' => 'Email belum terdaftar.'], 404);
        }
        if ($wait = $this->otp->retryAfter($email)) {
            return $this->throttled($wait);
        }

        try {
            $code = $this->otp->send($email, 'login');
        } catch (\Throwable $e) {
            return $this->deliveryFailed();
        }

        return response()->json($this->sentPayload('Kode verifikasi dikirim ke email kamu.', $email, $code));
    }

    /**
     * (BONUS) Verifikasi OTP → kembalikan token.
     */
    public function verifyOtp(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
            'code'  => ['required', 'string', 'size:6'],
        ], [
            'code.size' => 'Kode OTP terdiri dari 6 digit.',
        ]);

        $email = strtolower(trim($request->input('email')));

        if (! $this->otp->verify($email, $request->input('code'))) {
            return response()->json(['message' => 'Kode OTP salah atau kedaluwarsa.'], 422);
        }

        $user = User::where('email', $email)->first();
        if (! $user) {
            return response()->json(['message' => 'Akun tidak ditemukan.'], 404);
        }

        $token = $user->createToken('api')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user'  => $this->formatUser($user),
        ]);
    }

    /**
     * LOGOUT — hapus token yang sedang dipakai (token lain tetap berlaku).
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logout berhasil.']);
    }

    /** Profil user yang sedang login (dipanggil saat refresh untuk validasi token). */
    public function me(Request $request): JsonResponse
    {
        return response()->json(['user' => $this->formatUser($request->user())]);
    }

    // ---- helper privat ----

    // Bentuk data user yang aman dikirim ke frontend (TANPA password/pin/token).
    // Delegasi ke User::toApiArray() supaya formatnya konsisten di semua controller.
    private function formatUser(User $user): array
    {
        return $user->toApiArray();
    }

    private function deliveryFailed(): JsonResponse
    {
        return response()->json(['message' => 'Gagal mengirim OTP. Coba lagi sebentar.'], 502);
    }

    private function throttled(int $wait): JsonResponse
    {
        return response()->json([
            'message'     => "Tunggu {$wait} detik sebelum meminta kode lagi.",
            'retry_after' => $wait,
        ], 429);
    }

    // dev_code hanya disertakan saat APP_ENV=local (tidak ada email nyata di dev).
    private function sentPayload(string $message, string $email, string $code): array
    {
        $payload = ['message' => $message, 'email' => $email];
        if (app()->environment('local')) {
            $payload['dev_code'] = $code;
        }

        return $payload;
    }
}
