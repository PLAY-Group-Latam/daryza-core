<?php

namespace App\Http\Web\Requests\Products;

use App\Http\Web\Support\Products\VariantPayloadValidator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdateProductRequest extends FormRequest
{
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
      'name' => ['required', 'string'],
      'slug' => [
        'required',
        'string',
        Rule::unique('products', 'slug')->ignore($this->product),
      ],
      'categories'        => ['required', 'array', 'min:1'],
      'categories.*'      => ['required', 'string', 'exists:product_categories,id'],
      'business_lines'    => ['nullable', 'array'],
      'business_lines.*'  => ['exists:business_lines,id'],
      'brief_description' => ['nullable', 'string'],
      'description'       => ['nullable', 'string'],
      'is_active'         => ['required', 'boolean'],
      'is_home'           => ['required', 'boolean'],
      'variant_attribute_ids'   => ['nullable', 'array'],
      'variant_attribute_ids.*' => ['exists:attributes,id'],

      // ======================
      // METADATA
      // ======================
      'metadata.meta_title'       => ['nullable', 'string'],
      'metadata.meta_description' => ['nullable', 'string'],
      'metadata.canonical_url'    => ['nullable', 'string'],
      'metadata.og_title'         => ['nullable', 'string'],
      'metadata.og_description'   => ['nullable', 'string'],
      'metadata.noindex'          => ['required', 'boolean'],
      'metadata.nofollow'         => ['required', 'boolean'],

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
      'variants.*.promo_end_at'    => ['nullable', 'date'],
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
      'variants.*.specifications.*.value'            => ['nullable', 'string'],
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
      'slug.required'               => 'El slug es obligatorio.',
      'slug.unique'                 => 'El slug ya está en uso.',
      'is_active.required'          => 'Debes indicar si el producto está activo.',
      'is_home.required'            => 'Debes indicar si se muestra en el home.',
      'categories.required'         => 'Debes seleccionar al menos una categoría.',
      'categories.array'            => 'El formato de las categorías no es válido.',
      'categories.*.exists'         => 'Una de las categorías seleccionadas no es válida.',
      'variants.*.sku.required'     => 'El SKU es obligatorio.',
      'variants.*.price.required'   => 'El precio es obligatorio.',
      'variants.*.price.min'        => 'El precio no puede ser negativo.',
      'variants.*.promo_price.numeric' => 'El precio de promoción debe ser un número.',
      'variants.*.promo_price.min'     => 'El precio de promoción no puede ser negativo.',
      'variants.*.stock.required'   => 'El stock es obligatorio.',
      'variants.*.specifications.*.attribute_id.required' => 'Atributo técnico obligatorio.',
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
      app(VariantPayloadValidator::class)->validate(
        $validator,
        $variants,
        $selectedVariantAttributeIds,
        $this->route('product'),
        true
      );
    });
  }
}
