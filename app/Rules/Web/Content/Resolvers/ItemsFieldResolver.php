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

        $firstItem     = $val[array_key_first($val)];
        $isProductItem = is_array($firstItem) && array_key_exists('product_id', $firstItem);

        foreach ($val as $i => $item) {
            if ($isProductItem) {
                // Solo validamos el ID, el resto no llega ni se guarda
                $rules["{$key}.{$i}.product_id"] = 'required|string';
            } else {
                $rules["{$key}.{$i}.id"] = 'required';

                // --- NUEVAS REGLAS PARA FAQS ---
                if (array_key_exists('question', $item)) {
                    $rules["{$key}.{$i}.question"] = 'nullable|string';
                }

                if (array_key_exists('answer', $item)) {
                    $rules["{$key}.{$i}.answer"] = 'nullable|string';
                }

                // --- OTROS CAMPOS ---
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