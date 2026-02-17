<?php

namespace App\Http\Web\Requests\Products;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

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
      'categories' => ['required', 'array', 'min:1'],
      'categories.*' => ['required', 'string', 'exists:product_categories,id'],
      'brief_description' => ['nullable', 'string'],
      'description' => ['nullable', 'string'],
      'is_active' => ['required', 'boolean'],
      'is_home' => ['required', 'boolean'],
      // ======================
      // METADATA
      // ======================
      'metadata.meta_title' => ['nullable', 'string'],
      'metadata.meta_description' => ['nullable', 'string'],
      'metadata.canonical_url' => ['nullable', 'string'],
      'metadata.og_title' => ['nullable', 'string'],
      'metadata.og_description' => ['nullable', 'string'],
      'metadata.noindex' => ['required', 'boolean'],
      'metadata.nofollow' => ['required', 'boolean'],

      // ======================
      // VARIANTS
      // ======================
      'variants' => ['array'],
      'variants.*.id' => ['nullable', 'exists:product_variants,id'],
      'variants.*.sku' => ['required', 'string'],
      'variants.*.sku_supplier' => ['nullable', 'string'],
      'variants.*.price' => ['required', 'numeric'],
      'variants.*.promo_price' => [
        'nullable',
        'numeric',
        'min:0',
        'lt:variants.*.price' // ✅ Senior Tip: Debe ser menor que el precio original
      ],
      'variants.*.stock' => ['required', 'integer'],
      'variants.*.is_active' => ['boolean'],
      'variants.*.is_on_promo' => ['boolean'],
      'variants.*.promo_start_at' => ['nullable', 'date'],
      'variants.*.promo_end_at' => ['nullable', 'date'],
      'variants.*.is_main' => ['boolean'],

      // ======================
      // MEDIA (archivos o URLs)
      // ======================
      'variants.*.media' => ['array'],
      'variants.*.media.*.file' => [
        'nullable',
        'file',
        'mimes:jpg,jpeg,svg,png,gif,webp,mp4',
        'max:10240', // 10MB
      ],
      'variants.*.media.*.file_path' => ['nullable', 'string'],

      // ======================
      // ATTRIBUTES
      // ======================
      'variants.*.attributes' => ['array'],
      'variants.*.attributes.*.attribute_id' => [
        'required',
        'exists:attributes,id',
      ],
      'variants.*.attributes.*.attribute_value_id' => [
        'nullable',
        'exists:attributes_values,id',
      ],
      'variants.*.attributes.*.value' => ['nullable'],

      // ======================
      // SPECIFICATIONS
      // ======================
      'variants.*.specifications' => ['nullable', 'array'],
      'variants.*.specifications.*.attribute_id' => [
        'required',
        'exists:attributes,id',
      ],
      'variants.*.specifications.*.value' => ['nullable', 'string'],

      // Ignorar el selector del front
      'variants.*.specification_selector' => ['nullable'],

      // ======================
      // TECHNICAL SHEETS
      // ======================
      'technicalSheets' => ['array'],
      'technicalSheets.*.file' => [
        'nullable',
        'file',
        'mimes:pdf,doc,docx,xlsx',
        'max:20480', // 20MB
      ],
      'technicalSheets.*.file_path' => ['nullable', 'string'],
    ];
  }

  public function messages(): array
  {
    return [
      'name.required' => 'El nombre del producto es obligatorio.',
      'slug.required' => 'El slug es obligatorio.',
      'slug.unique' => 'El slug ya está en uso.',
      'is_active.required' => 'Debes indicar si el producto está activo.',
      'is_home.required' => 'Debes indicar si se muestra en el home.', // ✅ Nuevo mensaje
      'categories.required' => 'Debes seleccionar al menos una categoría.',
      'categories.array' => 'El formato de las categorías no es válido.',
      'categories.*.exists' => 'Una de las categorías seleccionadas no es válida.',
      'variants.*.sku.required' => 'El SKU es obligatorio.',
      'variants.*.price.required' => 'El precio es obligatorio.',
      'variants.*.promo_price.numeric' => 'El precio de promoción debe ser un número.',
      'variants.*.promo_price.min' => 'El precio de promoción no puede ser negativo.',
      'variants.*.promo_price.lt' => 'El precio de promoción debe ser menor al precio normal.',

      // También es bueno validar el precio normal
      'variants.*.price.min' => 'El precio no puede ser negativo.',
      'variants.*.stock.required' => 'El stock es obligatorio.',
      'variants.*.specifications.*.attribute_id.required' => 'Atributo técnico obligatorio.',

      'variants.*.media.*.file.file' => 'El archivo no es válido.',
      'variants.*.media.*.file.mimes' => 'Formato de archivo no permitido.',
      'variants.*.media.*.file.max' => 'El archivo supera el tamaño máximo permitido.',


      'technicalSheets.*.file.file' => 'La ficha técnica no es válida.',
      'technicalSheets.*.file.mimes' => 'Formato de ficha técnica no permitido.',
      'technicalSheets.*.file.max' => 'La ficha técnica supera el tamaño máximo.',
    ];
  }
}
