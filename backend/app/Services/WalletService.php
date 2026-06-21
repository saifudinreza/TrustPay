<?php

namespace App\Services;

use App\Models\Transaction;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Midtrans\Config;
use Midtrans\Snap;

class WalletService
{
    // Top up: initialize transaction row + generate Midtrans Snap Token. Atomic via DB transaction.
    public function topUp(User $user, int $amount): array
    {
        return DB::transaction(function () use ($user, $amount) {
            $txCode = $this->generateCode();

            $tx = Transaction::create([
                'code'          => $txCode,
                'user_id'       => $user->id,
                'type'          => 'TOPUP',
                'status'        => 'PENDING',
                'amount'        => $amount,
                'balance_after' => null,
                'description'   => 'Top up saldo via Midtrans',
            ]);

            // Config Midtrans
            Config::$serverKey = config('midtrans.server_key');
            Config::$isProduction = config('midtrans.is_production');
            Config::$isSanitized = config('midtrans.is_sanitized');
            Config::$is3ds = config('midtrans.is_3ds');

            $params = [
                'transaction_details' => [
                    'order_id'     => $txCode,
                    'gross_amount' => (int) $amount,
                ],
                'customer_details' => [
                    'first_name' => $user->name,
                    'email'      => $user->email,
                    'phone'      => $user->phone ?? '',
                ],
            ];

            try {
                $midtransTx = Snap::createTransaction($params);
                $snapToken = $midtransTx->token;
                $redirectUrl = $midtransTx->redirect_url;
            } catch (\Exception $e) {
                throw new \DomainException('Gagal membuat transaksi ke Midtrans: ' . $e->getMessage(), 500);
            }

            return [
                'transaction'  => $tx,
                'snap_token'   => $snapToken,
                'redirect_url' => $redirectUrl,
            ];
        });
    }

    // Complete top up transaction: update status, and add balance if SUCCESS.
    public function completeTopUp(string $code, string $status): ?Transaction
    {
        return DB::transaction(function () use ($code, $status) {
            $tx = Transaction::where('code', $code)->lockForUpdate()->first();
            if (!$tx) {
                return null;
            }

            if ($tx->status !== 'PENDING') {
                return $tx;
            }

            if ($status === 'SUCCESS') {
                $tx->status = 'SUCCESS';

                $wallet = Wallet::where('user_id', $tx->user_id)->lockForUpdate()->first();
                $wallet->balance = bcadd((string) $wallet->balance, (string) $tx->amount, 2);
                $wallet->save();

                $tx->balance_after = $wallet->balance;
                $tx->save();
            } elseif ($status === 'FAILED') {
                $tx->status = 'FAILED';
                $tx->save();
            }

            return $tx;
        });
    }

    // Fetch payment status from Midtrans API directly and update database.
    public function checkAndUpdateStatus(string $code): array
    {
        return DB::transaction(function () use ($code) {
            $tx = Transaction::where('code', $code)->lockForUpdate()->first();
            if (!$tx) {
                throw new \DomainException('Transaksi tidak ditemukan.', 404);
            }

            $wallet = Wallet::where('user_id', $tx->user_id)->first();

            if ($tx->status !== 'PENDING') {
                return ['transaction' => $tx, 'wallet' => $wallet];
            }

            Config::$serverKey = config('midtrans.server_key');
            Config::$isProduction = config('midtrans.is_production');

            try {
                $statusResponse = \Midtrans\Transaction::status($code);
                $transactionStatus = $statusResponse->transaction_status;
                $fraudStatus = $statusResponse->fraud_status ?? '';

                $status = 'PENDING';
                if ($transactionStatus === 'settlement') {
                    $status = 'SUCCESS';
                } elseif ($transactionStatus === 'capture') {
                    if ($fraudStatus === 'challenge') {
                        $status = 'PENDING';
                    } elseif ($fraudStatus === 'accept') {
                        $status = 'SUCCESS';
                    }
                } elseif (in_array($transactionStatus, ['deny', 'expire', 'cancel'])) {
                    $status = 'FAILED';
                }

                if ($status !== 'PENDING') {
                    $tx = $this->completeTopUp($code, $status);
                    $wallet = Wallet::where('user_id', $tx->user_id)->first();
                }
            } catch (\Exception $e) {
                // If checking fails, just leave it pending
            }

            return ['transaction' => $tx, 'wallet' => $wallet];
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
