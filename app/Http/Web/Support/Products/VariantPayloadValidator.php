<?php

namespace App\Http\Web\Support\Products;

use App\Models\Products\AttributesValue;
use App\Models\Products\Product;
use App\Models\Products\ProductVariant;
use Illuminate\Support\Collection;
use Illuminate\Validation\Validator;

class VariantPayloadValidator
{
    /**
     * Valida coherencia de variantes para create/update.
     *
     * @param  array<int, array<string, mixed>>  $variants
     * @param  array<int, string>  $selectedVariantAttributeIds
     */
    public function validate(
        Validator $validator,
        array $variants,
        array $selectedVariantAttributeIds = [],
        ?Product $product = null,
        bool $validateSkuInDatabase = false
    ): void {
        $attributeValueAttributeMap = $this->buildAttributeValueAttributeMap($variants);

        $seenCombinations = [];
        foreach ($variants as $variantIndex => $variant) {
            $variantId = $variant['id'] ?? null;
            $sku = trim((string) ($variant['sku'] ?? ''));
            $attributes = collect($variant['attributes'] ?? []);

            $this->validateVariantBelongsToProduct(
                $validator,
                $product,
                $variantId,
                $variantIndex
            );

            $this->validateSku(
                $validator,
                $sku,
                $variantId,
                $variantIndex,
                $product,
                $validateSkuInDatabase
            );

            $this->validateDuplicatedAttributes($validator, $attributes, $variantIndex);
            $this->validateAttributeValueBelongsToAttribute(
                $validator,
                $attributes,
                $variantIndex,
                $attributeValueAttributeMap
            );
            $this->validateRequiredVariantAttributes(
                $validator,
                $attributes,
                $variantIndex,
                $selectedVariantAttributeIds
            );
            $this->validateDuplicatedCombinations(
                $validator,
                $attributes,
                $variantIndex,
                $seenCombinations
            );
        }
    }

    /**
     * @param  array<int, array<string, mixed>>  $variants
     * @return Collection<string, string>
     */
    private function buildAttributeValueAttributeMap(array $variants): Collection
    {
        $attributeValueIds = collect($variants)
            ->flatMap(fn($variant) => collect($variant['attributes'] ?? [])->pluck('attribute_value_id'))
            ->filter()
            ->unique()
            ->values()
            ->all();

        return AttributesValue::query()
            ->whereIn('id', $attributeValueIds)
            ->pluck('attribute_id', 'id');
    }

    private function validateVariantBelongsToProduct(
        Validator $validator,
        ?Product $product,
        ?string $variantId,
        int $variantIndex
    ): void {
        if (!$variantId || !$product) {
            return;
        }

        if ($product->variants()->where('id', $variantId)->doesntExist()) {
            $validator->errors()->add(
                "variants.$variantIndex.id",
                'La variante no pertenece al producto que estás editando.'
            );
        }
    }

    private function validateSku(
        Validator $validator,
        string $sku,
        ?string $variantId,
        int $variantIndex,
        ?Product $product,
        bool $validateSkuInDatabase
    ): void {
        if ($sku === '') {
            return;
        }

        if (!$validateSkuInDatabase) {
            return;
        }

        $skuInUse = ProductVariant::withTrashed()
            ->where('sku', $sku)
            ->when($product, fn($q) => $q->where('product_id', '!=', $product->id))
            ->when($variantId, fn($q) => $q->where('id', '!=', $variantId))
            ->exists();

        if ($skuInUse) {
            $validator->errors()->add(
                "variants.$variantIndex.sku",
                'El SKU ya está en uso por otra variante.'
            );
        }
    }

    /**
     * @param  Collection<int, array<string, mixed>>  $attributes
     */
    private function validateDuplicatedAttributes(
        Validator $validator,
        Collection $attributes,
        int $variantIndex
    ): void {
        $attributeIdsInVariant = $attributes
            ->pluck('attribute_id')
            ->filter()
            ->values()
            ->all();

        if (count($attributeIdsInVariant) !== count(array_unique($attributeIdsInVariant))) {
            $validator->errors()->add(
                "variants.$variantIndex.attributes",
                'Una variante no puede repetir el mismo atributo.'
            );
        }
    }

    /**
     * @param  Collection<int, array<string, mixed>>  $attributes
     * @param  Collection<string, string>  $attributeValueAttributeMap
     */
    private function validateAttributeValueBelongsToAttribute(
        Validator $validator,
        Collection $attributes,
        int $variantIndex,
        Collection $attributeValueAttributeMap
    ): void {
        foreach ($attributes as $attrIndex => $attr) {
            $attributeId = $attr['attribute_id'] ?? null;
            $attributeValueId = $attr['attribute_value_id'] ?? null;

            if (!$attributeId || !$attributeValueId) {
                continue;
            }

            $isValidPair = ($attributeValueAttributeMap[$attributeValueId] ?? null) === $attributeId;
            if (!$isValidPair) {
                $validator->errors()->add(
                    "variants.$variantIndex.attributes.$attrIndex.attribute_value_id",
                    'El valor seleccionado no pertenece al atributo indicado.'
                );
            }
        }
    }

    /**
     * @param  Collection<int, array<string, mixed>>  $attributes
     * @param  array<int, string>  $selectedVariantAttributeIds
     */
    private function validateRequiredVariantAttributes(
        Validator $validator,
        Collection $attributes,
        int $variantIndex,
        array $selectedVariantAttributeIds
    ): void {
        if (empty($selectedVariantAttributeIds)) {
            return;
        }

        $valueByAttribute = $attributes
            ->filter(fn($a) => !empty($a['attribute_id']))
            ->mapWithKeys(fn($a) => [$a['attribute_id'] => $a['attribute_value_id'] ?? null]);

        foreach ($selectedVariantAttributeIds as $requiredAttributeId) {
            if (empty($valueByAttribute[$requiredAttributeId])) {
                $validator->errors()->add(
                    "variants.$variantIndex.attributes",
                    'Cada variante debe definir todos los atributos de variante seleccionados.'
                );
                break;
            }
        }
    }

    /**
     * @param  Collection<int, array<string, mixed>>  $attributes
     * @param  array<string, int>  $seenCombinations
     */
    private function validateDuplicatedCombinations(
        Validator $validator,
        Collection $attributes,
        int $variantIndex,
        array &$seenCombinations
    ): void {
        $combinationIds = $attributes
            ->pluck('attribute_value_id')
            ->filter()
            ->sort()
            ->values()
            ->all();

        $signature = empty($combinationIds)
            ? '__no_variant_attributes__'
            : implode('|', $combinationIds);

        if (isset($seenCombinations[$signature])) {
            $validator->errors()->add(
                "variants.$variantIndex.attributes",
                'Existe otra variante con la misma combinación de atributos.'
            );
            return;
        }

        $seenCombinations[$signature] = $variantIndex;
    }
}
