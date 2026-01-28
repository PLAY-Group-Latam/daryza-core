<?php

namespace App\Http\Web\Requests\Products;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'name' => ['required', 'string'],
            'slug' => ['required', 'string', 'unique:products,slug'],
            'category_id' => ['nullable', 'exists:product_categories,id'],
            'brief_description' => ['nullable', 'string'],
            'description' => ['nullable', 'string'],
            'is_active' => ['required', 'boolean'],

            'metadata.meta_title' => ['nullable', 'string'],
            'metadata.meta_description' => ['nullable', 'string'],
            'metadata.canonical_url' => ['nullable', 'string'],
            'metadata.og_title' => ['nullable', 'string'],
            'metadata.og_description' => ['nullable', 'string'],
            'metadata.noindex' => ['required', 'boolean'],
            'metadata.nofollow' => ['required', 'boolean'],

            'variant_attribute_ids' => ['array'],
            'variant_attribute_ids.*' => ['exists:attributes,id'],

            'variants' => ['array'],
            'variants.*.sku' => ['required', 'string', 'unique:product_variants,sku'],
            'variants.*.price' => ['required', 'numeric'],
            'variants.*.stock' => ['required', 'integer'],
            'variants.*.is_active' => ['boolean'],
            'variants.*.is_on_promo' => ['boolean'],
            'variants.*.promo_start_at' => ['nullable', 'string'],
            'variants.*.promo_end_at' => ['nullable', 'string'],

            'variants.*.attributes' => ['array'],
            'variants.*.attributes.*.attribute_id' => ['required', 'exists:attributes,id'],
            'variants.*.attributes.*.attribute_value_id' => ['nullable', 'exists:attributes_values,id'],
            'variants.*.attributes.*.value' => ['nullable'],

            'specifications' => ['array'],
            'specifications.*.attribute_id' => ['required', 'exists:attributes,id'],
            'specifications.*.value' => ['required'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'El nombre del producto es obligatorio.',
            'slug.required' => 'El slug del producto es obligatorio.',
            'slug.unique' => 'El slug ya está en uso, elige otro.',
            'category_id.exists' => 'La categoría seleccionada no existe.',
            'is_active.required' => 'Debes indicar si el producto está activo.',
            'metadata.noindex.required' => 'Debes indicar si usar noindex.',
            'metadata.nofollow.required' => 'Debes indicar si usar nofollow.',

            'variants.*.sku.required' => 'El SKU es obligatorio para cada variante.',
            'variants.*.sku.unique' => 'El SKU ya existe, ingresa uno diferente.',
            'variants.*.price.required' => 'El precio es obligatorio para cada variante.',
            'variants.*.stock.required' => 'El stock es obligatorio para cada variante.',

            'variants.*.attributes.*.attribute_id.required' => 'Debes seleccionar un atributo para la variante.',
            'variants.*.attributes.*.attribute_value_id.exists' => 'El valor seleccionado del atributo no existe.',

            'specifications.*.attribute_id.required' => 'Debes seleccionar un atributo para la especificación.',
            'specifications.*.value.required' => 'El valor de la especificación es obligatorio.',
        ];
    }
}
