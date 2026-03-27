<?php

namespace App\Http\Api\v1\Services\Coupons;

use App\Enums\Coupon\CouponScope;
use App\Models\Coupons\Coupon;
use App\Models\Products\ProductPackItem;
use App\Models\Products\ProductVariant;
use Illuminate\Support\Collection;

class CouponService
{
    public function validateForOrder(
        string $couponCode,
        Collection $variants,
        array $items,
        ?string $customerId = null,
        bool $lockCoupon = false
    ): array {
        $normalizedCode = strtoupper(trim($couponCode));

        if ($normalizedCode === '') {
            throw new \InvalidArgumentException('El código de cupón es obligatorio.');
        }

        $couponQuery = Coupon::query()
            ->whereRaw('UPPER(code) = ?', [$normalizedCode])
            ->with(['products:id', 'categories:id', 'packs:id', 'businessLines:id', 'customers:id']);

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

        $subtotal = $this->calculateSubtotal($variants, $items);

        if ((float) $coupon->minimum_order_amount > $subtotal) {
            throw new \InvalidArgumentException('No se alcanzó el monto mínimo para aplicar el cupón.');
        }

        $discountableSubtotal = $this->resolveDiscountableSubtotal($coupon, $variants, $items);

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

    private function calculateSubtotal(Collection $variants, array $items): float
    {
        $subtotal = 0.0;

        foreach ($items as $item) {
            /** @var ProductVariant $variant */
            $variant = $variants->get($item['variant_id']);
            $subtotal += ((float) $variant->active_price) * (int) $item['quantity'];
        }

        return round($subtotal, 2);
    }

    private function resolveDiscountableSubtotal(Coupon $coupon, Collection $variants, array $items): float
    {
        return match ($coupon->scope) {
            CouponScope::Global->value, CouponScope::Customer->value => $this->calculateSubtotal($variants, $items),
            CouponScope::Product->value => $this->subtotalByProductScope($coupon, $variants, $items),
            CouponScope::Category->value => $this->subtotalByCategoryScope($coupon, $variants, $items),
            CouponScope::BusinessLine->value => $this->subtotalByBusinessLineScope($coupon, $variants, $items),
            CouponScope::Pack->value => $this->subtotalByPackScope($coupon, $variants, $items),
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

    private function subtotalByBusinessLineScope(Coupon $coupon, Collection $variants, array $items): float
    {
        $allowedBusinessLineIds = $coupon->businessLines->pluck('id')->all();

        return $this->subtotalMatching($variants, $items, function (ProductVariant $variant) use ($allowedBusinessLineIds) {
            $businessLineIds = $variant->product?->businessLines?->pluck('id')->all() ?? [];
            return count(array_intersect($businessLineIds, $allowedBusinessLineIds)) > 0;
        });
    }

    private function subtotalByPackScope(Coupon $coupon, Collection $variants, array $items): float
    {
        $packIds = $coupon->packs->pluck('id')->all();
        if (empty($packIds)) {
            return 0.0;
        }

        $variantIdsInCouponPacks = ProductPackItem::query()
            ->whereIn('product_pack_id', $packIds)
            ->pluck('variant_id')
            ->filter()
            ->unique()
            ->values()
            ->all();

        return $this->subtotalMatching($variants, $items, function (ProductVariant $variant) use ($variantIdsInCouponPacks) {
            return in_array($variant->id, $variantIdsInCouponPacks, true);
        });
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
