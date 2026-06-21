<?php

namespace App\Http\Controllers;

use App\Http\Requests\TopUpRequest;
use App\Http\Requests\TransferRequest;
use App\Models\Transaction;
use App\Services\WalletService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WalletController extends Controller
{
    public function __construct(private WalletService $walletService) {}

    public function show(Request $request): JsonResponse
    {
        $wallet = $request->user()->wallet;

        return response()->json(['balance' => (float) $wallet->balance]);
    }

    public function topup(TopUpRequest $request): JsonResponse
    {
        $result = $this->walletService->topUp($request->user(), (int) $request->amount);

        return response()->json([
            'message'     => 'Top up berhasil.',
            'wallet'      => ['balance' => (float) $result['wallet']->balance],
            'transaction' => $this->formatTx($result['transaction']),
        ]);
    }

    public function transfer(TransferRequest $request): JsonResponse
    {
        try {
            $result = $this->walletService->transfer(
                $request->user(),
                $request->recipient,
                (int) $request->amount,
                $request->description,
            );

            return response()->json([
                'message'     => 'Transfer berhasil.',
                'wallet'      => ['balance' => (float) $result['wallet']->balance],
                'transaction' => $this->formatTx($result['transaction']),
            ]);
        } catch (\DomainException $e) {
            $status = $e->getCode() ?: 400;

            return response()->json(['message' => $e->getMessage()], $status);
        }
    }

    public function transactions(Request $request): JsonResponse
    {
        $txs = $request->user()
            ->transactions()
            ->with('counterpartUser')
            ->latest()
            ->get();

        return response()->json([
            'data' => $txs->map(fn (Transaction $tx) => $this->formatTx($tx))->values()->all(),
        ]);
    }

    private function formatTx(Transaction $tx): array
    {
        $cu = $tx->relationLoaded('counterpartUser') ? $tx->counterpartUser : null;

        return [
            'id'               => $tx->id,
            'code'             => $tx->code,
            'type'             => $tx->type,
            'amount'           => (float) $tx->amount,
            'balance_after'    => (float) $tx->balance_after,
            'description'      => $tx->description,
            'transfer_code'    => $tx->transfer_code,
            'counterpart_user' => $cu ? ['id' => $cu->id, 'name' => $cu->name, 'username' => $cu->username] : null,
            'created_at'       => $tx->created_at,
        ];
    }
}
