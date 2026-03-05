<?php

namespace App\Http\Web\Controllers\Orders;

use App\Http\Api\v1\Services\Orders\OrderService;
use App\Http\Web\Controllers\Controller;
use App\Models\Orders\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function __construct(protected OrderService $orderService) {}

    public function index(Request $request)
    {
        $perPage = max(1, min((int) $request->input('per_page', 15), 100));

        $query = Order::query()
            ->with(['items', 'payments', 'paymentMethod:id,name'])
            ->orderByDesc('created_at');

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        if ($request->filled('payment_status')) {
            $query->where('payment_status', $request->string('payment_status'));
        }

        if ($request->filled('search')) {
            $search = (string) $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                    ->orWhere('customer_email', 'like', "%{$search}%")
                    ->orWhere('customer_document_number', 'like', "%{$search}%");
            });
        }

        $orders = $query->paginate($perPage)->withQueryString();

        return Inertia::render('orders/Index', [
            'paginatedOrders' => $orders,
            'filters' => $request->only(['status', 'payment_status', 'search']),
        ]);
    }

    public function show(Order $order)
    {
        $order->load([
            'items',
            'payments',
            'statusHistory',
            'paymentMethod:id,name,company_type',
            'customer:id,full_name,email,phone',
        ]);

        return Inertia::render('orders/Show', [
            'order' => $order,
        ]);
    }

    public function updateStatus(Request $request, Order $order)
    {
        $data = $request->validate([
            'status' => ['required', 'in:pending,confirmed,preparing,shipped,delivered,cancelled'],
            'note' => ['nullable', 'string', 'max:500'],
        ]);

        try {
            $this->orderService->updateOrderStatusByAdmin(
                $order,
                $data['status'],
                $data['note'] ?? null,
                (string) auth()->id()
            );

            return back()->with('success', 'Estado de la orden actualizado correctamente.');
        } catch (\InvalidArgumentException $exception) {
            return back()->withErrors(['status' => $exception->getMessage()]);
        }
    }

    public function updatePaymentStatus(Request $request, Order $order)
    {
        $data = $request->validate([
            'payment_status' => ['required', 'in:pending,approved,rejected,failed,refunded'],
            'note' => ['nullable', 'string', 'max:500'],
        ]);

        try {
            $this->orderService->updatePaymentStatusByAdmin(
                $order,
                $data['payment_status'],
                $data['note'] ?? null,
                (string) auth()->id()
            );

            return back()->with('success', 'Estado de pago actualizado correctamente.');
        } catch (\InvalidArgumentException $exception) {
            return back()->withErrors(['payment_status' => $exception->getMessage()]);
        }
    }

    public function updateShippingStatus(Request $request, Order $order)
    {
        $data = $request->validate([
            'shipping_status' => ['required', 'in:pending,assigned,in_transit,delivered,failed'],
            'note' => ['nullable', 'string', 'max:500'],
        ]);

        try {
            $this->orderService->updateShippingStatusByAdmin(
                $order,
                $data['shipping_status'],
                $data['note'] ?? null,
                (string) auth()->id()
            );

            return back()->with('success', 'Estado de envío actualizado correctamente.');
        } catch (\InvalidArgumentException $exception) {
            return back()->withErrors(['shipping_status' => $exception->getMessage()]);
        }
    }
}
