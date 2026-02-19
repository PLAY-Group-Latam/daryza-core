<?php

namespace App\Rules\Web\Content\Resolvers;

use Illuminate\Http\UploadedFile;

class ImageFieldResolver
{
    public function matches(string $key): bool
    {
        return str_contains($key, 'image') || str_contains($key, 'logo');
    }

    public function resolve(string $key, mixed $val): array
    {
        if ($val instanceof UploadedFile) {
            return [$key => ['nullable', 'image', 'max:5120']];
        }

        return [$key => ['nullable', 'string']];
    }
}