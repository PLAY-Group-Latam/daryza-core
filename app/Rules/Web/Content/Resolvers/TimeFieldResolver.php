<?php
namespace App\Rules\Web\Content\Resolvers;

class TimeFieldResolver
{
    public function matches(string $key): bool
    {
        return str_ends_with($key, '_from') || str_ends_with($key, '_to');
    }

    public function resolve(string $key, mixed $val): array
    {
        return [$key => ['nullable', 'string']];
    }
}