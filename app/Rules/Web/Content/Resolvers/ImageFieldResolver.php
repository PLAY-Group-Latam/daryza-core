<?php

namespace App\Rules\Web\Content\Resolvers;
use Illuminate\Support\Facades\Log;

use Illuminate\Http\UploadedFile;

class ImageFieldResolver
{
   public function matches(string $key): bool
{
    $result = str_contains($key, 'image') || str_contains($key, 'logo');
    Log::info("ImageFieldResolver::matches", ['key' => $key, 'result' => $result]);
    return $result;
}

    public function resolve(string $key, mixed $val): array
    {
        if ($val instanceof UploadedFile) {
            return [$key => ['nullable', 'image', 'max:5120']];
        }

        return [$key => ['nullable', 'string']];
    }
}