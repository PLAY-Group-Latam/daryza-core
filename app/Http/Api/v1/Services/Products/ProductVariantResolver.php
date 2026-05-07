<?php

namespace App\Http\Api\v1\Services\Products;

use App\Domain\Products\AvailabilityResolver;
use App\Domain\Products\VariantIndexBuilder;
use App\Models\Products\ProductPack;
use App\Models\Products\ProductVariant;
use Illuminate\Support\Collection;

class ProductVariantResolver
{
    public function __construct(
        protected VariantIndexBuilder $indexBuilder,
        protected AvailabilityResolver $availabilityResolver,
    ) {}

    private function checkPromoValidity(?bool $isOnPromo, $promoPrice, $start, $end): bool
    {
        if (!$isOnPromo || empty($promoPrice)) {
            return false;
        }

        $now = now();
        $hasStarted = is_null($start) || $start <= $now;
        $hasNotEnded = is_null($end) || $end >= $now;

        return $hasStarted && $hasNotEnded;
    }

    public function isPromoActive(ProductVariant $variant): bool
    {
        return $this->checkPromoValidity(
            $variant->is_on_promo,
            $variant->promo_price,
            $variant->promo_start_at,
            $variant->promo_end_at
        );
    }

    public function isPackPromoActive(ProductPack $pack): bool
    {
        return $this->checkPromoValidity(
            $pack->is_on_promotion,
            $pack->promo_price,
            $pack->promo_start_at,
            $pack->promo_end_at
        );
    }

    public function resolvePriceData(ProductVariant $variant): array
    {
        $hasPromo = $this->isPromoActive($variant);

        return [
            'price' => $variant->price,
            'promo_price' => $hasPromo ? $variant->promo_price : null,
            'is_on_promo' => $hasPromo,
            'active_price' => $hasPromo ? $variant->promo_price : $variant->price,
            'promo_start_at' => $variant->promo_start_at,
            'promo_end_at' => $variant->promo_end_at,
        ];
    }

    public function resolvePackPriceData(ProductPack $pack): array
    {
        $hasPromo = $this->isPackPromoActive($pack);
        $finalPrice = $hasPromo ? $pack->promo_price : $pack->price;

        return [
            'price' => $pack->price,
            'promo_price' => $hasPromo ? $pack->promo_price : null,
            'is_on_promotion' => $hasPromo,
            'active_price' => $finalPrice,
            'final_price' => $finalPrice,
            'promo_start_at' => $pack->promo_start_at,
            'promo_end_at' => $pack->promo_end_at,
        ];
    }

    public function resolveShowState(
        Collection $variants,
        ?string $requestedVariantId = null
    ): array {
        $mappedVariants = $this->mapVariantsForEngine($variants);
        $index = $this->indexBuilder->build($mappedVariants);

        $requestedVariantId = is_string($requestedVariantId) && $requestedVariantId !== '' ? $requestedVariantId : null;
        $activeVariantId = ($requestedVariantId !== null && isset($index->variantsById[$requestedVariantId]))
            ? $requestedVariantId
            : $index->mainVariantId();

        if ($activeVariantId !== null && isset($index->variantsById[$activeVariantId])) {
            $normalizedSelected = $index->variantsById[$activeVariantId]['value_ids'];
        } else {
            $normalizedSelected = [];
        }

        $selectedByAttribute = $this->buildSelectedByAttribute($normalizedSelected, $index->attributeByValueId);

        $activeVariant = $activeVariantId
            ? $variants->firstWhere('id', $activeVariantId)
            : null;
        $resolvedSelectedByAttribute = $activeVariantId && isset($index->variantsById[$activeVariantId])
            ? $this->buildSelectedByAttribute($index->variantsById[$activeVariantId]['value_ids'], $index->attributeByValueId)
            : $selectedByAttribute;

        return [
            'active_variant' => $activeVariant,
            'primary_attribute_id' => $index->primaryAttributeId,
            'variant_availability_matrix' => $this->availabilityResolver->buildMatrix($index, $resolvedSelectedByAttribute, $activeVariantId),
        ];
    }

    private function mapVariantsForEngine(Collection $variants): array
    {
        return $variants->map(function (ProductVariant $variant) {
            return [
                'id' => $variant->id,
                'is_main' => (bool) $variant->is_main,
                'selections' => $variant->selections
                    ->filter(
                        fn($selection) =>
                        $selection->attributeValue &&
                            $selection->attributeValue->attribute
                    )
                    ->map(fn($selection) => [
                        'attribute_id' => $selection->attributeValue->attribute_id,
                        'attribute_name' => $selection->attributeValue->attribute->name,
                        'attribute_value_id' => $selection->attribute_value_id,
                        'value' => $selection->attributeValue->value,
                    ])->values()->all(),
            ];
        })->values()->all();
    }

    /** @return array<string,string> */
    private function buildSelectedByAttribute(array $selectedValueIds, array $attributeByValueId): array
    {
        $selectedByAttribute = [];

        foreach ($selectedValueIds as $valueId) {
            $attributeId = $attributeByValueId[$valueId] ?? null;
            if ($attributeId !== null) {
                $selectedByAttribute[$attributeId] = $valueId;
            }
        }

        return $selectedByAttribute;
    }

}
