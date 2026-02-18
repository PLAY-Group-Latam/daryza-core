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

        if (!is_array($val)) {
            return $rules;
        }

        foreach ($val as $i => $item) {
            $rules["$key.$i.id"]   = 'required';
            $rules["$key.$i.src"]  = ['nullable', function ($attr, $value, $fail) {
                if (!is_null($value) && !is_string($value) && !($value instanceof UploadedFile)) {
                    $fail("$attr debe ser un string o un archivo válido.");
                }
            }];
            $rules["$key.$i.alt"]  = 'nullable|string';
            $rules["$key.$i.link"] = 'nullable|string';
        }

        return $rules;
    }
}