<?php

namespace App\Http\Controllers;

use App\Http\Requests\TopUpRequest;
use App\Http\Requests\TransferRequest;
use App\Models\Transaction;
use App\Services\WalletService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * WalletController — endpoint saldo, top up, transfer, dan riwayat transaksi.
 *
 * Semua route di sini dilindungi `auth:sanctum` (lihat routes/api.php).
 * WalletService di-inject lewat constructor supaya controller hanya
 * mengurus HTTP in/out; logika bisnis ada di service.
 */
class WalletController extends Controller
{
    public function __construct(private WalletService $walletService) {}

    /**
     * GET /wallet — kembalikan saldo user yang sedang login.
     * Frontend memanggilnya saat halaman Dashboard dimuat.
     */
    public function show(Request $request): JsonResponse
    {
        $wallet = $request->user()->wallet;

        return response()->json(['balance' => (float) $wallet->balance]);
    }

    /**
     * POST /topup — inisialisasi top up via Midtrans Snap.
     * TopUpRequest memvalidasi `amount` (angka bulat, > 0, ≤ maks konfigurasi).
     * Respons: snap_token + redirect_url untuk membuka Midtrans Snap UI di frontend.
     */
    public function topup(TopUpRequest $request): JsonResponse
    {
        $result = $this->walletService->topUp($request->user(), (int) $request->amount);

        return response()->json([
            'message'      => 'Top up diinisialisasi.',
            'snap_token'   => $result['snap_token'],
            'redirect_url' => $result['redirect_url'],
            'transaction'  => $this->formatTx($result['transaction']),
        ]);
    }

    /**
     * POST /topup/confirm — dipanggil frontend setelah user selesai di Snap popup
     * (sukses, pending, gagal, atau tutup popup).
     * Mengambil status terbaru dari Midtrans API, lalu update saldo jika SUCCESS.
     */
    public function confirmTopUp(Request $request): JsonResponse
    {
        // Validasi inline: `code` harus ada di tabel transactions.
        $request->validate([
            'code' => 'required|string|exists:transactions,code',
        ]);

        try {
            $result = $this->walletService->checkAndUpdateStatus($request->code);

            return response()->json([
                'message'     => 'Status transaksi diperbarui.',
                'transaction' => $this->formatTx($result['transaction']),
                'wallet'      => ['balance' => (float) $result['wallet']->balance],
            ]);
        } catch (\DomainException $e) {
            $status = $e->getCode() ?: 400;
            return response()->json(['message' => $e->getMessage()], $status);
        }
    }

    /**
     * POST /transfer — kirim uang ke user lain.
     * TransferRequest memvalidasi recipient + amount.
     * WalletService menangani pencarian penerima, cek saldo, debit-credit atomik.
     */
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
                'wallet'      => ['balance' => (float) $result['wallet']->balance], // saldo pengirim setelah transfer
                'transaction' => $this->formatTx($result['transaction']),
            ]);
        } catch (\DomainException $e) {
            // DomainException dilempar WalletService untuk error bisnis (saldo kurang, penerima tidak ada)
            $status = $e->getCode() ?: 400;

            return response()->json(['message' => $e->getMessage()], $status);
        }
    }

    /**
     * POST /pay — pembayaran tagihan (Pulsa/PLN/Air/Internet).
     * Memotong saldo dan mencatat TRANSFER_OUT tanpa counterpart.
     */
    public function pay(Request $request): JsonResponse
    {
        $data = $request->validate([
            'amount'      => ['required', 'integer', 'min:1000', 'max:10000000'],
            'description' => ['nullable', 'string', 'max:200'],
        ]);

        try {
            $result = $this->walletService->pay(
                $request->user(),
                (int) $data['amount'],
                $data['description'] ?? 'Pembayaran',
            );

            return response()->json([
                'message'     => 'Pembayaran berhasil.',
                'wallet'      => ['balance' => (float) $result['wallet']->balance],
                'transaction' => $this->formatTx($result['transaction']),
            ]);
        } catch (\DomainException $e) {
            return response()->json(['message' => $e->getMessage()], $e->getCode() ?: 422);
        }
    }

    /**
     * GET /transactions — riwayat semua transaksi user, terbaru dulu.
     * counterpartUser di-eager-load supaya tidak N+1 query.
     */
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

    /**
     * Format satu baris Transaction menjadi array yang aman dikirim ke frontend.
     * Tipe data dijaga eksplisit (float, string, null) supaya JSON konsisten.
     */
    private function formatTx(Transaction $tx): array
    {
        // counterpartUser hanya tersedia jika sudah di-load (eager atau manual)
        $cu = $tx->relationLoaded('counterpartUser') ? $tx->counterpartUser : null;

        return [
            'id'               => $tx->id,
            'code'             => $tx->code,
            'type'             => $tx->type,                    // TOPUP | TRANSFER_IN | TRANSFER_OUT
            'status'           => $tx->status,                  // PENDING | SUCCESS | FAILED
            'amount'           => (float) $tx->amount,
            'balance_after'    => $tx->balance_after !== null ? (float) $tx->balance_after : null,
            'description'      => $tx->description,
            'transfer_code'    => $tx->transfer_code,           // UUID bersama dengan pasangan transfer
            'counterpart_user' => $cu ? ['id' => $cu->id, 'name' => $cu->name, 'username' => $cu->username] : null,
            'created_at'       => $tx->created_at,
        ];
    }
}
