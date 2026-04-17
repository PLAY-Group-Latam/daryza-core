<?php

namespace App\Http\Api\v1\Controllers\Coupons;

use App\Http\Api\v1\Controllers\Controller;
use App\Http\Api\v1\Requests\Coupons\ValidateCouponRequest;
use App\Http\Api\v1\Services\Coupons\CouponService;
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
        $variantIds = collect($items)->pluck('variant_id')->unique()->values();

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

        try {
            $result = $this->couponService->validateForOrder(
                $payload['coupon_code'],
                $variants,
                $items,
                (string) auth('api')->id()
            );

            return $this->success('Cupon validado correctamente.', collect($result)->except(['coupon'])->all());
        } catch (\InvalidArgumentException $exception) {
            return $this->error($exception->getMessage(), null, 422);
        }
    }

    private function normalizeItems(array $items): array
    {
        return collect($items)
            ->groupBy('variant_id')
            ->map(fn($group, $variantId) => [
                'variant_id' => (string) $variantId,
                'quantity' => $group->sum(fn($item) => (int) ($item['quantity'] ?? 0)),
            ])
            ->filter(fn($item) => $item['quantity'] > 0)
            ->values()
            ->all();
    }
}
