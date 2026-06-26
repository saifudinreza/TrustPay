<?php

namespace App\Http\Controllers;

use App\Support\Phone;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

/**
 * ProfileController — kelola data akun & PIN keamanan user yang sedang login.
 *
 * Semua route di sini dilindungi `auth:sanctum` (lihat routes/api.php), jadi
 * `$request->user()` selalu user yang valid dari Bearer token.
 */
class ProfileController extends Controller
{
    /**
     * PUT /me — perbarui profil (nama, username, email, nomor HP).
     * Username/email/phone tetap unik, tapi boleh sama dengan milik user sendiri
     * (Rule::unique(...)->ignore($user->id)).
     */
    public function update(Request $request): JsonResponse
    {
        $user = $request->user();

        // Normalkan nomor HP ke format 62... sebelum validasi unik
        if ($request->filled('phone')) {
            $request->merge(['phone' => Phone::normalize($request->input('phone'))]);
        }

        $data = $request->validate([
            'name'     => ['required', 'string', 'min:2', 'max:255'],
            'username' => ['required', 'string', 'min:3', 'max:30', 'regex:/^[a-z0-9_]+$/i', Rule::unique('users', 'username')->ignore($user->id)],
            'email'    => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'phone'    => ['nullable', 'string', 'min:9', 'max:20', Rule::unique('users', 'phone')->ignore($user->id)],
        ], [
            'name.required'     => 'Nama wajib diisi.',
            'name.min'          => 'Nama minimal 2 karakter.',
            'username.required' => 'Username wajib diisi.',
            'username.min'      => 'Username minimal 3 karakter.',
            'username.regex'    => 'Username hanya boleh huruf, angka, dan underscore.',
            'username.unique'   => 'Username sudah digunakan.',
            'email.required'    => 'Email wajib diisi.',
            'email.email'       => 'Format email tidak valid.',
            'email.unique'      => 'Email sudah terdaftar.',
            'phone.unique'      => 'Nomor HP sudah terdaftar.',
            'phone.min'         => 'Nomor HP tidak valid.',
        ]);

        $user->update([
            'name'     => $data['name'],
            'username' => ltrim($data['username'], '@'),
            'email'    => $data['email'],
            'phone'    => $data['phone'] ?? null,
        ]);

        return response()->json([
            'message' => 'Profil berhasil diperbarui.',
            'user'    => $user->fresh()->toApiArray(),
        ]);
    }

    /**
     * POST /pin — atur atau ubah PIN transaksi (6 digit).
     *
     * - Set pertama kali: cukup user terautentikasi + konfirmasi PIN.
     * - Mengubah PIN yang sudah ada: WAJIB menyertakan `current_pin` yang benar
     *   (lapisan keamanan agar token yang bocor tidak bisa langsung ganti PIN).
     */
    public function setPin(Request $request): JsonResponse
    {
        $user = $request->user();

        $data = $request->validate([
            'pin'         => ['required', 'string', 'digits:6', 'confirmed'],
            'current_pin' => ['nullable', 'string', 'digits:6'],
        ], [
            'pin.required'  => 'PIN wajib diisi.',
            'pin.digits'    => 'PIN harus 6 angka.',
            'pin.confirmed' => 'Konfirmasi PIN tidak cocok.',
        ]);

        $isFirstTime = is_null($user->pin);

        // Jika user sudah punya PIN, ubah hanya boleh dengan PIN lama yang benar.
        if (! $isFirstTime) {
            if (empty($data['current_pin']) || ! Hash::check($data['current_pin'], $user->pin)) {
                throw ValidationException::withMessages(['current_pin' => 'PIN lama salah.']);
            }
        }

        $user->update(['pin' => $data['pin']]); // cast 'hashed' meng-hash otomatis

        return response()->json([
            'message' => $isFirstTime ? 'PIN berhasil dibuat.' : 'PIN berhasil diubah.',
            'user'    => $user->fresh()->toApiArray(),
        ]);
    }
}
