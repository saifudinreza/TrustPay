<?php

namespace App\Http\Controllers;

use App\Http\Requests\TopUpRequest;
use App\Http\Requests\TransferRequest;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Voucher;
use App\Services\WalletService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

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
     * POST /topup — inisialisasi top up.
     * Jika DIRECT_TOPUP_ENABLED=true, langsung tambah saldo (tanpa Midtrans).
     * Jika false, buat transaksi PENDING + Snap token Midtrans.
     */
    public function topup(TopUpRequest $request): JsonResponse
    {
        $result = $this->walletService->topUp($request->user(), (int) $request->amount);

        if (!empty($result['direct'])) {
            return response()->json([
                'message'     => 'Top up berhasil.',
                'direct'      => true,
                'wallet'      => ['balance' => (float) $result['wallet']->balance],
                'transaction' => $this->formatTx($result['transaction']),
            ]);
        }

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
            // Lapisan keamanan: setiap transfer wajib lolos verifikasi PIN user.
            $this->assertPin($request->user(), $request->input('pin'));

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
            'pin'         => ['required', 'string', 'digits:6'],
        ], [
            'pin.required' => 'PIN transaksi wajib diisi.',
            'pin.digits'   => 'PIN harus 6 angka.',
        ]);

        try {
            // Lapisan keamanan: pembayaran tagihan juga wajib lolos verifikasi PIN.
            $this->assertPin($request->user(), $request->input('pin'));

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
     * GET /promos — daftar promo & cashback aktif.
     */
    public function promos(): JsonResponse
    {
        return response()->json(['data' => config('wallet.promos', [])]);
    }

    /**
     * POST /vouchers/redeem — redeem kode voucher.
     */
    public function redeemVoucher(Request $request): JsonResponse
    {
        $data = $request->validate([
            'code' => 'required|string|max:32',
        ]);

        $voucher = Voucher::where('code', strtoupper($data['code']))->first();

        if (! $voucher) {
            return response()->json(['message' => 'Kode voucher tidak ditemukan.'], 404);
        }

        if (! $voucher->is_active) {
            return response()->json(['message' => 'Voucher sudah tidak aktif.'], 400);
        }

        if ($voucher->expires_at && $voucher->expires_at->isPast()) {
            return response()->json(['message' => 'Voucher sudah kedaluwarsa.'], 400);
        }

        if ($voucher->max_uses && $voucher->users()->count() >= $voucher->max_uses) {
            return response()->json(['message' => 'Kuota voucher sudah habis.'], 400);
        }

        $user = $request->user();
        $usedCount = $voucher->users()->where('user_id', $user->id)->count();
        if ($usedCount >= $voucher->max_uses_per_user) {
            return response()->json(['message' => 'Kamu sudah pernah menggunakan voucher ini.'], 400);
        }

        try {
            $result = $this->walletService->redeemVoucher($user, $voucher);
            return response()->json([
                'message'     => 'Voucher berhasil diredeem!',
                'wallet'      => ['balance' => (float) $result['wallet']->balance],
                'transaction' => $this->formatTx($result['transaction']),
            ]);
        } catch (\DomainException $e) {
            return response()->json(['message' => $e->getMessage()], $e->getCode() ?: 500);
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
     * Verifikasi PIN transaksi user sebelum mutasi saldo keluar.
     *
     * - Belum punya PIN  → 403, frontend mengarahkan user ke pengaturan PIN.
     * - PIN salah/kosong → 422, frontend menampilkan pesan & minta ketik ulang.
     *
     * Dilempar sebagai DomainException agar ditangkap blok catch di transfer()/pay().
     */
    private function assertPin(User $user, ?string $pin): void
    {
        if (is_null($user->pin)) {
            throw new \DomainException('Atur PIN transaksi terlebih dahulu di halaman profil.', 403);
        }

        if (! $pin || ! Hash::check($pin, $user->pin)) {
            throw new \DomainException('PIN salah.', 422);
        }
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
