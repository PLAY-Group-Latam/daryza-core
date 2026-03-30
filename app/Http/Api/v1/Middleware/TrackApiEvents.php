<?php

namespace App\Http\Api\v1\Middleware;

use App\Models\Events\EventLog;
use App\Models\Products\ProductPack;
use App\Models\Products\ProductVariant;
use App\Jobs\Events\TrackEventJob;
use App\Http\Web\Services\Intention\PurchaseIntentionService;
use App\Http\Api\v1\Controllers\Products\ProductController;
use App\Http\Api\v1\Controllers\Customers\Cart\CartController;
use App\Http\Api\v1\Controllers\Coupons\CouponController;
use App\Http\Api\v1\Controllers\Orders\OrderController;
use App\Http\Api\v1\Controllers\Customers\WishList\WishListController;
use App\Http\Api\v1\Controllers\Payments\PaymentController;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class TrackApiEvents
{
    public function __construct(
        protected PurchaseIntentionService $purchaseIntentService
    ) {}

    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if (!$response->isSuccessful()) {
            return $response;
        }

        $action = $request->route()?->getActionName();
        \Illuminate\Support\Facades\Log::debug('[TrackApiEvents] action detectado:', [
        'action' => $action,
    ]);

        $map = [
            ProductController::class . '@show'             => 'product_view',
            ProductController::class . '@showPack'         => 'product_view',
            CartController::class . '@add'                 => 'add_to_cart',
            WishListController::class . '@toggle'          => 'wishlist_toggle',
            CouponController::class . '@validateCoupon'    => 'coupon_attempt',
            OrderController::class . '@store'              => 'order_placed',
            OrderController::class . '@uploadPaymentProof' => 'voucher_upload',
            PaymentController::class . '@confirmPayment'   => 'payment_result_success',
        ];

        if (isset($map[$action])) {
            $eventType  = $map[$action];
            $customerId = Auth::guard('api')->id();
            $sessionId  = $request->hasSession() ? $request->session()->getId() : null;

            $payload = $this->extractPayload($action, $eventType, $request, $response);

            TrackEventJob::dispatch([
                'customer_id' => $customerId,
                'session_id'  => $sessionId,
                'event_type'  => $eventType,
                'event_data'  => $payload,
            ]);

            $this->syncSessionEvents($request, $customerId, $sessionId);
        }

        return $response;
    }

    // ─────────────────────────────────────────────
    // DISPATCHER
    // ─────────────────────────────────────────────

    protected function extractPayload(string $action, string $eventType, Request $request, Response $response): array
    {
        return match ($eventType) {
            'product_view'           => $this->formatProductView($action, $response),
            'add_to_cart'            => $this->formatAddToCart($request),
            'wishlist_toggle'        => $this->formatWishlistToggle($request, $response),
            'coupon_attempt'         => $this->formatCouponAttempt($request, $response),
            'order_placed'           => $this->formatOrderPlaced($response),
            'voucher_upload'         => $this->formatVoucherUpload($request, $response),
            'payment_result_success' => $this->formatPaymentResult($response),
            default                  => [],
        };
    }

    // ─────────────────────────────────────────────
    // PRODUCTOS
    // ─────────────────────────────────────────────

    private function formatProductView(string $action, Response $response): array
    {
        $content = json_decode($response->getContent(), true);
        $data    = $content['data'] ?? null;

        if (!$data) return [];

        $isPack = str_contains($action, 'showPack');

        if ($isPack) {
            // showPack devuelve: { data: { pack: {...}, items: [...], pricing: {...} } }
            $pack = $data['pack'] ?? null;
            if (!$pack) return [];

            return [
                'product' => [
                    'name'  => $pack['name']  ?? 'N/A',
                    'sku'   => $pack['slug']  ?? 'N/A',
                    'price' => (float) ($pack['active_price'] ?? $pack['final_price'] ?? $pack['price'] ?? 0),
                    'type'  => 'pack',
                ],
            ];
        }

        // show devuelve: { data: { product: {...}, active_variant: {...} } }
        $product = $data['product']        ?? null;
        $variant = $data['active_variant'] ?? null;

        if (!$product) return [];

        return [
            'product' => [
                'name'  => $product['name'] ?? 'N/A',
                'sku'   => $variant['sku']  ?? 'N/A',
                'price' => (float) ($variant['active_price'] ?? $variant['price'] ?? 0),
                'type'  => 'specification',
            ],
        ];
    }

    // ─────────────────────────────────────────────
    // CARRITO
    // ─────────────────────────────────────────────

    private function formatAddToCart(Request $request): array
    {
        $itemId   = $request->input('item_id');
        $type     = $request->input('type');
        $quantity = (int) $request->input('quantity', 1);

        if (!$itemId || !$type) return [];

        $modelClass = ($type === 'pack') ? ProductPack::class : ProductVariant::class;

        $item = $modelClass::query()
            ->when($type !== 'pack', fn($q) => $q->with(['product', 'attributes']))
            ->find($itemId);

        if (!$item) return [];

        $data = [
            'name'     => ($type === 'pack') ? $item->name : ($item->product->name ?? 'Producto'),
            'sku'      => ($type === 'pack') ? $item->code : $item->sku,
            'price'    => (float) $item->active_price,
            'quantity' => $quantity,
            'type'     => $type,
        ];

        if ($type !== 'pack' && isset($item->attributes)) {
            $attrs         = $item->attributes->map(fn($a) => $a->value)->toArray();
            $data['size']  = $attrs[0] ?? null;
            $data['color'] = $attrs[1] ?? null;
        }

        return ['product' => $data];
    }

    // ─────────────────────────────────────────────
    // WISHLIST
    // ─────────────────────────────────────────────

    private function formatWishlistToggle(Request $request, Response $response): array
    {
        $content = json_decode($response->getContent(), true);

        $itemId  = $request->input('item_id') ?? $request->route('itemId');
        $type    = $request->input('type') ?? 'product';
        $action  = $content['data']['action'] ?? null; // 'added' | 'removed'
        $message = $content['message'] ?? '';

        $productName = null;
        if ($itemId) {
            $modelClass = ($type === 'pack') ? ProductPack::class : ProductVariant::class;
            $item = $modelClass::query()
                ->when($type !== 'pack', fn($q) => $q->with('product'))
                ->find($itemId);

            if ($item) {
                $productName = ($type === 'pack')
                    ? $item->name
                    : ($item->product->name ?? null);
            }
        }

        return [
            'action'  => $action,
            'message' => $message,
            'product' => $productName ? ['name' => $productName, 'type' => $type] : null,
        ];
    }

    // ─────────────────────────────────────────────
    // CUPONES
    // ─────────────────────────────────────────────

    private function formatCouponAttempt(Request $request, Response $response): array
    {
        $content = json_decode($response->getContent(), true);

        return [
            'code'     => $request->input('code')    ?? $request->input('coupon'),
            'success'  => $content['success']         ?? false,
            'message'  => $content['message']          ?? '',
            'discount' => $content['data']['discount'] ?? $content['data']['amount'] ?? null,
            'type'     => $content['data']['type']     ?? null,
        ];
    }

    // ─────────────────────────────────────────────
    // ÓRDENES
    // ─────────────────────────────────────────────

    private function formatOrderPlaced(Response $response): array
    {
        $content = json_decode($response->getContent(), true);
        $order   = $content['data'] ?? $content['order'] ?? [];

        return [
            'order_id'       => $order['id']             ?? $order['order_id']   ?? null,
            'order_code'     => $order['code']            ?? $order['order_code'] ?? null,
            'total'          => (float) ($order['total']  ?? 0),
            'payment_method' => $order['payment_method']  ?? null,
            'items'          => collect($order['items'] ?? [])->map(fn($item) => [
                'name'     => $item['name']     ?? 'N/A',
                'quantity' => $item['quantity'] ?? 1,
                'price'    => (float) ($item['price'] ?? 0),
            ])->toArray(),
        ];
    }

    private function formatVoucherUpload(Request $request, Response $response): array
    {
        $content = json_decode($response->getContent(), true);

        return [
            'order_id' => $request->route('orderId') ?? $request->route('id'),
            'message'  => $content['message'] ?? '',
        ];
    }

    // ─────────────────────────────────────────────
    // PAGOS
    // ─────────────────────────────────────────────

    private function formatPaymentResult(Response $response): array
    {
        $content = json_decode($response->getContent(), true);
        $data    = $content['data'] ?? [];

        return [
            'success'    => $content['success']     ?? false,
            'message'    => $content['message']      ?? '',
            'order_id'   => $data['order_id']        ?? null,
            'order_code' => $data['order_code']      ?? null,
            'amount'     => (float) ($data['amount'] ?? 0),
            'method'     => $data['payment_method']  ?? $data['method'] ?? null,
            'status'     => $data['status']           ?? null,
        ];
    }

    // ─────────────────────────────────────────────
    // SESIÓN
    // ─────────────────────────────────────────────

    private function syncSessionEvents(Request $request, $customerId, $sessionId): void
    {
        if ($customerId && $sessionId && !session()->get('events_synced')) {
            EventLog::where('session_id', $sessionId)
                ->whereNull('customer_id')
                ->update(['customer_id' => $customerId]);

            session()->put('events_synced', true);
        }
    }
}