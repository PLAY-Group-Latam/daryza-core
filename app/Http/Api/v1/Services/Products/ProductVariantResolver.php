<?php

namespace App\Http\Api\v1\Services\Products;

use App\Domain\Products\VariantSelectionEngine;
use App\Models\Products\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class ProductVariantResolver
{
    public function __construct(
        protected VariantSelectionEngine $engine
    ) {}

    /**
     * Orquesta la resolución completa para el show de producto.
     *
     * @param  Collection<int, ProductVariant>  $variants
     * @param  array<int, string>  $selectedValueIds
     * @return array{
     *   active_variant: ProductVariant|null,
     *   variant_availability_matrix: array<int, array<string, mixed>>,
     *   selection_state: array{
     *     requested: array{attrs: array<int, string>, focus: string|null},
     *     resolved: array{variant_id: string|null, attrs: array<int, string>},
     *     mode: string,
     *     is_exact_match: bool
     *   }
     * }
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
     * Parsea attrs desde query:
     * - ?attrs=id1,id2
     *
     * @return array<int, string>
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
     * @param  Collection<int, ProductVariant>  $variants
     * @return array<int, array{
     *   id: string,
     *   is_main: bool,
     *   selections: array<int, array{
     *     attribute_id: string,
     *     attribute_name: string,
     *     attribute_value_id: string,
     *     value: string
     *   }>
     * }>
     */
    private function mapVariantsForEngine(Collection $variants): array
    {
        return $variants->map(function (ProductVariant $variant) {
            return [
                'id' => $variant->id,
                'is_main' => (bool) $variant->is_main,
                'selections' => $variant->selections
                    ->filter(fn($selection) => $selection->attributeValue && $selection->attributeValue->attribute)
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
