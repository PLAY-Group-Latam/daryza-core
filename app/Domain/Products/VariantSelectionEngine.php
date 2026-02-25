<?php

namespace App\Domain\Products;

class VariantSelectionEngine
{
    /**
     * @param  array<int, array{
     *   id: string,
     *   is_main: bool,
     *   selections: array<int, array{
     *     attribute_id: string,
     *     attribute_name: string,
     *     attribute_value_id: string,
     *     value: string
     *   }>
     * }>  $variants
     * @param  array<int, string>  $selectedValueIds
     * @return array{
     *   active_variant_id: string|null,
     *   variant_availability_matrix: array<int, array<string, mixed>>,
     *   selection_state: array<string, mixed>
     * }
     */
    public function resolve(array $variants, array $selectedValueIds, ?string $focusValueId = null): array
    {
        $normalizedSelected = $this->normalizeValueIds($selectedValueIds);
        [$variantCatalog, $optionCatalog, $attributeByValueId] = $this->buildCatalogs($variants);

        $decision = $this->resolveVariantDecision($variantCatalog, $normalizedSelected, $focusValueId);
        $activeVariantId = $decision['variant_id'];

        $selectedByAttribute = $this->buildSelectedByAttribute(
            $variantCatalog,
            $normalizedSelected,
            $activeVariantId,
            $attributeByValueId
        );

        return [
            'active_variant_id' => $activeVariantId,
            'variant_availability_matrix' => $this->buildAvailabilityMatrix(
                $variantCatalog,
                $optionCatalog,
                $selectedByAttribute
            ),
            'selection_state' => [
                'requested' => [
                    'attrs' => $normalizedSelected,
                    'focus' => $focusValueId,
                ],
                'resolved' => [
                    'variant_id' => $activeVariantId,
                    'attrs' => $activeVariantId ? $variantCatalog[$activeVariantId]['value_ids'] : [],
                ],
                'mode' => $decision['mode'],
                'is_exact_match' => $decision['is_exact_match'],
            ],
        ];
    }

    /**
     * @param  array<int, string>  $selectedValueIds
     * @return array<int, string>
     */
    private function normalizeValueIds(array $selectedValueIds): array
    {
        return array_values(array_unique(array_filter($selectedValueIds)));
    }

    /**
     * @param  array<int, array{
     *   id: string,
     *   is_main: bool,
     *   selections: array<int, array{
     *     attribute_id: string,
     *     attribute_name: string,
     *     attribute_value_id: string,
     *     value: string
     *   }>
     * }>  $variants
     * @return array{
     *   0: array<string, array{
     *     id: string,
     *     is_main: bool,
     *     values_by_attribute: array<string, string>,
     *     value_ids: array<int, string>,
     *     value_ids_sorted: array<int, string>
     *   }>,
     *   1: array<string, array{
     *     attribute_id: string,
     *     attribute_name: string,
     *     options: array<string, array{attribute_value_id: string, value: string}>
     *   }>,
     *   2: array<string, string>
     * }
     */
    private function buildCatalogs(array $variants): array
    {
        $variantCatalog = [];
        $optionCatalog = [];
        $attributeByValueId = [];

        foreach ($variants as $variant) {
            $valuesByAttribute = [];

            foreach ($variant['selections'] as $selection) {
                $attributeId = $selection['attribute_id'];
                $attributeName = $selection['attribute_name'];
                $attributeValueId = $selection['attribute_value_id'];
                $value = $selection['value'];

                $valuesByAttribute[$attributeId] = $attributeValueId;
                $attributeByValueId[$attributeValueId] = $attributeId;

                $optionCatalog[$attributeId]['attribute_id'] = $attributeId;
                $optionCatalog[$attributeId]['attribute_name'] = $attributeName;
                $optionCatalog[$attributeId]['options'][$attributeValueId] = [
                    'attribute_value_id' => $attributeValueId,
                    'value' => $value,
                ];
            }

            $valueIds = array_values($valuesByAttribute);
            $valueIdsSorted = $valueIds;
            sort($valueIdsSorted);

            $variantCatalog[$variant['id']] = [
                'id' => $variant['id'],
                'is_main' => (bool) $variant['is_main'],
                'values_by_attribute' => $valuesByAttribute,
                'value_ids' => $valueIds,
                'value_ids_sorted' => $valueIdsSorted,
            ];
        }

        return [$variantCatalog, $optionCatalog, $attributeByValueId];
    }

    /**
     * @param  array<string, array{
     *   id: string,
     *   is_main: bool,
     *   values_by_attribute: array<string, string>,
     *   value_ids: array<int, string>,
     *   value_ids_sorted: array<int, string>
     * }>  $variantCatalog
     * @param  array<int, string>  $selectedValueIds
     * @return array{variant_id: string|null, mode: string, is_exact_match: bool}
     */
    private function resolveVariantDecision(array $variantCatalog, array $selectedValueIds, ?string $focusValueId): array
    {
        if (!empty($selectedValueIds)) {
            $selectedSorted = $selectedValueIds;
            sort($selectedSorted);

            foreach ($variantCatalog as $variant) {
                if ($variant['value_ids_sorted'] === $selectedSorted) {
                    return [
                        'variant_id' => $variant['id'],
                        'mode' => 'attrs_exact',
                        'is_exact_match' => true,
                    ];
                }
            }

            $partial = $this->findBestPartialVariant($variantCatalog, $selectedValueIds, $focusValueId);
            if ($partial !== null) {
                return [
                    'variant_id' => $partial,
                    'mode' => 'attrs_partial',
                    'is_exact_match' => false,
                ];
            }
        }

        foreach ($variantCatalog as $variant) {
            if ($variant['is_main']) {
                return [
                    'variant_id' => $variant['id'],
                    'mode' => 'main',
                    'is_exact_match' => false,
                ];
            }
        }

        $first = reset($variantCatalog);
        return [
            'variant_id' => $first['id'] ?? null,
            'mode' => 'main',
            'is_exact_match' => false,
        ];
    }

