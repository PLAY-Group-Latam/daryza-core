<?php

namespace App\Rules\Web\Content\Resolvers;
use Illuminate\Support\Facades\Log;

class CardsFieldResolver
{
    public function matches(string $key): bool
    {
        Log::info("CardsFieldResolver::matches", ['key' => $key]);
        return $key === 'cards';
    }

    public function resolve(string $key, mixed $value): array
    {
        Log::info("CardsFieldResolver::resolve called", ['key' => $key]);
        $rules = [];

        if (!is_array($value)) return $rules;

        foreach ($value as $index => $card) {
            $rules["{$key}.{$index}.titulo_normal"] = ['nullable', 'string', 'max:255'];
            $rules["{$key}.{$index}.titulo_bold"]   = ['nullable', 'string', 'max:255'];
            $rules["{$key}.{$index}.items"]         = ['nullable', 'array'];

            if (isset($card['imagen']) && $card['imagen'] instanceof \Illuminate\Http\UploadedFile) {
                $rules["{$key}.{$index}.imagen"] = ['nullable', 'image', 'max:2048'];
            } else {
                $rules["{$key}.{$index}.imagen"] = ['nullable', 'string'];
            }
        }

        return $rules;
    }
}