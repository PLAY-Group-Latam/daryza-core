<?php
namespace App\Rules\Web\Content\Resolvers;

class DateFieldResolver
{
    public function matches(string $key): bool
    {
        return (bool) preg_match('/(date|at|time|horario)/i', $key);
    }

    public function resolve(string $key, mixed $val): array
    {
        return [$key => 'nullable|date'];
    }
}