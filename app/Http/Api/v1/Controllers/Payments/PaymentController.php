<?php

namespace App\Http\Api\v1\Controllers\Payments;

use App\Http\Api\v1\Controllers\Controller;
use App\Models\Orders\OrderPaymentAttempt;
use App\Http\Api\v1\Services\Payments\NiubizService;
use App\Models\Orders\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\QueryException;

class PaymentController extends Controller
{
    public function __construct(protected NiubizService $niubizService) {}

    public function createSession(Request $request): JsonResponse
    {
        $payload = $request->validate([
            'purchaseNumber' => ['required', 'string', 'max:40'],
        ]);

        try {
            $customerId = (string) auth('api')->id();
            $purchaseNumber = (string) $payload['purchaseNumber'];
            $order = $this->findNiubizOrderOrFail($customerId, $purchaseNumber);
            $this->assertOrderCanStartNiubiz($order);

            $session = $this->niubizService->createSession(
                $purchaseNumber,
                (float) $order->total,
                strtoupper((string) ($order->currency ?: 'PEN'))
            );

            return $this->success('Sesión de Niubiz creada correctamente.', [
                'sessionKey' => $session['session_key'],
                'purchaseNumber' => $purchaseNumber,
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
            'transactionToken' => ['required', 'string', 'max:255'],
            'purchaseNumber' => ['required', 'string', 'max:40'],
        ]);

        $customerId = (string) auth('api')->id();
        $transactionToken = (string) $payload['transactionToken'];
        $purchaseNumber = (string) $payload['purchaseNumber'];
        $order = $this->findNiubizOrderOrFail($customerId, $purchaseNumber);
        $this->assertOrderCanConfirmNiubiz($order);

        if ($order->payment_status === 'approved') {
            return $this->success('La orden ya tiene pago aprobado.', [
                'payment_attempt_id' => null,
                'attempt_status' => 'completed',
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

        $attemptData = $this->getOrCreatePaymentAttempt(
            $order,
            $purchaseNumber,
            $transactionToken
        );

        /** @var OrderPaymentAttempt $attempt */
        $attempt = $attemptData['attempt'];

        if (!$attemptData['is_new']) {
            Log::info('niubiz.idempotency_blocked', [
                'order_id' => $attempt->order_id,
                'payment_attempt_id' => $attempt->id,
                'transaction_token' => $attempt->transaction_token,
                'status' => $attempt->status,
                'already_authorized' => $attempt->status === 'completed' && (bool) $attempt->is_approved,
                'timestamp' => now()->toDateTimeString(),
            ]);

            return $this->success(
                'Confirmación ya procesada para este intento de pago.',
                $this->buildAttemptResult($attempt)
            );
        }

        try {
            Log::info('niubiz.authorization_start', [
                'order_id' => $attempt->order_id,
                'payment_attempt_id' => $attempt->id,
                'purchase_number' => $purchaseNumber,
                'transaction_token' => $transactionToken,
                'already_authorized' => false,
                'timestamp' => now()->toDateTimeString(),
            ]);

            $confirmation = $this->niubizService->confirmWithTransactionToken(
                $transactionToken,
                $purchaseNumber,
                (float) $order->total,
                strtoupper((string) ($order->currency ?: 'PEN')),
                $attempt->order_id
            );

            $order = $this->syncOrderAfterNiubizConfirmation(
                $order,
                $confirmation
            );

            $attempt->update([
                'order_id' => $order?->id ?? $attempt->order_id,
                'status' => 'completed',
                'is_approved' => $confirmation['is_approved'],
                'authorization_code' => $confirmation['authorization_code'],
                'transaction_id' => $confirmation['transaction_id'],
                'brand' => $confirmation['brand'],
                'masked_card' => $confirmation['masked_card'],
                'response_code' => $confirmation['response_code'],
                'response_message' => $confirmation['response_message'],
                'niubiz_payload' => $confirmation['raw'],
                'error_message' => null,
                'processed_at' => now(),
            ]);

            Log::info('niubiz.authorization_result', [
                'order_id' => $attempt->order_id,
                'payment_attempt_id' => $attempt->id,
                'purchase_number' => $purchaseNumber,
                'response_code' => $attempt->response_code,
                'response_message' => $attempt->response_message,
                'is_approved' => (bool) $attempt->is_approved,
                'timestamp' => now()->toDateTimeString(),
            ]);

            return $this->success('Confirmación de Niubiz procesada correctamente.', [
                'payment_attempt_id' => $attempt->id,
                'attempt_status' => $attempt->status,
                'is_approved' => (bool) $attempt->is_approved,
                'authorization_code' => $attempt->authorization_code,
                'transaction_id' => $attempt->transaction_id,
                'brand' => $attempt->brand,
                'masked_card' => $attempt->masked_card,
                'response_code' => $attempt->response_code,
                'response_message' => $attempt->response_message,
                'order' => $order,
                'raw' => $attempt->niubiz_payload,
            ]);
        } catch (\InvalidArgumentException $exception) {
            $attempt->update([
                'status' => 'failed',
                'error_message' => $exception->getMessage(),
                'processed_at' => now(),
            ]);

            return $this->error($exception->getMessage(), null, 422);
        } catch (\RuntimeException $exception) {
            $attempt->update([
                'status' => 'failed',
                'error_message' => $exception->getMessage(),
                'processed_at' => now(),
            ]);

            return $this->error($exception->getMessage(), null, 502);
        } catch (\Throwable $exception) {
            report($exception);

            $attempt->update([
                'status' => 'failed',
                'error_message' => $exception->getMessage(),
                'processed_at' => now(),
            ]);

            return $this->error('No se pudo confirmar el pago.', null, 500);
        }
    }

    private function getOrCreatePaymentAttempt(Order $order, string $purchaseNumber, string $transactionToken): array
    {
        try {
            return DB::transaction(function () use ($order, $purchaseNumber, $transactionToken) {
                $attempt = OrderPaymentAttempt::query()
                    ->where('transaction_token', $transactionToken)
                    ->lockForUpdate()
                    ->first();

                if ($attempt) {
                    return ['attempt' => $attempt, 'is_new' => false];
                }

                $newAttempt = OrderPaymentAttempt::query()->create([
                    'order_id' => $order->id,
                    'purchase_number' => $purchaseNumber,
                    'transaction_token' => $transactionToken,
                    'status' => 'processing',
                ]);

                Log::info('niubiz.idempotency_attempt_created', [
                    'order_id' => $order->id,
                    'payment_attempt_id' => $newAttempt->id,
                    'transaction_token' => $transactionToken,
                    'timestamp' => now()->toDateTimeString(),
                ]);

                return ['attempt' => $newAttempt, 'is_new' => true];
            });
        } catch (QueryException $exception) {
            // Carrera por llave única de transaction_token: devolvemos el intento ya existente.
            $existing = OrderPaymentAttempt::query()
                ->where('transaction_token', $transactionToken)
                ->firstOrFail();

            return ['attempt' => $existing, 'is_new' => false];
        }
    }

    private function buildAttemptResult(OrderPaymentAttempt $attempt): array
    {
        $order = null;

        if ($attempt->order_id) {
            $order = Order::query()->with(['payments', 'statusHistory'])->find($attempt->order_id);
        }

        return [
            'payment_attempt_id' => $attempt->id,
            'attempt_status' => $attempt->status,
            'is_approved' => (bool) $attempt->is_approved,
            'authorization_code' => $attempt->authorization_code,
            'transaction_id' => $attempt->transaction_id,
            'brand' => $attempt->brand,
            'masked_card' => $attempt->masked_card,
            'response_code' => $attempt->response_code,
            'response_message' => $attempt->response_message,
            'order' => $order,
            'raw' => $attempt->niubiz_payload,
        ];
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

    private function findNiubizOrderOrFail(string $customerId, string $purchaseNumber): Order
    {
        if ($customerId === '') {
            throw new \InvalidArgumentException('Cliente no autenticado para confirmar el pago.');
        }

        $order = Order::query()
            ->where('customer_id', $customerId)
            ->where('code', $purchaseNumber)
            ->where('payment_method_type', 'niubiz')
            ->first();

        if (!$order) {
            throw new \InvalidArgumentException('No existe una orden Niubiz válida para el purchaseNumber enviado.');
        }

        return $order;
    }

    private function assertOrderCanStartNiubiz(Order $order): void
    {
        if ($order->status === 'cancelled') {
            throw new \InvalidArgumentException('La orden está cancelada y no puede iniciar pago Niubiz.');
        }

        if ($order->payment_status === 'approved') {
            throw new \InvalidArgumentException('La orden ya tiene pago aprobado.');
        }
    }

    private function assertOrderCanConfirmNiubiz(Order $order): void
    {
        if ($order->status === 'cancelled') {
            throw new \InvalidArgumentException('La orden está cancelada y no puede confirmar pago Niubiz.');
        }
    }
}
