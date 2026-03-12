<?php

namespace App\Http\Api\v1\Controllers\Payments;

use App\Http\Api\v1\Controllers\Controller;
use App\Http\Api\v1\Services\Payments\NiubizService;
use App\Models\Orders\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    public function __construct(protected NiubizService $niubizService) {}

    public function createSession(Request $request): JsonResponse
    {
        $payload = $request->validate([
            'purchaseNumber' => ['required', 'string', 'max:40'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'currency' => ['nullable', 'string', 'size:3'],
        ]);

        try {
            $session = $this->niubizService->createSession(
                (string) $payload['purchaseNumber'],
                (float) $payload['amount'],
                strtoupper((string) ($payload['currency'] ?? 'PEN'))
            );

            return $this->success('Sesión de Niubiz creada correctamente.', [
                'sessionKey' => $session['session_key'],
                'purchaseNumber' => (string) $payload['purchaseNumber'],
            ]);
        } catch (\RuntimeException $exception) {
            return $this->error($exception->getMessage(), null, 502);
        } catch (\Throwable $exception) {
            report($exception);
            return $this->error('No se pudo crear la sesión de pago.', null, 500);
        }
    }

    public function confirmPayment(Request $request): JsonResponse
    {
        $payload = $request->validate([
            'transactionToken' => ['required', 'string', 'max:255'],
            'purchaseNumber' => ['required', 'string', 'max:40'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'currency' => ['nullable', 'string', 'size:3'],
        ]);

        try {
            $confirmation = $this->niubizService->confirmWithTransactionToken(
                (string) $payload['transactionToken'],
                (string) $payload['purchaseNumber'],
                (float) $payload['amount'],
                strtoupper((string) ($payload['currency'] ?? 'PEN'))
            );

            $order = $this->syncOrderAfterNiubizConfirmation(
                (string) auth('api')->id(),
                (string) $payload['purchaseNumber'],
                $confirmation
            );

            return $this->success('Confirmación de Niubiz procesada correctamente.', [
                'is_approved' => $confirmation['is_approved'],
                'authorization_code' => $confirmation['authorization_code'],
                'transaction_id' => $confirmation['transaction_id'],
                'brand' => $confirmation['brand'],
                'masked_card' => $confirmation['masked_card'],
                'response_code' => $confirmation['response_code'],
                'response_message' => $confirmation['response_message'],
                'order' => $order,
                'raw' => $confirmation['raw'],
            ]);
        } catch (\RuntimeException $exception) {
            return $this->error($exception->getMessage(), null, 502);
        } catch (\Throwable $exception) {
            report($exception);
            return $this->error('No se pudo confirmar el pago.', null, 500);
        }
    }

    private function syncOrderAfterNiubizConfirmation(string $customerId, string $purchaseNumber, array $confirmation): ?Order
    {
        if ($customerId === '') {
            return null;
        }

        return DB::transaction(function () use ($customerId, $purchaseNumber, $confirmation) {
            $order = Order::query()
                ->where('customer_id', $customerId)
                ->where('code', $purchaseNumber)
                ->where('payment_method_type', 'niubiz')
                ->lockForUpdate()
                ->first();

            if (!$order) {
                return null;
            }

            $payment = $order->payments()->latest()->first();

            if ($confirmation['is_approved']) {
                $order->update([
                    'payment_status' => 'approved',
                    'paid_at' => $order->paid_at ?? now(),
                    'status' => $order->status === 'pending' ? 'confirmed' : $order->status,
                    'confirmed_at' => $order->status === 'pending' ? ($order->confirmed_at ?? now()) : $order->confirmed_at,
                ]);

                if ($payment) {
                    $payment->update([
                        'status' => 'approved',
                        'paid_at' => $payment->paid_at ?? now(),
                        'gateway_transaction_id' => $confirmation['transaction_id'],
                        'gateway_authorization_code' => $confirmation['authorization_code'],
                        'gateway_brand' => $confirmation['brand'],
                        'gateway_masked_card' => $confirmation['masked_card'],
                        'gateway_payload' => $confirmation['raw'],
                        'rejected_at' => null,
                    ]);
                }
            } else {
                $order->update([
                    'payment_status' => 'rejected',
                ]);

                if ($payment) {
                    $payment->update([
                        'status' => 'rejected',
                        'rejected_at' => now(),
                        'gateway_transaction_id' => $confirmation['transaction_id'],
                        'gateway_authorization_code' => $confirmation['authorization_code'],
                        'gateway_brand' => $confirmation['brand'],
                        'gateway_masked_card' => $confirmation['masked_card'],
                        'gateway_payload' => $confirmation['raw'],
                    ]);
                }
            }

            return $order->fresh(['payments', 'statusHistory']);
        });
    }
}
