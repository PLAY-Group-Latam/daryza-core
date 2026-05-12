<?php

namespace App\Http\Web\Controllers\Orders;

use App\Http\Api\v1\Services\Orders\OrderService;
use App\Http\Web\Controllers\Controller;
use App\Http\Web\Exports\OrdersExport;
use App\Models\Orders\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class OrderController extends Controller
{
    public function __construct(protected OrderService $orderService) {}

    public function index(Request $request)
    {
        $perPage = max(1, min((int) $request->input('per_page', 15), 100));

        $query = Order::query()
            ->with(['items', 'payments'])
            ->orderByDesc('created_at');

        if ($request->filled('state')) {
            $query->where('state', $request->string('state'));
        }

        if ($request->filled('search')) {
            $search = (string) $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                    ->orWhere('customer_first_name', 'like', "%{$search}%")
                    ->orWhere('customer_last_name', 'like', "%{$search}%")
                    ->orWhereRaw("TRIM(customer_first_name || ' ' || customer_last_name) ILIKE ?", ["%{$search}%"]);
            });
        }

        $orders = $query
            ->paginate($perPage)
            ->withQueryString()
            ->through(function (Order $order) {
                return array_merge(
                    $order->toArray(),
                    $this->orderService->buildAdminStateMeta($order)
                );
            });

        return Inertia::render('orders/Index', [
            'paginatedOrders' => $orders,
            'filters' => $request->only(['state', 'search']),
        ]);
    }

    public function show(Order $order)
    {
        $order->load([
            'items',
            'payments',
            'statusHistory',
            'customer:id,full_name,full_last_name,email,phone,photo,dni,document_type',
        ]);

        return Inertia::render('orders/Show', [
            'order' => array_merge(
                $order->toArray(),
                $this->orderService->buildAdminStateMeta($order),
                $this->orderService->buildPricingMeta($order)
            ),
        ]);
    }

    public function export(Request $request)
    {
        $fileName = 'ordenes_daryza_' . now()->format('Y-m-d_H-i-s') . '.xlsx';
        $filters = $request->only(['state', 'search']);

        return Excel::download(new OrdersExport($filters), $fileName);
    }

    public function updateStatus(Request $request, Order $order)
    {
        $data = $request->validate([
            'status' => ['required', 'in:pending_payment,payment_received,preparing,in_delivery,delivered,delivery_failed,cancelled,payment_failed,refunded'],
            'note' => ['nullable', 'string', 'max:500'],
        ]);

        try {
            $this->orderService->updateStateByAdmin(
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
        return back()->withErrors(['payment_status' => 'Estado de pago separado fue removido. Usa estado unificado.']);
    }

    public function updateShippingStatus(Request $request, Order $order)
    {
        return back()->withErrors(['shipping_status' => 'Estado de envío separado fue removido. Usa estado unificado.']);
    }

    public function updateAdminAction(Request $request, Order $order)
    {
        $data = $request->validate([
            'action' => ['required', 'in:accept_payment,reject_payment,reset_to_pending_payment,start_preparing,schedule_shipping,start_transit,mark_delivered_full,mark_delivery_failed,cancel_order'],
            'note' => ['nullable', 'string', 'max:500'],
        ]);

        try {
            $this->orderService->applyAdminAction(
                $order,
                $data['action'],
                $data['note'] ?? null,
                (string) auth()->id()
            );

            return back()->with('success', 'Accion aplicada correctamente.');
        } catch (\InvalidArgumentException $exception) {
            return back()->withErrors(['action' => $exception->getMessage()]);
        }
    }

    public function updateAdminActionBulk(Request $request)
    {
        $data = $request->validate([
            'order_ids' => ['required', 'array', 'min:1'],
            'order_ids.*' => ['required', 'string'],
            'action' => ['required', 'in:accept_payment,reject_payment,reset_to_pending_payment,start_preparing,schedule_shipping,start_transit,mark_delivered_full,mark_delivery_failed,cancel_order'],
            'note' => ['nullable', 'string', 'max:500'],
        ]);

        $result = $this->orderService->applyAdminActionBulk(
            $data['order_ids'],
            $data['action'],
            $data['note'] ?? null,
            (string) auth()->id()
        );

        return back()->with('bulk_result', $result);
    }
}
