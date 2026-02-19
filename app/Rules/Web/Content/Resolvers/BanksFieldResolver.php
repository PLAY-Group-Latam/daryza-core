<?php

namespace App\Rules\Web\Content\Resolvers;

class BanksFieldResolver
{
    public function matches(string $key): bool
    {
        return $key === 'banks';
    }

   public function resolve(string $key, mixed $value): array
{
    $rules = [];

    if (!is_array($value)) return $rules;

    foreach ($value as $index => $item) {
        $rules["{$key}.{$index}.id"] = ['required'];

  
        if (isset($item['image']) && $item['image'] instanceof \Illuminate\Http\UploadedFile) {
            $rules["{$key}.{$index}.image"] = ['nullable', 'image', 'max:2048'];
        } else {
            $rules["{$key}.{$index}.image"] = ['nullable', 'string'];
        }
    }

    return $rules;
}
}