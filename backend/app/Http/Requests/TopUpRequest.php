<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TopUpRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $max = config('wallet.max_transaction_amount', 50_000_000);

        return [
            'amount' => ['required', 'numeric', 'integer', 'min:1', "max:{$max}"],
        ];
    }

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
