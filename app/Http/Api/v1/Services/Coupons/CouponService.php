<?php

namespace App\Http\Api\v1\Services\Coupons;

use App\Enums\Coupon\CouponScope;
use App\Models\Coupons\Coupon;
use App\Models\Products\DynamicCategoryItem;
use App\Models\Products\ProductPack;
use App\Models\Products\ProductVariant;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class CouponService
{
    public function listCouponsForContext(int $perPage = 10, ?string $customerId = null): LengthAwarePaginator
    {
        $now = now();

        $query = Coupon::query()
            ->select([
                'id',
                'code',
                'description',
                'discount_type',
                'discount_amount',
                'maximum_discount_amount',
                'minimum_order_amount',
                'scope',
                'is_active',
                'is_public',
                'usage_limit',
                'usage_limit_per_user',
                'valid_from',
                'valid_until',
            ])
            ->where('is_active', true)
            ->where(function ($query) use ($now) {
                $query->whereNull('valid_from')->orWhere('valid_from', '<=', $now);
            })
            ->where(function ($query) use ($now) {
                $query->whereNull('valid_until')->orWhere('valid_until', '>=', $now);
            })
            ->where(function ($query) use ($customerId) {
                $query
                    ->where(function ($publicQuery) {
                        $publicQuery
                            ->where('is_public', true)
                            ->where('scope', '!=', CouponScope::Customer->value);
                    });

                if ($customerId) {
                    $query->orWhere(function ($customerScopeQuery) use ($customerId) {
                        $customerScopeQuery
                            ->where('scope', CouponScope::Customer->value)
                            ->whereHas('customers', function ($customerQuery) use ($customerId) {
                                $customerQuery->where('customers.id', $customerId);
                            });
                    });
                }
            })
            ->orderByDesc('created_at')
            ->withCount('redemptions as usage_count');

        if ($customerId) {
            $query->withCount([
                'redemptions as usage_count_by_customer' => function ($redemptionQuery) use ($customerId) {
                    $redemptionQuery->where('customer_id', $customerId);
                },
            ]);
        }

        return $query
            ->paginate($perPage)
            ->through(fn(Coupon $coupon) => [
                'id' => $coupon->id,
                'code' => $coupon->code,
                'description' => $coupon->description,
                'discount_type' => $coupon->discount_type,
                'discount_amount' => (float) $coupon->discount_amount,
                'maximum_discount_amount' => $coupon->maximum_discount_amount !== null
                    ? (float) $coupon->maximum_discount_amount
                    : null,
                'minimum_order_amount' => (float) $coupon->minimum_order_amount,
                'scope' => $coupon->scope,
                'is_active' => (bool) $coupon->is_active,
                'is_public' => (bool) $coupon->is_public,
                'usage_limit' => $coupon->usage_limit,
                'usage_limit_per_user' => $coupon->usage_limit_per_user,
                'valid_from' => $coupon->valid_from?->toIso8601String(),
                'valid_until' => $coupon->valid_until?->toIso8601String(),
                'usage_count' => (int) ($coupon->usage_count ?? 0),
                'usage_count_by_customer' => $customerId ? (int) ($coupon->usage_count_by_customer ?? 0) : null,
                'remaining_usage_global' => is_null($coupon->usage_limit)
                    ? null
                    : max(0, (int) $coupon->usage_limit - (int) ($coupon->usage_count ?? 0)),
                'remaining_usage_by_customer' => $customerId && !is_null($coupon->usage_limit_per_user)
                    ? max(0, (int) $coupon->usage_limit_per_user - (int) ($coupon->usage_count_by_customer ?? 0))
                    : null,
            ]);
    }

    public function validateForOrder(
        string $couponCode,
        Collection $variants,
        array $items,
        ?string $customerId = null,
        bool $lockCoupon = false,
        ?Collection $packs = null
    ): array {
        $packs ??= collect();
        $normalizedCode = strtoupper(trim($couponCode));

        if ($normalizedCode === '') {
            throw new \InvalidArgumentException('El código de cupón es obligatorio.');
        }

        $couponQuery = Coupon::query()
            ->whereRaw('UPPER(code) = ?', [$normalizedCode])
            ->with(['products:id', 'categories:id', 'packs:id', 'businessDynamics:id', 'customers:id']);

        if ($lockCoupon) {
            $couponQuery->lockForUpdate();
        }

        /** @var Coupon|null $coupon */
        $coupon = $couponQuery->first();

        if (!$coupon) {
            throw new \InvalidArgumentException('El cupón no existe.');
        }

        if (!$coupon->isActive()) {
            throw new \InvalidArgumentException('El cupón no está activo o está fuera de vigencia.');
        }

        if (!$coupon->isUsable()) {
            throw new \InvalidArgumentException('El cupón alcanzó su límite de uso.');
        }

        if ($customerId) {
            if (!$coupon->isUsableByUser($customerId)) {
                throw new \InvalidArgumentException('Este cupón alcanzó su límite por usuario.');
            }
        } elseif ($coupon->scope === CouponScope::Customer->value) {
            throw new \InvalidArgumentException('Este cupón requiere un cliente autenticado.');
        }

        if (
            $coupon->scope === CouponScope::Customer->value
            && $customerId
            && !$coupon->customers->contains('id', $customerId)
        ) {
            throw new \InvalidArgumentException('Este cupón no está disponible para este cliente.');
        }

        $subtotal = $this->calculateSubtotal($variants, $packs, $items);

        if ((float) $coupon->minimum_order_amount > $subtotal) {
            throw new \InvalidArgumentException('No se alcanzó el monto mínimo para aplicar el cupón.');
        }

        $discountableSubtotal = $this->resolveDiscountableSubtotal($coupon, $variants, $packs, $items);

        if ($discountableSubtotal <= 0) {
            throw new \InvalidArgumentException('El cupón no aplica a los productos de la orden.');
        }

        $discount = $this->calculateDiscount($coupon, $discountableSubtotal, $subtotal);

        return [
            'coupon' => $coupon,
            'coupon_id' => $coupon->id,
            'coupon_code' => $coupon->code,
            'scope' => $coupon->scope,
            'discount_type' => $coupon->discount_type,
            'discount_amount' => (float) $coupon->discount_amount,
            'discountable_subtotal' => round($discountableSubtotal, 2),
            'discount_total' => round($discount, 2),
        ];
    }

    private function calculateSubtotal(Collection $variants, Collection $packs, array $items): float
    {
        $subtotal = 0.0;

        foreach ($items as $item) {
            $quantity = (int) ($item['quantity'] ?? 0);
            if ($quantity <= 0) {
                continue;
            }

            $itemType = (string) ($item['item_type'] ?? '');

            if ($itemType === 'product_pack') {
                /** @var ProductPack|null $pack */
                $pack = $packs->get((string) ($item['pack_id'] ?? ''));
                if (!$pack) {
                    continue;
                }

                $subtotal += ((float) $pack->active_price) * $quantity;
                continue;
            }

            /** @var ProductVariant|null $variant */
            $variant = $variants->get((string) ($item['variant_id'] ?? ''));
            if (!$variant) {
                continue;
            }

            $subtotal += ((float) $variant->active_price) * $quantity;
        }

        return round($subtotal, 2);
    }

    private function resolveDiscountableSubtotal(Coupon $coupon, Collection $variants, Collection $packs, array $items): float
    {
        return match ($coupon->scope) {
            CouponScope::Global->value, CouponScope::Customer->value => $this->calculateSubtotal($variants, $packs, $items),
            CouponScope::Product->value => $this->subtotalByProductScope($coupon, $variants, $items),
            CouponScope::Category->value => $this->subtotalByCategoryScope($coupon, $variants, $items),
            CouponScope::BusinessDynamic->value => $this->subtotalByBusinessDynamicScope($coupon, $variants, $items),
            CouponScope::Pack->value => $this->subtotalByPackScope($coupon, $packs, $items),
            default => 0.0,
        };
    }

    private function subtotalByProductScope(Coupon $coupon, Collection $variants, array $items): float
    {
        $allowedProductIds = $coupon->products->pluck('id')->all();

        return $this->subtotalMatching($variants, $items, function (ProductVariant $variant) use ($allowedProductIds) {
            return in_array($variant->product_id, $allowedProductIds, true);
        });
    }

    private function subtotalByCategoryScope(Coupon $coupon, Collection $variants, array $items): float
    {
        $allowedCategoryIds = $coupon->categories->pluck('id')->all();

        return $this->subtotalMatching($variants, $items, function (ProductVariant $variant) use ($allowedCategoryIds) {
            $categoryIds = $variant->product?->categories?->pluck('id')->all() ?? [];
            return count(array_intersect($categoryIds, $allowedCategoryIds)) > 0;
        });
    }

    private function subtotalByBusinessDynamicScope(Coupon $coupon, Collection $variants, array $items): float
    {
        $allowedDynamicCategoryIds = $coupon->businessDynamics->pluck('id')->all();

        if (empty($allowedDynamicCategoryIds)) {
            return 0.0;
        }

        $allowedProductIds = DynamicCategoryItem::query()
            ->whereIn('dynamic_category_id', $allowedDynamicCategoryIds)
            ->pluck('product_id')
            ->filter()
            ->unique()
            ->values()
            ->all();

        if (empty($allowedProductIds)) {
            return 0.0;
        }

        return $this->subtotalMatching($variants, $items, function (ProductVariant $variant) use ($allowedProductIds) {
            return in_array($variant->product_id, $allowedProductIds, true);
        });
    }

    private function subtotalByPackScope(Coupon $coupon, Collection $packs, array $items): float
    {
        $packIds = $coupon->packs->pluck('id')->all();
        if (empty($packIds)) {
            return 0.0;
        }

        $subtotal = 0.0;
        $allowedPackIds = array_map('strval', $packIds);

        foreach ($items as $item) {
            if (($item['item_type'] ?? null) !== 'product_pack') {
                continue;
            }

            $packId = (string) ($item['pack_id'] ?? '');
            if (!in_array($packId, $allowedPackIds, true)) {
                continue;
            }

            /** @var ProductPack|null $pack */
            $pack = $packs->get($packId);
            if (!$pack) {
                continue;
            }

            $subtotal += ((float) $pack->active_price) * (int) ($item['quantity'] ?? 0);
        }

        return round($subtotal, 2);
    }

    private function subtotalMatching(Collection $variants, array $items, callable $predicate): float
    {
        $subtotal = 0.0;

        foreach ($items as $item) {
            /** @var ProductVariant $variant */
            $variant = $variants->get($item['variant_id']);

            if (!$predicate($variant)) {
                continue;
            }

            $subtotal += ((float) $variant->active_price) * (int) $item['quantity'];
        }

        return round($subtotal, 2);
    }

    private function calculateDiscount(Coupon $coupon, float $discountableSubtotal, float $subtotal): float
    {
        $discount = $coupon->discount_type === 'percentage'
            ? ($discountableSubtotal * ((float) $coupon->discount_amount / 100))
            : (float) $coupon->discount_amount;

        if ($coupon->discount_type === 'percentage' && !is_null($coupon->maximum_discount_amount)) {
            $discount = min($discount, (float) $coupon->maximum_discount_amount);
        }

        return max(0.0, min(round($discount, 2), $subtotal));
    }
}
