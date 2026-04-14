<?php

namespace App\Http\Web\Requests\Blogs;

use App\Enums\OgType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateBlogRequest extends FormRequest
{
  protected function prepareForValidation(): void
  {
    $metadata = $this->input('metadata', []);
    if (!is_array($metadata)) {
      return;
    }

    $metadata['meta_title'] = $this->truncateNullableString($metadata['meta_title'] ?? null, 255);
    $metadata['meta_description'] = $this->truncateNullableString($metadata['meta_description'] ?? null, 500);
    $metadata['meta_keywords'] = $this->truncateNullableString($metadata['meta_keywords'] ?? null, 255);
    $metadata['canonical_url'] = $this->truncateNullableString($metadata['canonical_url'] ?? null, 255);
    $metadata['og_title'] = $this->truncateNullableString($metadata['og_title'] ?? null, 255);
    $metadata['og_description'] = $this->truncateNullableString($metadata['og_description'] ?? null, 500);
    $metadata['og_image'] = $this->truncateNullableString($metadata['og_image'] ?? null, 255);
    $metadata['og_type'] = $this->truncateNullableString($metadata['og_type'] ?? null, 50);

    $this->merge(['metadata' => $metadata]);
  }

  private function truncateNullableString(mixed $value, int $max): ?string
  {
    if ($value === null) {
      return null;
    }

    $text = trim((string) $value);
    if ($text === '') {
      return null;
    }

    return function_exists('mb_substr')
      ? mb_substr($text, 0, $max)
      : substr($text, 0, $max);
  }

  public function authorize(): bool
  {
    return true;
  }

  public function rules(): array
  {
    $blogId = $this->route('blog'); // ya es la ULID

    return [
      'title' => 'required|string|max:255',
      'slug' => [
        'required',
        'string',
        'max:255',
        Rule::unique('blogs', 'slug')->ignore($blogId, 'id'),
      ],
      'description' => 'required|string',
      'content' => 'required|string',

      'image' => [
        'nullable',
        function ($attribute, $value, $fail) {
          if (request()->hasFile($attribute)) {
            $file = request()->file($attribute);
            if (!in_array($file->extension(), ['jpg', 'jpeg', 'png', 'gif', 'webp'])) {
              $fail("La $attribute debe ser un archivo válido (jpg, jpeg, png, gif, webp).");
            }
            if ($file->getSize() > 5 * 1024 * 1024) {
              $fail("La $attribute no puede superar los 5MB.");
            }
          } elseif (!is_string($value) && $value !== null) {
            $fail("La $attribute debe ser un archivo o URL válido.");
          }
        }
      ],
      'miniature' => [
        'nullable',
        function ($attribute, $value, $fail) {
          if (request()->hasFile($attribute)) {
            $file = request()->file($attribute);
            if (!in_array($file->extension(), ['jpg', 'jpeg', 'png', 'gif', 'webp'])) {
              $fail("La $attribute debe ser un archivo válido (jpg, jpeg, png, gif, webp).");
            }
            if ($file->getSize() > 5 * 1024 * 1024) {
              $fail("La $attribute no puede superar los 5MB.");
            }
          } elseif (!is_string($value) && $value !== null) {
            $fail("La $attribute debe ser un archivo o URL válido.");
          }
        }
      ],

      'author' => 'required|string|max:255',
      'visibility' => 'boolean',
      'publication_date' => 'required|date',
      'categories' => 'nullable|array',
      'categories.*' => 'exists:blog_categories,id',

      'metadata' => 'nullable|array',
      'metadata.meta_title' => 'nullable|string|max:255',
      'metadata.meta_description' => 'nullable|string|max:500',
      'metadata.meta_keywords' => 'nullable|string|max:255',
      'metadata.og_title' => 'nullable|string|max:255',
      'metadata.og_description' => 'nullable|string|max:500',
      'metadata.og_image' => 'nullable|string|max:255',
      'metadata.og_type' => [
        'nullable',
        'string',
        'max:50',
        Rule::in(array_column(OgType::cases(), 'value')),
      ],
      'metadata.canonical_url' => 'nullable|string|max:255',
      'metadata.noindex' => 'boolean',
      'metadata.nofollow' => 'boolean',
    ];
  }

  public function messages(): array
  {
    return [
      'title.required' => 'El título es obligatorio.',
      'slug.required' => 'El slug es obligatorio.',
      'slug.unique' => 'El slug ya está en uso.',
      'description.required' => 'La descripción es obligatoria.',
      'content.required' => 'El contenido es obligatorio.',
      'author.required' => 'El autor es obligatorio.',
      'publication_date.required' => 'La fecha de publicación es obligatoria.',
      'categories.*.exists' => 'Una de las categorías seleccionadas no existe.',
      'visibility.boolean' => 'La visibilidad debe ser verdadero o falso.',
      'metadata.noindex.boolean' => 'El campo noindex debe ser verdadero o falso.',
      'metadata.nofollow.boolean' => 'El campo nofollow debe ser verdadero o falso.',
      'image.file' => 'La imagen debe ser un archivo válido.',
      'image.mimes' => 'La imagen debe ser jpg, jpeg, png, gif o webp.',
      'image.max' => 'La imagen no puede superar los 5MB.',
      'miniature.file' => 'La miniatura debe ser un archivo válido.',
      'miniature.mimes' => 'La miniatura debe ser jpg, jpeg, png, gif o webp.',
      'miniature.max' => 'La miniatura no puede superar los 5MB.',
    ];
  }
}
