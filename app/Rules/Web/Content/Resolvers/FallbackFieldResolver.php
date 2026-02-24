<?php

namespace App\Rules\Web\Content\Resolvers;
use Illuminate\Support\Facades\Log;

class FallbackFieldResolver
{
    public function matches(string $key): bool
    {
        Log::info("FallbackFieldResolver::matches", ['key' => $key]);

        return true; 
    }

    public function resolve(string $key, mixed $val): array
    {
        return [$key => is_array($val) ? 'array' : 'nullable'];
    }
}