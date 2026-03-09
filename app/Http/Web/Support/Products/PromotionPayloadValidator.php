<?php

namespace App\Http\Web\Support\Products;

use Carbon\Carbon;
use Illuminate\Validation\Validator;

class PromotionPayloadValidator
{
    /**
     * @param array<int, array<string, mixed>> $variants
     */
    public function validate(Validator $validator, array $variants): void
    {
        foreach ($variants as $variantIndex => $variant) {
            $isOnPromo = filter_var($variant['is_on_promo'] ?? false, FILTER_VALIDATE_BOOLEAN);
            $price = isset($variant['price']) ? (float) $variant['price'] : null;
            $promoPrice = isset($variant['promo_price']) && $variant['promo_price'] !== ''
                ? (float) $variant['promo_price']
                : null;
            $promoStart = $variant['promo_start_at'] ?? null;
            $promoEnd = $variant['promo_end_at'] ?? null;

            if ($isOnPromo && $promoPrice === null) {
                $validator->errors()->add(
                    "variants.$variantIndex.promo_price",
                    'Debes indicar precio promocional cuando la variante está en promoción.'
                );
            }

            if ($promoPrice !== null && $price !== null && $promoPrice > $price) {
                $validator->errors()->add(
                    "variants.$variantIndex.promo_price",
                    'El precio promocional no puede ser mayor al precio base.'
                );
            }

            if (!empty($promoStart) && !empty($promoEnd)) {
                try {
                    $start = Carbon::parse($promoStart);
                    $end = Carbon::parse($promoEnd);
                    if ($end->lessThanOrEqualTo($start)) {
                        $validator->errors()->add(
                            "variants.$variantIndex.promo_end_at",
                            'La fecha fin debe ser posterior a la fecha inicio.'
                        );
                    }
                } catch (\Throwable $e) {
                    // Las reglas date del request ya cubren formatos inválidos.
                }
            }
        }
    }
}
