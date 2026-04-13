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
use Illuminate\Support\Facades\Log;
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

        $map = [
            ProductController::class . '@show'             => 'product_view',
            ProductController::class . '@showPack'         => 'pack_view', // ← CAMBIADO para diferenciarlo
            CartController::class . '@add'                 => 'add_to_cart',
            WishListController::class . '@toggle'          => 'wishlist_toggle',
            CouponController::class . '@validateCoupon'    => 'coupon_attempt',
            OrderController::class . '@store'              => 'order_placed',
            OrderController::class . '@uploadPaymentProof' => 'voucher_upload',
            PaymentController::class . '@confirmPayment'   => 'payment_result_success',
        ];

        if (isset($map[$action])) {
            $eventType  = $map[$action];
            
            // 1. INTENTO DE CAPTURA DEL USUARIO LOGEADO EN RUTAS PÚBLICAS
            $customerId = Auth::guard('api')->id();

            if (!$customerId && $request->bearerToken()) {
                try {
                    // Si la ruta no está protegida por auth:api, forzamos a Sanctum/JWT a leer el token
                    $user = Auth::guard('api')->user(); 
                    $customerId = $user ? $user->id : null;
                    
                    if ($customerId) {
                        Log::info('[TrackApiEvents] Usuario rescatado mediante Bearer Token en ruta pública.', [
                            'customer_id' => $customerId
                        ]);
                    }
                } catch (\Exception $e) {
                    Log::error('[TrackApiEvents] Error intentando rescatar usuario del token: ' . $e->getMessage());
                }
            }

            $sessionId = $request->hasSession() ? $request->session()->getId() : null;

            // Log de depuración para saber exactamente qué valores se mandan al Job
            Log::info('[TrackApiEvents] Evento detectado para despachar:', [
                'action'      => $action,
                'event_type'  => $eventType,
                'customer_id' => $customerId,
                'session_id'  => $sessionId,
            ]);

            $payload = $this->extractPayload($action, $eventType, $request, $response);

            // Evitamos despachar si el payload viene vacío (por ejemplo, fallos de parseo de JSON)
            if (empty($payload)) {
                Log::warning('[TrackApiEvents] No se despachó el evento porque el payload está vacío.', [
                    'event_type' => $eventType
                ]);
            } else {
                TrackEventJob::dispatch([
                    'customer_id' => $customerId,
                    'session_id'  => $sessionId,
                    'event_type'  => $eventType,
                    'event_data'  => $payload,
                ]);
            }

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
            'product_view'           => $this->formatProductView($response),
            'pack_view'              => $this->formatPackView($response), // ← NUEVO MÉTODO
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
    // PRODUCTOS Y PACKS
    // ─────────────────────────────────────────────

    private function formatProductView(Response $response): array
    {
        $content = json_decode($response->getContent(), true);
        $data    = $content['data'] ?? null;

        if (!$data) return [];

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

    private function formatPackView(Response $response): array
    {
        $content = json_decode($response->getContent(), true);
        $data    = $content['data'] ?? null;

        if (!$data) return [];

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
        $action  = $content['data']['action'] ?? null;
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
            'code'     => $request->input('coupon_code') ?? $request->input('code') ?? $request->input('coupon'),
            'success'  => $content['success']         ?? false,
            'message'  => $content['message']          ?? '',
            'discount' => $content['data']['discount_total'] ?? $content['data']['discount'] ?? $content['data']['amount'] ?? null,
            'type'     => $content['data']['discount_type'] ?? $content['data']['type'] ?? null,
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
            'order_code'     => $order['code']           ?? $order['order_code'] ?? null,
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
            
            Log::info('[TrackApiEvents] Eventos de sesión sincronizados con el cliente.', [
                'customer_id' => $customerId,
                'session_id'  => $sessionId
            ]);
        }
    }
}
