<?php

namespace App\Rules\Web\Content\Resolvers;

class BlogProductsItemsResolver
{
    public function matches(string $key): bool
    {
 
        return $key === 'items';
    }

    public function resolve(string $key, mixed $val): array
    {
        $rules = [$key => 'array'];

        if (!is_array($val)) {
            return $rules;
        }

        foreach ($val as $i => $item) {
            
            $rules["{$key}.{$i}.product_id"] = 'required|string';
            $rules["{$key}.{$i}.product_name"] = 'required|string';
            $rules["{$key}.{$i}.sku"] = 'required|string';
            
        
            $rules["{$key}.{$i}.active_price"] = 'nullable';
            $rules["{$key}.{$i}.image"] = 'nullable';
        }

        return $rules;
    }
}