    /**
     * @param  array<string, array{
     *   id: string,
     *   is_main: bool,
     *   values_by_attribute: array<string, string>,
     *   value_ids: array<int, string>,
     *   value_ids_sorted: array<int, string>
     * }>  $variantCatalog
     * @param  array<int, string>  $selectedValueIds
     */
    private function findBestPartialVariant(array $variantCatalog, array $selectedValueIds, ?string $focusValueId): ?string
    {
        $bestVariantId = null;
        $bestMatchedCount = 0;
        $bestHasFocus = false;

        foreach ($variantCatalog as $variant) {
            if (
                $focusValueId !== null &&
                !in_array($focusValueId, $variant['value_ids'], true)
            ) {
                continue;
            }

            $matchedCount = count(array_intersect($selectedValueIds, $variant['value_ids']));
            if ($matchedCount <= 0) {
                continue;
            }

            $hasFocus = $focusValueId ? in_array($focusValueId, $variant['value_ids'], true) : false;

            if (
                $matchedCount > $bestMatchedCount ||
                ($matchedCount === $bestMatchedCount && $hasFocus && !$bestHasFocus)
            ) {
                $bestVariantId = $variant['id'];
                $bestMatchedCount = $matchedCount;
                $bestHasFocus = $hasFocus;
            }
        }

        return $bestVariantId;
    }

    /**
     * @param  array<string, array{
     *   id: string,
     *   is_main: bool,
     *   values_by_attribute: array<string, string>,
     *   value_ids: array<int, string>,
     *   value_ids_sorted: array<int, string>
     * }>  $variantCatalog
     * @param  array<int, string>  $selectedValueIds
     * @param  array<string, string>  $attributeByValueId
     * @return array<string, string>
     */
    private function buildSelectedByAttribute(
        array $variantCatalog,
        array $selectedValueIds,
        ?string $activeVariantId,
        array $attributeByValueId
    ): array {
        if ($activeVariantId && isset($variantCatalog[$activeVariantId])) {
            return $variantCatalog[$activeVariantId]['values_by_attribute'];
        }

        $selectedByAttribute = [];
        foreach ($selectedValueIds as $valueId) {
            $attributeId = $attributeByValueId[$valueId] ?? null;
            if ($attributeId) {
                $selectedByAttribute[$attributeId] = $valueId;
            }
        }

        return $selectedByAttribute;
    }

    /**
     * @param  array<string, array{
     *   id: string,
     *   is_main: bool,
     *   values_by_attribute: array<string, string>,
     *   value_ids: array<int, string>,
     *   value_ids_sorted: array<int, string>
     * }>  $variantCatalog
     * @param  array<string, array{
     *   attribute_id: string,
     *   attribute_name: string,
     *   options: array<string, array{attribute_value_id: string, value: string}>
     * }>  $optionCatalog
     * @param  array<string, string>  $selectedByAttribute
     * @return array<int, array<string, mixed>>
     */
    private function buildAvailabilityMatrix(array $variantCatalog, array $optionCatalog, array $selectedByAttribute): array
    {
        $matrix = [];

        foreach ($optionCatalog as $attributeId => $axis) {
            $options = [];

            foreach ($axis['options'] as $candidateOption) {
                $candidateValueId = $candidateOption['attribute_value_id'];
                $isAvailableNow = false;

                foreach ($variantCatalog as $variant) {
                    if (($variant['values_by_attribute'][$attributeId] ?? null) !== $candidateValueId) {
                        continue;
                    }

                    $matchesCurrentSelection = true;
                    foreach ($selectedByAttribute as $selectedAttributeId => $selectedValueId) {
                        if ($selectedAttributeId === $attributeId) {
                            continue;
                        }
                        if (($variant['values_by_attribute'][$selectedAttributeId] ?? null) !== $selectedValueId) {
                            $matchesCurrentSelection = false;
                            break;
                        }
                    }

                    if ($matchesCurrentSelection) {
                        $isAvailableNow = true;
                        break;
                    }
                }

                $nextSelection = $selectedByAttribute;
                $nextSelection[$attributeId] = $candidateValueId;

                $wouldResolveDecision = $this->resolveVariantDecision(
                    $variantCatalog,
                    array_values($nextSelection),
                    $candidateValueId
                );

                $wouldResolveVariantId = $wouldResolveDecision['variant_id'];
                $isSelectable = $wouldResolveVariantId !== null
                    && $wouldResolveDecision['mode'] !== 'main';
                $resolvedVariantId = $isSelectable ? $wouldResolveVariantId : null;

                $options[] = [
                    'attribute_value_id' => $candidateValueId,
                    'value' => $candidateOption['value'],
                    // Compatibilidad temporal (frontend anterior)
                    'is_available' => $isAvailableNow,
                    // Nuevo contrato recomendado
                    'is_available_now' => $isAvailableNow,
                    'is_selectable' => $isSelectable,
                    'is_selected' => ($selectedByAttribute[$attributeId] ?? null) === $candidateValueId,
                    'would_resolve_variant_id' => $resolvedVariantId,
                    'availability_reason' => !$isSelectable
                        ? 'invalid'
                        : ($isAvailableNow ? 'exact' : 'fallback'),
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
}
