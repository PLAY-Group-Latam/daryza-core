<?php

namespace App\Http\Web\Requests\Landings;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\UploadedFile;
use Illuminate\Validation\Rule;

class UpdateLandingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $landingId = $this->route('landing')?->id;

        return [
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', Rule::unique('landings', 'slug')->ignore($landingId)],
            'is_active' => ['required', 'boolean'],
            'metadata' => ['nullable', 'array'],
            'metadata.meta_title' => ['nullable', 'string', 'max:160'],
            'metadata.meta_description' => ['nullable', 'string', 'max:320'],
            'metadata.meta_keywords' => ['nullable', 'string', 'max:255'],
            'metadata.og_title' => ['nullable', 'string', 'max:160'],
            'metadata.og_description' => ['nullable', 'string', 'max:320'],
            'metadata.og_image' => ['nullable', $this->imageOrStringRule()],
            'metadata.og_type' => ['nullable', 'string', 'max:50'],
            'metadata.canonical_url' => ['nullable', 'string', 'max:500'],
            'metadata.noindex' => ['nullable', 'boolean'],
            'metadata.nofollow' => ['nullable', 'boolean'],

            'sections' => ['required', 'array'],

            'sections.banner' => ['nullable', 'array'],
            'sections.banner.slides' => ['nullable', 'array'],
            'sections.banner.slides.*.id' => ['required_with:sections.banner.slides', 'string'],
            'sections.banner.slides.*.is_active' => ['required_with:sections.banner.slides', 'boolean'],
            'sections.banner.slides.*.type' => ['required_with:sections.banner.slides', 'in:image,video'],
            'sections.banner.slides.*.src_desktop' => ['nullable', $this->imageOrStringRule()],
            'sections.banner.slides.*.src_mobile' => ['nullable', $this->imageOrStringRule()],
            'sections.banner.slides.*.src_video' => ['nullable', $this->videoOrStringRule()],
            'sections.banner.slides.*.link_url' => ['nullable', 'string'],

            'sections.brandStory' => ['nullable', 'array'],
            'sections.brandStory.title' => ['nullable', 'string'],
            'sections.brandStory.subtitle' => ['nullable', 'string'],
            'sections.brandStory.description' => ['nullable', 'string'],
            'sections.brandStory.media' => ['nullable', 'array'],
            'sections.brandStory.media.type' => ['nullable', 'in:image,video'],
            'sections.brandStory.media.src_desktop' => ['nullable', $this->imageOrStringRule()],
            'sections.brandStory.media.src_mobile' => ['nullable', $this->imageOrStringRule()],
            'sections.brandStory.media.src_video' => ['nullable', $this->videoOrStringRule()],

            'sections.features' => ['nullable', 'array'],
            'sections.features.title' => ['nullable', 'string'],
            'sections.features.items' => ['nullable', 'array', 'max:3'],
            'sections.features.items.*.title' => ['nullable', 'string'],
            'sections.features.items.*.description' => ['nullable', 'string'],
            'sections.features.items.*.image' => ['nullable', $this->imageOrStringRule()],

            'sections.knowMore' => ['nullable', 'array'],
            'sections.knowMore.title' => ['nullable', 'string'],
            'sections.knowMore.items' => ['nullable', 'array'],
            'sections.knowMore.items.*.id' => ['nullable', 'string'],
            'sections.knowMore.items.*.title' => ['nullable', 'string'],
            'sections.knowMore.items.*.description' => ['nullable', 'string'],
            'sections.knowMore.items.*.image' => ['nullable', $this->imageOrStringRule()],
        ];
    }

    protected function prepareForValidation(): void
    {
        $metadata = $this->input('metadata', []);

        if (!is_array($metadata)) {
            return;
        }

        $metadata['meta_title'] = $this->truncateNullableString($metadata['meta_title'] ?? null, 160);
        $metadata['meta_description'] = $this->truncateNullableString($metadata['meta_description'] ?? null, 320);
        $metadata['meta_keywords'] = $this->truncateNullableString($metadata['meta_keywords'] ?? null, 255);
        $metadata['og_title'] = $this->truncateNullableString($metadata['og_title'] ?? null, 160);
        $metadata['og_description'] = $this->truncateNullableString($metadata['og_description'] ?? null, 320);
        $metadata['og_image'] = $this->truncateNullableString($metadata['og_image'] ?? null, 500);
        $metadata['og_type'] = $this->truncateNullableString($metadata['og_type'] ?? null, 50);
        $metadata['canonical_url'] = $this->truncateNullableString($metadata['canonical_url'] ?? null, 500);

        $this->merge(['metadata' => $metadata]);
    }

    private function imageOrStringRule(): \Closure
    {
        return function (string $attribute, mixed $value, \Closure $fail): void {
            if ($value === null || $value === '') {
                return;
            }

            if ($value instanceof UploadedFile) {
                if (!str_starts_with((string) $value->getMimeType(), 'image/')) {
                    $fail("El campo {$attribute} debe ser una imagen válida.");
                }

                if ($value->getSize() > 10 * 1024 * 1024) {
                    $fail("El campo {$attribute} no puede superar los 10MB.");
                }

                return;
            }

            if (!is_string($value)) {
                $fail("El campo {$attribute} debe ser un archivo o URL válida.");
            }
        };
    }

    private function videoOrStringRule(): \Closure
    {
        return function (string $attribute, mixed $value, \Closure $fail): void {
            if ($value === null || $value === '') {
                return;
            }

            if ($value instanceof UploadedFile) {
                if (!str_starts_with((string) $value->getMimeType(), 'video/')) {
                    $fail("El campo {$attribute} debe ser un video válido.");
                }

                if ($value->getSize() > 30 * 1024 * 1024) {
                    $fail("El campo {$attribute} no puede superar los 30MB.");
                }

                return;
            }

            if (!is_string($value)) {
                $fail("El campo {$attribute} debe ser un archivo o URL válida.");
            }
        };
    }

    private function truncateNullableString(mixed $value, int $max): mixed
    {
        if (!is_string($value)) {
            return $value;
        }

        return mb_substr($value, 0, $max);
    }
}
