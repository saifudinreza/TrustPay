<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Validasi input login. Field 'login' menerima email ATAU username, ditambah
 * password. Validasi gagal → HTTP 422 otomatis (sebelum controller jalan).
 */
class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'login'    => ['required', 'string'], // email atau username
            'password' => ['required', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'login.required'    => 'Email atau username wajib diisi.',
            'password.required' => 'Password wajib diisi.',
        ];
    }
}
