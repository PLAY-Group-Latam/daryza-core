<?php

namespace App\Rules\Web\Content\Resolvers;
use Illuminate\Support\Facades\Log;

use Illuminate\Http\UploadedFile;

class BannerFieldResolver
{
    public function matches(string $key): bool
    {

        Log::info("BannerFieldResolver::matches", ['key' => $key, 'result' => $key === 'banner']);
        return $key === 'banner';
    }

    public function resolve(string $key, mixed $value): array

    {
        Log::info("BannerFieldResolver::resolve called", ['key' => $key, 'value_keys' => is_array($value) ? array_keys($value) : $value]);
        $rules = [];

        if (!is_array($value)) return $rules;

        $rules["{$key}.type"] = ['required', 'in:image,url'];

        $srcDesktop = $value['src_desktop'] ?? null;
        $rules["{$key}.src_desktop"] = $srcDesktop instanceof UploadedFile
            ? ['nullable', 'image', 'max:5120']
            : ['nullable', 'string'];

        $srcMobile = $value['src_mobile'] ?? null;
        $rules["{$key}.src_mobile"] = $srcMobile instanceof UploadedFile
            ? ['nullable', 'image', 'max:5120']
            : ['nullable', 'string'];

        $rules["{$key}.link_url"] = ['nullable', 'string', 'url:http,https'];

        return $rules;
    }
}