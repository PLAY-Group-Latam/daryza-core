<?php

namespace App\Http\Api\v1\Controllers\Coupons;

use App\Http\Api\v1\Controllers\Controller;
use App\Http\Api\v1\Requests\Coupons\ValidateCouponRequest;
use App\Http\Api\v1\Services\Coupons\CouponService;
use App\Models\Products\ProductPack;
use App\Models\Products\ProductVariant;
use Illuminate\Http\Request;

class CouponController extends Controller
{
    public function __construct(protected CouponService $couponService) {}

    public function index(Request $request)
    {
        $perPage = (int) $request->input('per_page', 10);
        $customerId = auth('api')->id();
        $coupons = $this->couponService->listCouponsForContext(max(1, min($perPage, 50)), $customerId ? (string) $customerId : null);
        $message = $customerId
            ? 'Cupones disponibles del cliente obtenidos correctamente.'
            : 'Cupones públicos obtenidos correctamente.';

        return $this->success($message, $coupons);
    }

    public function validateCoupon(ValidateCouponRequest $request)
    {
        $payload = $request->validated();
        $items = $this->normalizeItems($payload['items']);
        $variantIds = collect($items)
            ->where('item_type', 'product_variant')
            ->pluck('variant_id')
            ->filter()
            ->unique()
            ->values();
        $packIds = collect($items)
            ->where('item_type', 'product_pack')
            ->pluck('pack_id')
            ->filter()
            ->unique()
            ->values();

        $variants = ProductVariant::query()
            ->whereIn('id', $variantIds)
            ->where('is_active', true)
            ->with([
                'product:id,name',
                'product.categories:id',
                'product.businessLines:id',
            ])
            ->get()
            ->keyBy('id');

        if ($variants->count() !== $variantIds->count()) {
            return $this->error('Uno o más productos no son válidos o no están activos.', null, 422);
        }

        $packs = ProductPack::query()
            ->whereIn('id', $packIds)
            ->where('is_active', true)
            ->get()
            ->keyBy('id');

        if ($packs->count() !== $packIds->count()) {
            return $this->error('Uno o más packs no son válidos o no están activos.', null, 422);
        }

        try {
            $result = $this->couponService->validateForOrder(
                $payload['coupon_code'],
                $variants,
                $items,
                (string) auth('api')->id(),
                false,
                $packs
            );

            return $this->success('Cupon validado correctamente.', collect($result)->except(['coupon'])->all());
        } catch (\InvalidArgumentException $exception) {
            return $this->error($exception->getMessage(), null, 422);
        }
    }

    private function normalizeItems(array $items): array
    {
        return collect($items)
            ->map(function ($item) {
                if (!is_array($item)) {
                    return null;
                }

                $type = (string) ($item['type'] ?? 'product');
                $quantity = (int) ($item['quantity'] ?? 0);

                if ($type === 'pack') {
                    $packId = trim((string) ($item['pack_id'] ?? $item['item_id'] ?? ''));
                    if ($packId === '' || $quantity <= 0) {
                        return null;
                    }

                    return [
                        'item_type' => 'product_pack',
                        'pack_id' => $packId,
                        'variant_id' => null,
                        'quantity' => $quantity,
                    ];
                }

                $variantId = trim((string) ($item['variant_id'] ?? $item['item_id'] ?? ''));
                if ($variantId === '' || $quantity <= 0) {
                    return null;
                }

                return [
                    'item_type' => 'product_variant',
                    'variant_id' => $variantId,
                    'pack_id' => null,
                    'quantity' => $quantity,
                ];
            })
            ->filter()
            ->groupBy(fn($item) => $item['item_type'] . ':' . ($item['variant_id'] ?? $item['pack_id']))
            ->map(function ($group) {
                $first = $group->first();

                return [
                    'item_type' => $first['item_type'],
                    'variant_id' => $first['variant_id'],
                    'pack_id' => $first['pack_id'],
                    'quantity' => (int) $group->sum('quantity'),
                ];
            })
            ->filter(fn($item) => $item['quantity'] > 0)
            ->values()
            ->all();
    }
}
