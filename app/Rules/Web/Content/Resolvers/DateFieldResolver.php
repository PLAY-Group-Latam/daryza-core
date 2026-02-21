<?php
namespace App\Rules\Web\Content\Resolvers;
use Illuminate\Support\Facades\Log;

class DateFieldResolver
{
    public function matches(string $key): bool
    {
        Log::info("DateFieldResolver::matches", ['key' => $key]);

        
        return (bool) preg_match('/(date|at|time|horario)/i', $key);
    }

    public function resolve(string $key, mixed $val): array
    {
        return [$key => 'nullable|date'];
    }
}