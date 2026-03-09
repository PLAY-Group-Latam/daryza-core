<?php

namespace App\Http\Web\Support\Products;

use Illuminate\Database\Eloquent\Model;

class UniqueSlugResolver
{
    /**
     * @param class-string<Model> $modelClass
     */
    public function resolve(string $modelClass, string $baseSlug, ?string $ignoreId = null, string $fallback = 'item'): string
    {
        $slug = $baseSlug !== '' ? $baseSlug : $fallback;
        $candidate = $slug;
        $suffix = 2;

        while (
            $modelClass::withTrashed()
                ->where('slug', $candidate)
                ->when($ignoreId, fn($q) => $q->where('id', '!=', $ignoreId))
                ->exists()
        ) {
            $candidate = $slug . '-' . $suffix;
            $suffix++;
        }

        return $candidate;
    }
}
