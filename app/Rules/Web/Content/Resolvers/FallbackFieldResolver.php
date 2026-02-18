<?php

namespace App\Rules\Web\Content\Resolvers;

class FallbackFieldResolver
{
    public function matches(string $key): bool
    {
        return true; 
    }

    public function resolve(string $key, mixed $val): array
    {
        return [$key => is_array($val) ? 'array' : 'nullable'];
    }
}