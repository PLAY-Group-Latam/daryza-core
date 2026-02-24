<?php

namespace App\Rules\Web\Content\Resolvers;

use Illuminate\Http\UploadedFile;

class ItemsFieldResolver
{
    public function matches(string $key): bool
    {
        return $key === 'items';
    }

    public function resolve(string $key, mixed $val): array
    {
        $rules = [$key => 'array'];

        if (!is_array($val) || empty($val)) {
            return $rules;
        }

        // Detectamos el tipo mirando las keys del primer item
        $firstItem = $val[array_key_first($val)];
        $isProductItem = is_array($firstItem) && array_key_exists('product_id', $firstItem);

        foreach ($val as $i => $item) {
            if ($isProductItem) {
                // Items de productos del blog
                $rules["{$key}.{$i}.product_id"]   = 'required|string';
                $rules["{$key}.{$i}.product_name"] = 'required|string';
                $rules["{$key}.{$i}.sku"]          = 'required|string';
                $rules["{$key}.{$i}.active_price"] = 'nullable';
                $rules["{$key}.{$i}.image"]        = 'nullable';
            } else {
                // Items de imágenes promocionales
                $rules["{$key}.{$i}.id"] = 'required';

                if (array_key_exists('src', $item)) {
                    $rules["{$key}.{$i}.src"] = ['nullable', function ($attr, $value, $fail) {
                        if (!is_null($value) && !is_string($value) && !($value instanceof UploadedFile)) {
                            $fail("$attr debe ser un string o un archivo válido.");
                        }
                    }];
                }

                if (array_key_exists('alt', $item))  $rules["{$key}.{$i}.alt"]  = 'nullable|string';
                if (array_key_exists('link', $item)) $rules["{$key}.{$i}.link"] = 'nullable|string';
            }
        }

        return $rules;
    }
}