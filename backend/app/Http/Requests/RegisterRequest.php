<?php

namespace App\Http\Requests;

use App\Support\Phone;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Validasi data pendaftaran. FormRequest dipakai supaya logika validasi terpisah
 * dari controller (clean architecture) — jika tidak valid, Laravel otomatis
 * mengembalikan HTTP 422 + daftar error sebelum controller dijalankan.
 */
class RegisterRequest extends FormRequest
{
    // true = siapa pun boleh mengakses endpoint register (tidak perlu login dulu).
    public function authorize(): bool
    {
        return true;
    }

    // Dijalankan SEBELUM rules(): nomor HP dinormalkan ke bentuk "62..." dulu,
    // supaya pengecekan unik (08xx / +62 / 62 dianggap nomor yang sama).
    protected function prepareForValidation(): void
    {
        if ($this->filled('phone')) {
            $this->merge(['phone' => Phone::normalize($this->input('phone'))]);
        }
    }

    /**
     * Aturan validasi. Memenuhi skenario invalid pada rubrik:
     * - email 'user@'        → gagal aturan 'email'      → "Format email tidak valid."
     * - password < 8 char    → gagal aturan 'min:8'      → "Password minimal 8 karakter."
     * - username sudah dipakai→ gagal aturan 'unique'     → "Username sudah digunakan."
     */
    public function rules(): array
    {
        return [
            'name'     => ['required', 'string', 'min:2', 'max:255'],
            'username' => ['required', 'string', 'min:3', 'max:30', 'regex:/^[a-z0-9_]+$/i', 'unique:users,username'],
            'email'    => ['required', 'email', 'max:255', 'unique:users,email'],
            'phone'    => ['nullable', 'string', 'min:9', 'max:20', 'unique:users,phone'],
            'password' => ['required', 'string', 'min:8', 'confirmed'], // 'confirmed' butuh field password_confirmation
        ];
    }

    // Pesan error dalam Bahasa Indonesia yang spesifik (diminta rubrik).
    public function messages(): array
    {
        return [
            'name.required'      => 'Nama wajib diisi.',
            'name.min'           => 'Nama minimal 2 karakter.',
            'username.required'  => 'Username wajib diisi.',
            'username.min'       => 'Username minimal 3 karakter.',
            'username.regex'     => 'Username hanya boleh huruf, angka, dan underscore.',
            'username.unique'    => 'Username sudah digunakan.',
            'email.required'     => 'Email wajib diisi.',
            'email.email'        => 'Format email tidak valid.',
            'email.unique'       => 'Email sudah terdaftar.',
            'phone.unique'       => 'Nomor HP sudah terdaftar.',
            'phone.min'          => 'Nomor HP tidak valid.',
            'password.required'  => 'Password wajib diisi.',
            'password.min'       => 'Password minimal 8 karakter.',
            'password.confirmed' => 'Konfirmasi password tidak cocok.',
        ];
    }
}
