<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * TopUpRequest — validasi input endpoint POST /topup.
 *
 * Limit maksimum transaksi dibaca dari config/wallet.php supaya bisa diubah
 * tanpa mengubah kode (hanya ubah file config atau .env).
 * Jika validasi gagal, Laravel otomatis balas HTTP 422 + daftar error.
 */
class TopUpRequest extends FormRequest
{
    // Semua user yang sudah login (auth:sanctum) boleh melakukan top up.
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // Batas maks diambil dari config/wallet.php (default 50 juta jika belum diset)
        $max = config('wallet.max_transaction_amount', 50_000_000);

        return [
            // 'integer' memastikan tidak ada desimal (Rp tidak mengenal sen)
            'amount' => ['required', 'numeric', 'integer', 'min:1', "max:{$max}"],
        ];
    }

    // Pesan error dalam Bahasa Indonesia — ditampilkan langsung di frontend.
    public function messages(): array
    {
        return [
            'amount.required' => 'Nominal tidak boleh kosong.',
            'amount.numeric'  => 'Nominal harus berupa angka.',
            'amount.integer'  => 'Nominal harus berupa bilangan bulat.',
            'amount.min'      => 'Nominal tidak boleh negatif.',
            'amount.max'      => 'Nominal melebihi batas maksimum transaksi.',
        ];
    }
}
