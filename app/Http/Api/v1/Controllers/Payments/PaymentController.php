<?php

namespace App\Http\Api\v1\Controllers\Payments;

use App\Http\Api\v1\Controllers\Controller;
use App\Http\Api\v1\Services\Payments\NiubizService;
use App\Http\Api\v1\Services\Orders\OrderNotificationService;
use App\Models\Orders\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    public function __construct(
        protected NiubizService $niubizService,
        protected OrderNotificationService $orderNotificationService
    ) {}

    public function createSession(Request $request): JsonResponse
    {
        $payload = $request->validate([
            'purchaseNumber' => ['nullable', 'string', 'max:40'],
            'purchase_number' => ['nullable', 'string', 'max:40'],
            'antifraud' => ['required', 'array'],
            'antifraud.clientIp' => ['nullable', 'ip'],
            'antifraud.merchantDefineData' => ['required', 'array'],
            'dataMap' => ['required', 'array'],
        ]);

        try {
            $customerId = (string) auth('api')->id();
            $purchaseNumber = (string) ($payload['purchaseNumber'] ?? $payload['purchase_number'] ?? '');
            if ($purchaseNumber === '') {
                return $this->error('purchaseNumber o purchase_number es requerido.', null, 422);
            }
            $order = $this->findNiubizOrderOrFail($customerId, $purchaseNumber);
            $this->assertOrderCanStartNiubiz($order);
            $purchaseNumberForNiubiz = (string) ($order->niubiz_purchase_number ?? '');
            if ($purchaseNumberForNiubiz === '') {
                $purchaseNumberForNiubiz = preg_replace('/\D/', '', $order->code);
            }
            if ($purchaseNumberForNiubiz === '' || strlen($purchaseNumberForNiubiz) > 12) {
                return $this->error('El purchaseNumber para Niubiz debe ser numérico y máximo 12 dígitos.', null, 422);
            }
            if ($order->niubiz_purchase_number !== $purchaseNumberForNiubiz) {
                $order->update(['niubiz_purchase_number' => $purchaseNumberForNiubiz]);
            }

            $session = $this->niubizService->createSession(
                $purchaseNumberForNiubiz,
                (float) $order->total,
                strtoupper((string) ($order->currency ?: 'PEN')),
                (array) ($payload['antifraud'] ?? []),
                (array) ($payload['dataMap'] ?? [])
            );

            return $this->success('Sesión de Niubiz creada correctamente.', [
                'sessionKey' => $session['session_key'],
                'purchaseNumber' => $purchaseNumberForNiubiz,
                'orderCode' => $order->code,
                'amount' => (float) $order->total,
                'currency' => strtoupper((string) ($order->currency ?: 'PEN')),
            ]);
        } catch (\InvalidArgumentException $exception) {
            return $this->error($exception->getMessage(), null, 422);
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
            'transactionToken' => ['nullable', 'string', 'max:255'],
            'transaction_token' => ['nullable', 'string', 'max:255'],
            'purchaseNumber' => ['nullable', 'string', 'max:40'],
            'purchase_number' => ['nullable', 'string', 'max:40'],
            'dataMap' => ['sometimes', 'array'],
        ]);

        $customerId = (string) auth('api')->id();
        $transactionToken = (string) ($payload['transactionToken'] ?? $payload['transaction_token'] ?? '');
        $purchaseNumber = (string) ($payload['purchaseNumber'] ?? $payload['purchase_number'] ?? '');
        if ($transactionToken === '' || $purchaseNumber === '') {
            return $this->error('transactionToken/transaction_token y purchaseNumber/purchase_number son requeridos.', null, 422);
        }
        $order = $this->findNiubizOrderOrFail($customerId, $purchaseNumber);
        $this->assertOrderCanConfirmNiubiz($order);
        $purchaseNumberForNiubiz = (string) ($order->niubiz_purchase_number ?? '');
        if ($purchaseNumberForNiubiz === '') {
            $purchaseNumberForNiubiz = preg_replace('/\D/', '', $order->code);
            $order->update(['niubiz_purchase_number' => $purchaseNumberForNiubiz]);
        }
        if ($purchaseNumberForNiubiz === '' || strlen($purchaseNumberForNiubiz) > 12) {
            return $this->error('El purchaseNumber para Niubiz debe ser numérico y máximo 12 dígitos.', null, 422);
        }

        if ($order->state === 'payment_received' || $order->state === 'delivered') {
            return $this->success('La orden ya tiene pago aprobado.', [
                'is_approved' => true,
                'authorization_code' => null,
                'transaction_id' => null,
                'brand' => null,
                'masked_card' => null,
                'response_code' => null,
                'response_message' => 'Pago ya confirmado previamente.',
                'order' => $order->load(['payments', 'statusHistory']),
                'raw' => null,
            ]);
        }

        try {
            Log::info('niubiz.authorization_start', [
                'order_id' => $order->id,
                'purchase_number' => $purchaseNumberForNiubiz,
                'transaction_token' => $transactionToken,
                'timestamp' => now()->toDateTimeString(),
            ]);

            $confirmation = $this->niubizService->confirmWithTransactionToken(
                $transactionToken,
                $purchaseNumberForNiubiz,
                (float) $order->total,
                strtoupper((string) ($order->currency ?: 'PEN')),
                $order->id,
                (array) ($payload['dataMap'] ?? [])
            );

            $order = $this->syncOrderAfterNiubizConfirmation(
                $order,
                $confirmation
            );

            Log::info('niubiz.authorization_result', [
                'order_id' => $order?->id,
                'purchase_number' => $purchaseNumberForNiubiz,
                'response_code' => $confirmation['response_code'],
                'response_message' => $confirmation['response_message'],
                'is_approved' => (bool) $confirmation['is_approved'],
                'timestamp' => now()->toDateTimeString(),
            ]);

            return $this->success('Confirmación de Niubiz procesada correctamente.', [
                'is_approved' => (bool) $confirmation['is_approved'],
                'authorization_code' => $confirmation['authorization_code'],
                'transaction_id' => $confirmation['transaction_id'],
                'brand' => $confirmation['brand'],
                'masked_card' => $confirmation['masked_card'],
                'response_code' => $confirmation['response_code'],
                'response_message' => $confirmation['response_message'],
                'order' => $order,
                'raw' => $confirmation['raw'],
            ]);
        } catch (\InvalidArgumentException $exception) {
            return $this->error($exception->getMessage(), null, 422);
        } catch (\RuntimeException $exception) {
            return $this->error($exception->getMessage(), null, 502);
        } catch (\Throwable $exception) {
            report($exception);

            return $this->error('No se pudo confirmar el pago.', null, 500);
        }
    }

    private function syncOrderAfterNiubizConfirmation(Order $order, array $confirmation): ?Order
    {
        return DB::transaction(function () use ($order, $confirmation) {
            $order = Order::query()
                ->where('id', $order->id)
                ->lockForUpdate()
                ->first();

            if (!$order) {
                return null;
            }

            $payment = $order->payments()->latest()->first();

            $previousState = $order->state;

            if ($confirmation['is_approved']) {
                $order->update([
                    'state' => 'payment_received',
                    'paid_at' => $order->paid_at ?? now(),
                    'confirmed_at' => $order->confirmed_at ?? now(),
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
                    'state' => 'payment_failed',
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

            $this->orderNotificationService->sendStateChanged($order, $previousState, $order->state);

            return $order->fresh(['payments', 'statusHistory']);
        });
    }

    private function findNiubizOrderOrFail(string $customerId, string $purchaseNumber): Order
    {
        if ($customerId === '') {
            throw new \InvalidArgumentException('Cliente no autenticado para confirmar el pago.');
        }

        $normalizedPurchaseNumber = preg_replace('/\D/', '', $purchaseNumber);
        if ($normalizedPurchaseNumber === '' || strlen($normalizedPurchaseNumber) > 12) {
            throw new \InvalidArgumentException('purchaseNumber inválido para Niubiz.');
        }

        $order = Order::query()
            ->where('customer_id', $customerId)
            ->where('niubiz_purchase_number', $normalizedPurchaseNumber)
            ->where('payment_method_type', 'niubiz')
            ->first();

        if (!$order) {
            throw new \InvalidArgumentException('No existe una orden Niubiz válida para el purchaseNumber enviado.');
        }

        return $order;
    }

    private function assertOrderCanStartNiubiz(Order $order): void
    {
        if ($order->state === 'cancelled') {
            throw new \InvalidArgumentException('La orden está cancelada y no puede iniciar pago Niubiz.');
        }

        if ($order->state === 'payment_received' || $order->state === 'delivered') {
            throw new \InvalidArgumentException('La orden ya tiene pago aprobado.');
        }
    }

    private function assertOrderCanConfirmNiubiz(Order $order): void
    {
        if ($order->state === 'cancelled') {
            throw new \InvalidArgumentException('La orden está cancelada y no puede confirmar pago Niubiz.');
        }
    }
}
