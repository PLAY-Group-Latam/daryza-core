<?php

namespace App\Domain\Products;

class VariantIndex
{
    /**
     * @param array<string, array{id:string,is_main:bool,values_by_attribute:array<string,string>,value_ids:array<int,string>,value_ids_set:array<string,bool>}> $variantsById
     * @param array<string, array{attribute_id:string,attribute_name:string,options:array<string, array{attribute_value_id:string,value:string}>}> $optionsByAttribute
     * @param array<string, array<int,string>> $variantIdsByValueId
     * @param array<string, string> $attributeByValueId
     */
    public function __construct(
        public array $variantsById,
        public array $optionsByAttribute,
        public array $variantIdsByValueId,
        public array $attributeByValueId,
        public ?string $primaryAttributeId,
    ) {}

    public function mainVariantId(): ?string
    {
        foreach ($this->variantsById as $variant) {
            if ($variant['is_main']) {
                return $variant['id'];
            }
        }

        $first = reset($this->variantsById);

        return $first['id'] ?? null;
    }
}
