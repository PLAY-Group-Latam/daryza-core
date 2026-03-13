<?php

namespace App\Http\Api\v1\Controllers\Orders;

use App\Http\Api\v1\Controllers\Controller;
use App\Http\Api\v1\Requests\Orders\CancelOrderRequest;
use App\Http\Api\v1\Requests\Orders\StoreOrderRequest;
use App\Http\Api\v1\Requests\Orders\UploadPaymentProofRequest;
use App\Http\Api\v1\Requests\Orders\ValidateOrderRequest;
use App\Http\Api\v1\Requests\Payments\ConfirmNiubizPaymentRequest;
use App\Http\Api\v1\Services\Orders\OrderService;
use App\Models\Orders\Order;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function __construct(protected OrderService $orderService) {}

    public function validateOrder(ValidateOrderRequest $request)
    {
        try {
            $quote = $this->orderService->validateOrder($request->validated());

            return $this->success('Validación de orden generada correctamente.', $quote);
        } catch (\InvalidArgumentException $exception) {
            return $this->error($exception->getMessage(), null, 422);
        }
    }

    public function index(Request $request)
    {
        $customerId = (string) auth('api')->id();
        $perPage = (int) $request->input('per_page', 10);

        $orders = $this->orderService->listForCustomer($customerId, max(1, min($perPage, 50)));

        return $this->success('Órdenes del cliente obtenidas correctamente.', $orders);
    }

    public function store(StoreOrderRequest $request)
    {
        /** @var \App\Models\Customers\Customer $customer */
        $customer = auth('api')->user();

        try {
            $order = $this->orderService->create($customer, $request->validated());

            return $this->created('Orden creada correctamente.', $order);
        } catch (\InvalidArgumentException $exception) {
            return $this->error($exception->getMessage(), null, 422);
        } catch (\Throwable $exception) {
            report($exception);
            return $this->error('No se pudo crear la orden.', null, 500);
        }
    }

    public function show(Order $order)
    {
        $customerId = (string) auth('api')->id();

        try {
            $data = $this->orderService->showForCustomer($order, $customerId);

            return $this->success('Orden obtenida correctamente.', $data);
        } catch (\InvalidArgumentException $exception) {
            return $this->error($exception->getMessage(), null, 403);
        }
    }

    public function cancel(CancelOrderRequest $request, Order $order)
    {
        $customerId = (string) auth('api')->id();

        try {
            $data = $this->orderService->cancelByCustomer(
                $order,
                $customerId,
                $request->validated('reason')
            );

            return $this->success('Orden cancelada correctamente.', $data);
        } catch (\InvalidArgumentException $exception) {
            return $this->error($exception->getMessage(), null, 422);
        }
    }

    public function uploadPaymentProof(UploadPaymentProofRequest $request, Order $order)
    {
        $customerId = (string) auth('api')->id();

        try {
            $data = $this->orderService->uploadVoucher(
                $order,
                $customerId,
                $request->file('voucher_file')
            );

            return $this->success('Voucher registrado correctamente.', $data);
        } catch (\InvalidArgumentException $exception) {
            return $this->error($exception->getMessage(), null, 422);
        }
    }

    public function confirmNiubiz(ConfirmNiubizPaymentRequest $request, Order $order)
    {
        $customerId = (string) auth('api')->id();

        try {
            $data = $this->orderService->confirmNiubizPayment(
                $order,
                $customerId,
                (string) $request->validated('purchase_number')
            );

            return $this->success('Confirmación Niubiz procesada correctamente.', $data);
        } catch (\InvalidArgumentException $exception) {
            return $this->error($exception->getMessage(), null, 422);
        } catch (\RuntimeException $exception) {
            return $this->error($exception->getMessage(), null, 502);
        }
    }
}
