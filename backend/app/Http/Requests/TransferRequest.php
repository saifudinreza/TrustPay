<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * TransferRequest — validasi input endpoint POST /transfer.
 *
 * Field `recipient` menerima email, nomor HP, atau username — WalletService
 * yang menentukan user mana yang cocok (bukan validasi DB di sini).
 * Validasi DB (apakah penerima ada, apakah bukan diri sendiri) dilakukan di
 * WalletService karena butuh logika bisnis lebih dari sekadar rule validasi.
 */
class TransferRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $max = config('wallet.max_transaction_amount', 50_000_000);

        return [
            'recipient'   => ['required', 'string'],                               // email / nomor HP / username
            'amount'      => ['required', 'numeric', 'integer', 'min:1', "max:{$max}"],
            'description' => ['nullable', 'string', 'max:255'],                    // catatan opsional
        ];
    }

    public function messages(): array
    {
        return [
            'recipient.required' => 'Penerima wajib diisi.',
            'amount.required'    => 'Nominal tidak boleh kosong.',
            'amount.numeric'     => 'Nominal harus berupa angka.',
            'amount.integer'     => 'Nominal harus berupa bilangan bulat.',
            'amount.min'         => 'Nominal tidak boleh negatif.',
            'amount.max'         => 'Nominal melebihi batas maksimum transaksi.',
        ];
    }
}
