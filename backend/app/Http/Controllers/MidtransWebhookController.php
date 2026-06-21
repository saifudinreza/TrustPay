<?php

namespace App\Http\Controllers;

use App\Services\WalletService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Midtrans\Config;
use Midtrans\Notification;

class MidtransWebhookController extends Controller
{
    public function __construct(private WalletService $walletService) {}

    public function handleNotification(Request $request): JsonResponse
    {
        try {
            Config::$serverKey = config('midtrans.server_key');
            Config::$isProduction = config('midtrans.is_production');

            $notification = new Notification();
            $transactionStatus = $notification->transaction_status;
            $orderId = $notification->order_id;
            $fraudStatus = $notification->fraud_status ?? '';

            Log::info("Midtrans Webhook Received: code={$orderId}, status={$transactionStatus}, fraud={$fraudStatus}");

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
                $this->walletService->completeTopUp($orderId, $status);
            }

            return response()->json(['message' => 'Notification handled successfully.']);
        } catch (\Exception $e) {
            Log::error("Midtrans Webhook Error: " . $e->getMessage());
            return response()->json([
                'message' => 'Error handling notification.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }
}
