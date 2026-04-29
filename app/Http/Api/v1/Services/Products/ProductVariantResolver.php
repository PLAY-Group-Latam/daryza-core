<?php

namespace App\Http\Api\v1\Services\Products;

use App\Domain\Products\VariantSelectionEngine;
use App\Models\Products\ProductVariant;
use App\Models\Products\ProductPack;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class ProductVariantResolver
{
    public function __construct(
        protected VariantSelectionEngine $engine
    ) {}

    /**
     * Lógica interna compartida para validar promociones por fecha.
     */
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

    /**
     * Determina si una variante tiene una promoción válida.
     */
    public function isPromoActive(ProductVariant $variant): bool
    {
        return $this->checkPromoValidity(
            $variant->is_on_promo,
            $variant->promo_price,
            $variant->promo_start_at,
            $variant->promo_end_at
        );
    }

    /**
     * Determina si un pack tiene una promoción válida.
     */
    public function isPackPromoActive(ProductPack $pack): bool
    {
        return $this->checkPromoValidity(
            $pack->is_on_promotion,
            $pack->promo_price,
            $pack->promo_start_at,
            $pack->promo_end_at
        );
    }

    /**
     * Resuelve y estructura la información de precios para una variante.
     */
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

    /**
     * Resuelve y estructura la información de precios para un Pack.
     */
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

    /**
     * Orquesta la resolución completa para el detalle de producto.
     */
    public function resolveShowState(
        Collection $variants,
        array $selectedValueIds,
        ?string $focusValueId = null
    ): array {
        $engineState = $this->engine->resolve(
            $this->mapVariantsForEngine($variants),
            $selectedValueIds,
            $focusValueId
        );

        $activeVariant = $engineState['active_variant_id']
            ? $variants->firstWhere('id', $engineState['active_variant_id'])
            : null;

        return [
            'active_variant' => $activeVariant,
            'variant_availability_matrix' => $engineState['variant_availability_matrix'],
            'selection_state' => $engineState['selection_state'],
        ];
    }

    /**
     * Parsea attrs desde la query string: ?attrs=id1,id2
     */
    public function parseSelectedAttributeValueIds(Request $request): array
    {
        $raw = $request->query('attrs', []);
        $values = is_string($raw)
            ? explode(',', $raw)
            : (is_array($raw) ? $raw : []);

        return array_values(array_unique(array_filter(
            array_map(fn($v) => is_string($v) ? trim($v) : '', $values),
            fn($v) => $v !== ''
        )));
    }

    /**
     * Mapea variantes para el motor lógico de selección (Engine).
     */
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
}
