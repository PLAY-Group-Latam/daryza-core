<?php

namespace App\Rules\Web\Content\Resolvers;
use Illuminate\Support\Facades\Log;

use Illuminate\Http\UploadedFile;

class BrandsFieldResolver
{
    public function matches(string $key): bool
    {
        Log::info("BrandsFieldResolver::matches", ['key' => $key]);
        return $key === 'brands';
    }

    public function resolve(string $key, mixed $val): array
    {
        $rules = [$key => 'array'];

        foreach ($val as $i => $item) {
            $rules["$key.$i.image"] = ['nullable', function ($attr, $value, $fail) {
                if (!is_null($value) && !is_string($value) && !($value instanceof UploadedFile)) {
                    $fail("$attr debe ser un string o un archivo válido.");
                }
            }];
            $rules["$key.$i.name"] = 'nullable|string';
        }

        return $rules;
    }
}