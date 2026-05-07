<?php

namespace App\Domain\Products;

class VariantIndexBuilder
{
    /**
     * @param  array<int, array{id:string,is_main:bool,selections:array<int,array{attribute_id:string,attribute_name:string,attribute_value_id:string,value:string}>}>  $variants
     */
    public function build(array $variants): VariantIndex
    {
        $variantsById = [];
        $optionsByAttribute = [];
        $variantIdsByValueId = [];
        $attributeByValueId = [];

        foreach ($variants as $variant) {
            $valuesByAttribute = [];
            $valueIds = [];

            foreach ($variant['selections'] as $selection) {
                $attributeId = $selection['attribute_id'];
                $attributeValueId = $selection['attribute_value_id'];

                $valuesByAttribute[$attributeId] = $attributeValueId;
                $valueIds[] = $attributeValueId;
                $attributeByValueId[$attributeValueId] = $attributeId;
                $variantIdsByValueId[$attributeValueId][] = $variant['id'];

                $optionsByAttribute[$attributeId]['attribute_id'] = $attributeId;
                $optionsByAttribute[$attributeId]['attribute_name'] = $selection['attribute_name'];
                $optionsByAttribute[$attributeId]['options'][$attributeValueId] = [
                    'attribute_value_id' => $attributeValueId,
                    'value' => $selection['value'],
                ];
            }

            $valueIds = array_values(array_unique($valueIds));
            $valueSet = [];
            foreach ($valueIds as $valueId) {
                $valueSet[$valueId] = true;
            }

            $variantsById[$variant['id']] = [
                'id' => $variant['id'],
                'is_main' => (bool) $variant['is_main'],
                'values_by_attribute' => $valuesByAttribute,
                'value_ids' => $valueIds,
                'value_ids_set' => $valueSet,
            ];
        }

        foreach ($variantIdsByValueId as $valueId => $variantIds) {
            $variantIdsByValueId[$valueId] = array_values(array_unique($variantIds));
        }

        $primaryAttributeId = null;
        $firstAxis = reset($optionsByAttribute);
        if (is_array($firstAxis)) {
            $primaryAttributeId = $firstAxis['attribute_id'] ?? null;
        }

        return new VariantIndex(
            variantsById: $variantsById,
            optionsByAttribute: $optionsByAttribute,
            variantIdsByValueId: $variantIdsByValueId,
            attributeByValueId: $attributeByValueId,
            primaryAttributeId: $primaryAttributeId,
        );
    }
}
