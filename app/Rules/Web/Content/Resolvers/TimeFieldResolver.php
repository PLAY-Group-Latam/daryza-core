<?php
namespace App\Rules\Web\Content\Resolvers;

use Illuminate\Support\Facades\Log;

class TimeFieldResolver
{
    public function matches(string $key): bool
    {
        Log::info("TimeFieldResolver::matches", ['key' => $key]);

        return str_ends_with($key, '_from') || str_ends_with($key, '_to');
    }

    public function resolve(string $key, mixed $val): array
    {
        return [$key => ['nullable', 'string']];
    }
}