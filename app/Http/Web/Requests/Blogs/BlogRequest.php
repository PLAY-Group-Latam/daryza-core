<?php

namespace App\Http\Web\Requests\Blogs;

use App\Enums\OgType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\UploadedFile;
use Illuminate\Validation\Rule;

class BlogRequest extends FormRequest
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
    return true; // ajusta según permisos
  }

  public function rules(): array
  {
    $blogId = $this->route('blog')?->id;

    return [
      'title' => 'required|string|max:255',
      'slug' => 'required|string|max:255|unique:blogs,slug,' . $blogId,
      'description' => 'required|string',
      'content' => 'required|string',
      // IMAGE y MINIATURE pueden ser archivos o URLs
      // Solo archivos de imagen
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
      'title.string' => 'El título debe ser un texto válido.',
      'title.max' => 'El título no puede superar los 255 caracteres.',

      'slug.required' => 'El slug es obligatorio.',
      'slug.string' => 'El slug debe ser un texto válido.',
      'slug.max' => 'El slug no puede superar los 255 caracteres.',
      'slug.unique' => 'El slug ya está en uso, elige otro.',

      'description.required' => 'La descripción es obligatoria.',
      'description.string' => 'La descripción debe ser un texto válido.',

      'content.required' => 'El contenido es obligatorio.',
      'content.string' => 'El contenido debe ser un texto válido.',

      'author.required' => 'El autor es obligatorio.',
      'author.string' => 'El autor debe ser un texto válido.',
      'author.max' => 'El autor no puede superar los 255 caracteres.',

      'visibility.boolean' => 'La visibilidad debe ser verdadero o falso.',

      'publication_date.required' => 'La fecha de publicación es obligatoria.',
      'publication_date.date' => 'La fecha de publicación debe ser una fecha válida.',

      'categories.array' => 'Las categorías deben ser un arreglo.',
      'categories.*.exists' => 'Una de las categorías seleccionadas no existe.',

      'metadata.array' => 'Los metadatos deben ser un arreglo.',
      'metadata.meta_title.max' => 'El meta título no puede superar los 255 caracteres.',
      'metadata.meta_description.max' => 'La meta descripción no puede superar los 500 caracteres.',
      'metadata.meta_keywords.max' => 'Las meta keywords no pueden superar los 255 caracteres.',
      'metadata.og_title.max' => 'El OG title no puede superar los 255 caracteres.',
      'metadata.og_description.max' => 'El OG description no puede superar los 500 caracteres.',
      'metadata.og_image.max' => 'El OG image no puede superar los 255 caracteres.',
      'metadata.og_type.max' => 'El OG type no puede superar los 50 caracteres.',
      'metadata.canonical_url.max' => 'La URL canónica no puede superar los 255 caracteres.',
      'metadata.noindex.boolean' => 'El campo noindex debe ser verdadero o falso.',
      'metadata.nofollow.boolean' => 'El campo nofollow debe ser verdadero o falso.',
    ];
  }
}
