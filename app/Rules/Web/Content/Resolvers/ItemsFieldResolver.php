<?php

namespace App\Rules\Web\Content\Resolvers;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;

class ItemsFieldResolver
{
    public function matches(string $key): bool
    {
            Log::info("ItemssFieldResolver::matches", ['key' => $key]);

        return $key === 'items';
    }

 public function resolve(string $key, mixed $val): array
{
    $rules = [$key => 'array'];

    if (!is_array($val)) {
        return $rules;
    }

    foreach ($val as $i => $item) {
        $rules["$key.$i.id"] = 'required';

        // Solo valida si el campo existe en el item
        if (array_key_exists('src', $item)) {
            $rules["$key.$i.src"] = ['nullable', function ($attr, $value, $fail) {
                if (!is_null($value) && !is_string($value) && !($value instanceof UploadedFile)) {
                    $fail("$attr debe ser un string o un archivo válido.");
                }
            }];
        }

        if (array_key_exists('alt', $item))  $rules["$key.$i.alt"]  = 'nullable|string';
        if (array_key_exists('link', $item)) $rules["$key.$i.link"] = 'nullable|string';
    }

    return $rules;
}
}