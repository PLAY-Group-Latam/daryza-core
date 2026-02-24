<?php

namespace App\Http\Api\v1\Services\Products;

use App\Models\Products\Product;
use App\Models\Products\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class ProductVariantResolver
{
    /**
     * Parsea attribute_value_ids desde query:
     * - ?attribute_value_ids[]=id1&attribute_value_ids[]=id2
     * - ?attribute_value_ids=id1,id2
     *
     * @return array<int, string>
     */
    public function parseSelectedAttributeValueIds(Request $request): array
    {
        $raw = $request->query('attribute_value_ids', []);

        if (is_string($raw)) {
            $raw = array_filter(array_map('trim', explode(',', $raw)));
        }

        if (!is_array($raw)) {
            return [];
        }

        return array_values(array_unique(array_filter(
            $raw,
            fn($v) => is_string($v) && $v !== ''
        )));
    }

    public function resolveActiveVariant(
        Product $product,
        ?string $variantId,
        array $selectedValueIds
    ): ?ProductVariant {
        $variantQuery = $product->variants()
            ->where('is_active', true)
            ->select(
                'id',
                'product_id',
                'sku',
                'price',
                'promo_price',
                'is_on_promo',
                'promo_start_at',
                'promo_end_at',
                'stock',
                'is_main'
            );

        $allActiveVariants = (clone $variantQuery)
            ->with([
                'selections.attributeValue' => function ($q) {
                    $q->select('id', 'attribute_id', 'value');
                },
                'selections.attributeValue.attribute' => function ($q) {
                    $q->select('id', 'name');
                },
            ])
            ->orderBy('is_main', 'desc')
            ->orderBy('created_at', 'asc')
            ->orderBy('id', 'asc')
            ->get();

        if ($variantId) {
            $variant = (clone $variantQuery)->where('id', $variantId)->first();
            if ($variant) {
                return $variant;
            }
        } elseif (!empty($selectedValueIds)) {
            $matched = $allActiveVariants
                ->first(fn($v) => $this->variantMatchesSelection($v, $selectedValueIds));
            if ($matched) {
                return $matched;
            }
        }

        return (clone $variantQuery)->where('is_main', true)->first()
            ?? (clone $variantQuery)
                ->orderBy('created_at', 'asc')
                ->orderBy('id', 'asc')
                ->first();
    }

    /**
     * @param  Collection<int, ProductVariant>  $variants
     * @param  array<int, string>  $selectedValueIds
     * @return array<string, string>
     */
    public function buildSelectedByAttribute(
        Collection $variants,
        array $selectedValueIds,
        ?ProductVariant $activeVariant
    ): array {
        $selectedByAttribute = [];

        foreach ($selectedValueIds as $selectedValueId) {
            foreach ($variants as $selectorVariant) {
                foreach ($selectorVariant->selections as $selection) {
                    if (
                        $selection->attribute_value_id === $selectedValueId &&
                        $selection->attributeValue
                    ) {
                        $selectedByAttribute[$selection->attributeValue->attribute_id] = $selectedValueId;
                    }
                }
            }
        }

        if (empty($selectedByAttribute) && $activeVariant) {
            $activeVariant->loadMissing('selections.attributeValue');

            foreach ($activeVariant->selections as $selection) {
                if ($selection->attributeValue) {
                    $selectedByAttribute[$selection->attributeValue->attribute_id] = $selection->attribute_value_id;
                }
            }
        }

        return $selectedByAttribute;
    }

    /**
     * @param  Collection<int, ProductVariant>  $variants
     * @param  array<string, string>  $selectedByAttribute
     * @return array<int, array<string, mixed>>
     */
    public function buildAvailabilityMatrix(Collection $variants, array $selectedByAttribute): array
    {
        $optionCatalog = [];

        foreach ($variants as $variant) {
            foreach ($variant->selections as $selection) {
                $attributeValue = $selection->attributeValue;
                $attribute = $attributeValue?->attribute;
                if (!$attributeValue || !$attribute) {
                    continue;
                }

                $optionCatalog[$attribute->id]['attribute_id'] = $attribute->id;
                $optionCatalog[$attribute->id]['attribute_name'] = $attribute->name;
                $optionCatalog[$attribute->id]['options'][$attributeValue->id] = [
                    'attribute_value_id' => $attributeValue->id,
                    'value' => $attributeValue->value,
                ];
            }
        }

        $matrix = [];

        foreach ($optionCatalog as $attributeId => $axis) {
            $options = [];

            foreach ($axis['options'] as $candidateOption) {
                $isAvailable = false;

                foreach ($variants as $variant) {
                    $variantSelectionsByAttribute = $variant->selections
                        ->filter(fn($s) => $s->attributeValue)
                        ->mapWithKeys(fn($s) => [$s->attributeValue->attribute_id => $s->attribute_value_id])
                        ->all();

                    if (($variantSelectionsByAttribute[$attributeId] ?? null) !== $candidateOption['attribute_value_id']) {
                        continue;
                    }

                    $matchesCurrentSelection = true;
                    foreach ($selectedByAttribute as $selectedAttributeId => $selectedValueId) {
                        if ($selectedAttributeId === $attributeId) {
                            continue;
                        }

                        if (($variantSelectionsByAttribute[$selectedAttributeId] ?? null) !== $selectedValueId) {
                            $matchesCurrentSelection = false;
                            break;
                        }
                    }

                    if ($matchesCurrentSelection) {
                        $isAvailable = true;
                        break;
                    }
                }

                $options[] = [
                    'attribute_value_id' => $candidateOption['attribute_value_id'],
                    'value' => $candidateOption['value'],
                    'is_available' => $isAvailable,
                    'is_selected' => ($selectedByAttribute[$attributeId] ?? null) === $candidateOption['attribute_value_id'],
                ];
            }

            $matrix[] = [
                'attribute_id' => $axis['attribute_id'],
                'attribute_name' => $axis['attribute_name'],
                'options' => array_values($options),
            ];
        }

        return $matrix;
    }

    /**
     * @param  array<int, string>  $selectedValueIds
     */
    private function variantMatchesSelection(ProductVariant $variant, array $selectedValueIds): bool
    {
        if (empty($selectedValueIds)) {
            return true;
        }

        $variantValueIds = $variant->selections
            ->pluck('attribute_value_id')
            ->filter()
            ->values()
            ->all();

        foreach ($selectedValueIds as $selectedId) {
            if (!in_array($selectedId, $variantValueIds, true)) {
                return false;
            }
        }

        return true;
    }
}

