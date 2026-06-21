<?php

namespace App\Services;

use App\Models\Transaction;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class WalletService
{
    // Top up: add balance + record transaction row. Atomic via DB transaction.
    public function topUp(User $user, int $amount): array
    {
        return DB::transaction(function () use ($user, $amount) {
            $wallet = $user->wallet;
            $wallet->balance = bcadd((string) $wallet->balance, (string) $amount, 2);
            $wallet->save();

            $tx = Transaction::create([
                'code'        => $this->generateCode(),
                'user_id'     => $user->id,
                'type'        => 'TOPUP',
                'amount'      => $amount,
                'balance_after' => $wallet->balance,
                'description' => 'Top up saldo',
            ]);

            return ['wallet' => $wallet, 'transaction' => $tx];
        });
    }

    // Transfer: atomic debit+credit with lockForUpdate to prevent race conditions.
    public function transfer(User $sender, string $recipientIdentifier, int $amount, ?string $description): array
    {
        return DB::transaction(function () use ($sender, $recipientIdentifier, $amount, $description) {
            $clean = ltrim(trim($recipientIdentifier), '@');
            $recipient = User::where('email', $recipientIdentifier)
                ->orWhere('phone', $recipientIdentifier)
                ->orWhere('username', $clean)
                ->first();

            if (! $recipient) {
                throw new \DomainException('Penerima tidak ditemukan.', 422);
            }
            if ($recipient->id === $sender->id) {
                throw new \DomainException('Tidak dapat transfer ke diri sendiri.', 422);
            }

            // Lock sender's wallet row to prevent concurrent balance modification.
            $senderWallet = Wallet::where('user_id', $sender->id)->lockForUpdate()->first();

            if (bccomp((string) $senderWallet->balance, (string) $amount, 2) < 0) {
                throw new \DomainException('Saldo tidak cukup.', 400);
            }

            $transferCode = Str::uuid()->toString();

            // Debit sender
            $senderWallet->balance = bcsub((string) $senderWallet->balance, (string) $amount, 2);
            $senderWallet->save();

            $senderTx = Transaction::create([
                'code'                => $this->generateCode(),
                'transfer_code'       => $transferCode,
                'user_id'             => $sender->id,
                'counterpart_user_id' => $recipient->id,
                'type'                => 'TRANSFER_OUT',
                'amount'              => $amount,
                'balance_after'       => $senderWallet->balance,
                'description'         => $description,
            ]);

            // Credit recipient
            $recipientWallet = Wallet::where('user_id', $recipient->id)->first();
            $recipientWallet->balance = bcadd((string) $recipientWallet->balance, (string) $amount, 2);
            $recipientWallet->save();

            Transaction::create([
                'code'                => $this->generateCode(),
                'transfer_code'       => $transferCode,
                'user_id'             => $recipient->id,
                'counterpart_user_id' => $sender->id,
                'type'                => 'TRANSFER_IN',
                'amount'              => $amount,
                'balance_after'       => $recipientWallet->balance,
                'description'         => $description,
            ]);

            return [
                'wallet'      => $senderWallet,
                'transaction' => $senderTx->load('counterpartUser'),
            ];
        });
    }

    private function generateCode(): string
    {
        return 'TRX-' . now()->format('Ymd') . '-' . strtoupper(Str::random(6));
    }
}
