<?php
namespace App\Rules\Web\Content\Resolvers;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;

class MediaFieldResolver
{
    public function matches(string $key): bool
    {
            Log::info("MediaFieldResolver::matches", ['key' => $key]);

        return (bool) preg_match('/(image|logo|icon|photo|video|file|pdf|media)/i', $key);
    }

    public function resolve(string $key, mixed $val): array
    {
        if (is_array($val)) {
            return $this->resolveMediaArray($key, $val);
        }

        if ($val instanceof UploadedFile) {
            return [$key => 'file|mimes:jpeg,png,jpg,gif,svg,mp4,pdf,webp|max:10240'];
        }

        return [$key => 'nullable|string'];
    }

    private function resolveMediaArray(string $key, array $val): array
    {
        $rules = [$key => 'array'];

        foreach ($val as $i => $item) {
            $rules["$key.$i.src"] = ['required', function ($attr, $value, $fail) {
                if (!is_string($value) && !($value instanceof UploadedFile)) {
                    $fail("$attr debe ser un string o un archivo válido.");
                }
            }];
            $rules["$key.$i.type"]     = 'required|in:image,video';
            $rules["$key.$i.device"]   = 'nullable|in:desktop,mobile,both';
            $rules["$key.$i.link_url"] = 'nullable|string';
        }

        return $rules;
    }
}