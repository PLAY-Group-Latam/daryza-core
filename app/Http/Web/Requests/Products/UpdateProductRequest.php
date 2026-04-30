<?php

namespace App\Http\Web\Requests\Products;

use App\Http\Web\Support\Products\VariantPayloadValidator;
use App\Http\Web\Support\Products\PromotionPayloadValidator;
use App\Models\Products\ProductCategory;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdateProductRequest extends FormRequest
{
  protected function prepareForValidation(): void
  {
    $metadata = $this->input('metadata', []);
    if (!is_array($metadata)) {
      return;
    }

    $metadata['meta_title'] = $this->truncateNullableString($metadata['meta_title'] ?? null, 160);
    $metadata['meta_description'] = $this->truncateNullableString($metadata['meta_description'] ?? null, 320);
    $metadata['meta_keywords'] = $this->truncateNullableString($metadata['meta_keywords'] ?? null, 255);
    $metadata['canonical_url'] = $this->truncateNullableString($metadata['canonical_url'] ?? null, 500);

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
    return [
      // ======================
      // PRODUCTO
      // ======================
      'name' => ['required', 'string', 'max:255'],
      'slug' => [
        'required',
        'string',
        'max:255',
        Rule::unique('products', 'slug')->ignore($this->product),
      ],
      'categories'        => ['required', 'array', 'min:1'],
      'categories.*'      => ['required', 'string', 'exists:product_categories,id'],
      'parent_category_id' => ['required', 'exists:product_categories,id'],
      'business_lines'    => ['nullable', 'array'],
      'business_lines.*'  => ['exists:business_lines,id'],
      'recommended_product_ids'   => ['nullable', 'array'],
      'recommended_product_ids.*' => ['distinct', 'exists:products,id'],
      'brief_description' => ['nullable', 'string'],
      'description'       => ['nullable', 'string'],
      'is_active'         => ['required', 'boolean'],
      'is_home'           => ['required', 'boolean'],
      'variant_attribute_ids'   => ['nullable', 'array'],
      'variant_attribute_ids.*' => ['exists:attributes,id'],

      // ======================
      // METADATA
      // ======================
      'metadata.meta_title'       => ['nullable', 'string', 'max:160'],
      'metadata.meta_description' => ['nullable', 'string', 'max:320'],
      'metadata.meta_keywords'    => ['nullable', 'string', 'max:255'],
      'metadata.canonical_url'    => ['nullable', 'url', 'max:500'],

      // ======================
      // VARIANTS
      // ======================
      'variants'                   => ['required', 'array', 'min:1'],
      'variants.*.id'              => ['nullable', 'exists:product_variants,id'],
      'variants.*.sku'             => ['required', 'string', 'max:100'],
      'variants.*.sku_supplier'    => ['nullable', 'string', 'max:100'],
      'variants.*.price'           => ['required', 'numeric', 'min:0'],
      'variants.*.promo_price'     => ['nullable', 'numeric', 'min:0'],
      'variants.*.stock'           => ['required', 'integer', 'min:0'],
      'variants.*.is_active'       => ['boolean'],
      'variants.*.is_on_promo'     => ['boolean'],
      'variants.*.promo_start_at'  => ['nullable', 'date'],
      'variants.*.promo_end_at'    => ['nullable', 'date', 'after:variants.*.promo_start_at'],
      'variants.*.is_main'         => ['boolean'],

      // ======================
      // MEDIA
      // Los archivos nuevos llegan directamente como UploadedFile en variants.*.media.*
      // Las existentes llegan como array con file_path
      // ======================
      'variants.*.media'             => ['nullable', 'array'],
      'variants.*.media.*'           => ['nullable'],           // acepta File o array
      'variants.*.media.*.file_path' => ['nullable', 'string'], // para las existentes
      'variants.*.media.*.position'  => ['nullable', 'integer'],

      // ======================
      // ATTRIBUTES
      // ======================
      'variants.*.attributes'                        => ['array'],
      'variants.*.attributes.*.attribute_id'         => ['required', 'exists:attributes,id'],
      'variants.*.attributes.*.attribute_value_id'   => ['nullable', 'exists:attributes_values,id'],
      'variants.*.attributes.*.value'                => ['nullable'],

      // ======================
      // SPECIFICATIONS
      // ======================
      'variants.*.specifications'                    => ['nullable', 'array'],
      'variants.*.specifications.*.attribute_id'     => ['required', 'exists:attributes,id'],
      'variants.*.specifications.*.value'            => ['nullable', 'string', 'max:1000'],
      'variants.*.specification_selector'            => ['nullable'],

      // ======================
      // TECHNICAL SHEETS
      // ======================
      'technicalSheets'              => ['nullable', 'array'],
      'technicalSheets.*'            => ['nullable'],           // acepta File o array
      'technicalSheets.*.file_path'  => ['nullable', 'string'], // para las existentes
    ];
  }

  public function messages(): array
  {
    return [
      'name.required'               => 'El nombre del producto es obligatorio.',
      'name.max'                    => 'El nombre no puede superar los 255 caracteres.',
      'slug.required'               => 'El slug es obligatorio.',
      'slug.unique'                 => 'El slug ya está en uso.',
      'slug.max'                    => 'El slug no puede superar los 255 caracteres.',
      // 'brief_description.max'       => 'La descripción corta no puede superar los 500 caracteres.',
      'is_active.required'          => 'Debes indicar si el producto está activo.',
      'is_home.required'            => 'Debes indicar si se muestra en el home.',
      'categories.required'         => 'Debes seleccionar al menos una categoría.',
      'categories.array'            => 'El formato de las categorías no es válido.',
      'categories.*.exists'         => 'Una de las categorías seleccionadas no es válida.',
      'parent_category_id.required' => 'Debes seleccionar la categoría padre.',
      'parent_category_id.exists'   => 'La categoría padre seleccionada no es válida.',
      'variants.*.sku.required'     => 'El SKU es obligatorio.',
      'variants.*.price.required'   => 'El precio es obligatorio.',
      'variants.*.price.min'        => 'El precio no puede ser negativo.',
      'variants.*.promo_price.numeric' => 'El precio de promoción debe ser un número.',
      'variants.*.promo_price.min'     => 'El precio de promoción no puede ser negativo.',
      'variants.*.promo_end_at.after'  => 'La fecha de fin debe ser posterior a la fecha de inicio.',
      'variants.*.stock.required'   => 'El stock es obligatorio.',
      'variants.*.specifications.*.attribute_id.required' => 'Atributo técnico obligatorio.',
      'variants.*.specifications.*.value.max' => 'El valor de la especificación no puede superar los 1000 caracteres.',
      'metadata.meta_title.max'       => 'El meta título no puede superar los 160 caracteres.',
      'metadata.meta_description.max' => 'La meta descripción no puede superar los 320 caracteres.',
      'metadata.meta_keywords.max'    => 'Las palabras clave no pueden superar los 255 caracteres.',
      'metadata.canonical_url.url'    => 'La URL canónica no tiene un formato válido.',
      'metadata.canonical_url.max'    => 'La URL canónica no puede superar los 500 caracteres.',
    ];
  }

  public function withValidator(Validator $validator): void
  {
    $validator->after(function (Validator $validator) {
      $variants = $this->input('variants', []);
      $selectedVariantAttributeIds = collect($this->input('variant_attribute_ids', []))
        ->filter()
        ->values()
        ->all();
      $product = $this->route('product');
      $recommendedIds = collect($this->input('recommended_product_ids', []))
        ->filter()
        ->values();

      if ($product && $recommendedIds->contains($product->id)) {
        $validator->errors()->add(
          'recommended_product_ids',
          'Un producto no puede recomendarse a sí mismo.'
        );
      }

      app(VariantPayloadValidator::class)->validate(
        $validator,
        $variants,
        $selectedVariantAttributeIds,
        $product,
        true
      );

      app(PromotionPayloadValidator::class)->validate(
        $validator,
        $variants,
      );

      $parentCategoryId = $this->input('parent_category_id');
      $subcategoryIds = collect($this->input('categories', []))
        ->filter()
        ->values();

      $parentCategory = ProductCategory::query()->find($parentCategoryId);
      if (!$parentCategory || !is_null($parentCategory->parent_id) || !$parentCategory->is_active) {
        $validator->errors()->add(
          'parent_category_id',
          'Debes seleccionar una categoría padre válida.'
        );
        return;
      }

      if ($subcategoryIds->isNotEmpty()) {
        $validSubcategoryIds = ProductCategory::query()
          ->where('parent_id', $parentCategoryId)
          ->where('is_active', true)
          ->whereIn('id', $subcategoryIds->all())
          ->pluck('id');

        if ($validSubcategoryIds->count() !== $subcategoryIds->count()) {
          $validator->errors()->add(
            'categories',
            'Las subcategorías deben pertenecer a la categoría padre seleccionada.'
          );
        }
      }
    });
  }
}
