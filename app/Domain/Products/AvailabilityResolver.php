<?php

namespace App\Domain\Products;

class AvailabilityResolver
{
    /**
     * @param array<string,string> $selectedByAttribute
     * @param string|null $activeVariantId
     * @return array<int, array<string,mixed>>
     */
    public function buildMatrix(VariantIndex $index, array $selectedByAttribute, ?string $activeVariantId = null): array
    {
        $matrix = [];
        $activeVariant = ($activeVariantId && isset($index->variantsById[$activeVariantId]))
            ? $index->variantsById[$activeVariantId]
            : null;
        $primaryAttributeId = $index->primaryAttributeId;
        $primaryValueId = $primaryAttributeId
            ? ($activeVariant['values_by_attribute'][$primaryAttributeId] ?? ($selectedByAttribute[$primaryAttributeId] ?? null))
            : null;
        $primaryBranchVariantIds = $this->resolveVariantsForPrimaryBranch($index, $primaryValueId);

        foreach ($index->optionsByAttribute as $attributeId => $axis) {
            $options = [];

            foreach ($axis['options'] as $option) {
                $candidateValueId = $option['attribute_value_id'];
                $targetVariantId = $this->resolveTargetVariantId(
                    $index,
                    $candidateValueId,
                    $attributeId,
                    $selectedByAttribute,
                    $activeVariantId,
                    $primaryBranchVariantIds
                );
                $isActiveOnRenderedVariant = ($activeVariant['values_by_attribute'][$attributeId] ?? null) === $candidateValueId;
                $state = $this->resolveOptionState($isActiveOnRenderedVariant, $targetVariantId, $activeVariantId);

                $options[] = [
                    'attribute_value_id' => $candidateValueId,
                    'value' => $option['value'],
                    'state' => $state,
                    'target_variant_id' => $targetVariantId,
                ];
            }

            $matrix[] = [
                'attribute_id' => $axis['attribute_id'],
                'attribute_name' => $axis['attribute_name'],
                'is_primary' => $primaryAttributeId === $attributeId,
                'primary_selected_value_id' => $primaryValueId,
                'active_variant_value_id' => $activeVariant['values_by_attribute'][$attributeId] ?? null,
                'options' => array_values($options),
            ];
        }

        return $matrix;
    }

    /**
     * @return array<int,string>
     */
    private function resolveVariantsForPrimaryBranch(VariantIndex $index, ?string $primaryValueId): array
    {
        if ($primaryValueId === null) {
            return array_values(array_keys($index->variantsById));
        }

        return $index->variantIdsByValueId[$primaryValueId] ?? [];
    }

    /**
     * @param array<string,string> $selectedByAttribute
     * @param array<int,string> $primaryBranchVariantIds
     */
    private function resolveTargetVariantId(
        VariantIndex $index,
        string $candidateValueId,
        string $axisAttributeId,
        array $selectedByAttribute,
        ?string $activeVariantId,
        array $primaryBranchVariantIds
    ): ?string {
        $variantsForCandidate = $index->variantIdsByValueId[$candidateValueId] ?? [];
        if ($variantsForCandidate === []) {
            return null;
        }

        if ($axisAttributeId === $index->primaryAttributeId) {
            return $this->pickBestVariantForPrimaryNavigation($index, $variantsForCandidate, $selectedByAttribute, $activeVariantId);
        }

        $candidatesInBranch = array_values(array_intersect($variantsForCandidate, $primaryBranchVariantIds));
        if ($candidatesInBranch === []) {
            return null;
        }

        return $this->pickBestVariantForSecondaryNavigation($index, $candidatesInBranch, $selectedByAttribute, $activeVariantId);
    }

    /**
     * @param array<int,string> $candidateVariantIds
     * @param array<string,string> $selectedByAttribute
     */
    private function pickBestVariantForPrimaryNavigation(
        VariantIndex $index,
        array $candidateVariantIds,
        array $selectedByAttribute,
        ?string $activeVariantId
    ): ?string {
        if ($activeVariantId !== null && in_array($activeVariantId, $candidateVariantIds, true)) {
            return $activeVariantId;
        }

        $primaryAttributeId = $index->primaryAttributeId;
        $secondarySelections = $selectedByAttribute;
        if ($primaryAttributeId !== null) {
            unset($secondarySelections[$primaryAttributeId]);
        }

        $bestVariantId = null;
        $bestScore = -1;

        foreach ($candidateVariantIds as $variantId) {
            $variant = $index->variantsById[$variantId] ?? null;
            if ($variant === null) {
                continue;
            }

            $score = 0;
            foreach ($secondarySelections as $attributeId => $selectedValueId) {
                if (($variant['values_by_attribute'][$attributeId] ?? null) === $selectedValueId) {
                    $score++;
                }
            }

            if ($score > $bestScore) {
                $bestScore = $score;
                $bestVariantId = $variantId;
            }
        }

        return $bestVariantId ?? ($candidateVariantIds[0] ?? null);
    }

    /**
     * @param array<int,string> $candidateVariantIds
     * @param array<string,string> $selectedByAttribute
     */
    private function pickBestVariantForSecondaryNavigation(
        VariantIndex $index,
        array $candidateVariantIds,
        array $selectedByAttribute,
        ?string $activeVariantId
    ): ?string
    {
        if ($activeVariantId !== null && in_array($activeVariantId, $candidateVariantIds, true)) {
            return $activeVariantId;
        }

        $bestVariantId = null;
        $bestScore = -1;

        foreach ($candidateVariantIds as $variantId) {
            $variant = $index->variantsById[$variantId] ?? null;
            if ($variant === null) {
                continue;
            }

            $score = 0;
            foreach ($selectedByAttribute as $attributeId => $selectedValueId) {
                if (($variant['values_by_attribute'][$attributeId] ?? null) === $selectedValueId) {
                    $score++;
                }
            }

            if ($score > $bestScore) {
                $bestScore = $score;
                $bestVariantId = $variantId;
            }
        }

        return $bestVariantId ?? ($candidateVariantIds[0] ?? null);
    }

    private function resolveOptionState(bool $isActiveOnRenderedVariant, ?string $targetVariantId, ?string $activeVariantId): string
    {
        if ($isActiveOnRenderedVariant && $targetVariantId !== null && $targetVariantId === $activeVariantId) {
            return 'active';
        }

        if ($targetVariantId !== null) {
            return 'reachable';
        }

        return 'unavailable';
    }
}
