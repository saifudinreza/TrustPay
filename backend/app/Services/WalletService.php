<?php

namespace App\Services;

use App\Models\Transaction;
use App\Models\User;
use App\Models\Voucher;
use App\Models\Wallet;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Midtrans\Config;
use Midtrans\Snap;

class WalletService
{
    // Top up: support direct mode (tanpa Midtrans) dan normal (via Midtrans Snap).
    public function topUp(User $user, int $amount): array
    {
        if (config('wallet.direct_topup_enabled')) {
            return $this->directTopUp($user, $amount);
        }

        return $this->midtransTopUp($user, $amount);
    }

    // Direct top up: langsung tambah saldo tanpa payment gateway (untuk demo).
    private function directTopUp(User $user, int $amount): array
    {
        return DB::transaction(function () use ($user, $amount) {
            $wallet = Wallet::where('user_id', $user->id)->lockForUpdate()->first();
            $wallet->balance = bcadd((string) $wallet->balance, (string) $amount, 2);
            $wallet->save();

            $tx = Transaction::create([
                'code'          => $this->generateCode(),
                'user_id'       => $user->id,
                'type'          => 'TOPUP',
                'status'        => 'SUCCESS',
                'amount'        => $amount,
                'balance_after' => $wallet->balance,
                'description'   => 'Top up saldo',
            ]);

            return [
                'transaction'  => $tx,
                'snap_token'   => null,
                'redirect_url' => null,
                'direct'       => true,
                'wallet'       => $wallet,
            ];
        });
    }

    // Midtrans top up: buat transaksi PENDING + Snap token.
    private function midtransTopUp(User $user, int $amount): array
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
                'direct'       => false,
            ];
        });
    }

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

    // Transfer: atomic debit+credit with lockForUpdate.
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

            $senderWallet = Wallet::where('user_id', $sender->id)->lockForUpdate()->first();

            if (bccomp((string) $senderWallet->balance, (string) $amount, 2) < 0) {
                throw new \DomainException('Saldo tidak cukup.', 400);
            }

            $transferCode = Str::uuid()->toString();

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

            // Apply cashback for sender if eligible
            $this->applyCashback($sender, $amount, 'transfer');

            return [
                'wallet'      => $senderWallet,
                'transaction' => $senderTx->load('counterpartUser'),
            ];
        });
    }

    // Redeem voucher: tambah saldo user, catat transaksi, tandai sudah dipakai.
    public function redeemVoucher(User $user, Voucher $voucher): array
    {
        return DB::transaction(function () use ($user, $voucher) {
            $wallet = Wallet::where('user_id', $user->id)->lockForUpdate()->first();
            $amount = (int) $voucher->value;
            $wallet->balance = bcadd((string) $wallet->balance, (string) $amount, 2);
            $wallet->save();

            $tx = Transaction::create([
                'code'          => $this->generateCode(),
                'user_id'       => $user->id,
                'type'          => 'TOPUP',
                'status'        => 'SUCCESS',
                'amount'        => $amount,
                'balance_after' => $wallet->balance,
                'description'   => 'Redeem voucher: ' . $voucher->code . ' — ' . $voucher->description,
            ]);

            $voucher->users()->attach($user->id, ['used_at' => now()]);

            return ['wallet' => $wallet, 'transaction' => $tx];
        });
    }

    // Pembayaran tagihan: potong saldo, catat TRANSFER_OUT, lalu cek cashback.
    public function pay(User $user, int $amount, string $description): array
    {
        return DB::transaction(function () use ($user, $amount, $description) {
            $wallet = Wallet::where('user_id', $user->id)->lockForUpdate()->firstOrFail();

            if (bccomp((string) $wallet->balance, (string) $amount, 2) < 0) {
                throw new \DomainException('Saldo tidak cukup.', 400);
            }

            $wallet->balance = bcsub((string) $wallet->balance, (string) $amount, 2);
            $wallet->save();

            $tx = Transaction::create([
                'code'          => $this->generateCode(),
                'user_id'       => $user->id,
                'type'          => 'TRANSFER_OUT',
                'status'        => 'SUCCESS',
                'amount'        => $amount,
                'balance_after' => $wallet->balance,
                'description'   => $description,
            ]);

            // Apply cashback for payment if eligible
            $this->applyCashback($user, $amount, 'pay');

            return ['wallet' => $wallet, 'transaction' => $tx];
        });
    }

    // Apply cashback to user if eligible based on active promos.
    // Dipanggil dalam transaksi DB yang sudah ada — tanpa DB::transaction() sendiri.
    private function applyCashback(User $user, int $amount, string $type): void
    {
        $promos = config('wallet.promos', []);

        foreach ($promos as $promo) {
            if ($promo['type'] !== $type) continue;
            if ($promo['cashback_percent'] <= 0) continue;
            if ($amount < $promo['min_amount']) continue;

            $cashback = (int) round($amount * $promo['cashback_percent'] / 100);
            $cashback = min($cashback, $promo['max_cashback']);
            if ($cashback <= 0) continue;

            $wallet = Wallet::where('user_id', $user->id)->lockForUpdate()->first();
            $wallet->balance = bcadd((string) $wallet->balance, (string) $cashback, 2);
            $wallet->save();

            Transaction::create([
                'code'          => $this->generateCode(),
                'user_id'       => $user->id,
                'type'          => 'TOPUP',
                'status'        => 'SUCCESS',
                'amount'        => $cashback,
                'balance_after' => $wallet->balance,
                'description'   => $promo['title'] . ' — ' . $promo['description'],
            ]);
        }
    }

    private function generateCode(): string
    {
        return 'TRX-' . now()->format('Ymd') . '-' . strtoupper(Str::random(6));
    }
}
