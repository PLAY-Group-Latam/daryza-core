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
            // Busca y reemplaza category_id por esto:

            'categories' => ['required', 'array', 'min:1'], // 'required' o 'nullable' según tu negocio
            'categories.*' => ['exists:product_categories,id'],
            'business_lines' => ['nullable', 'array'],
            'business_lines.*' => ['exists:business_lines,id'],
            'brief_description' => ['nullable', 'string'],
            'description' => ['nullable', 'string'],
            'is_active' => ['required', 'boolean'],
            'is_home' => ['required', 'boolean'],
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
            'variants.*.sku_supplier' => ['nullable', 'string'],
            'variants.*.price' => ['required', 'numeric'],
            // ✅ AGREGADO: promo_price con validación de "Menor que el precio original"
            'variants.*.promo_price' => [
                'nullable',
                'numeric',
                'min:0',
                'lt:variants.*.price'
            ],
            'variants.*.stock' => ['required', 'integer'],
            'variants.*.is_active' => ['boolean'],
            'variants.*.is_on_promo' => ['boolean'],
            'variants.*.promo_start_at' => ['nullable', 'string'],
            'variants.*.promo_end_at' => ['nullable', 'string'],
            'variants.*.is_main' => ['boolean'],

            'variants.*.media' => ['array'],
            'variants.*.media.*' => ['nullable', 'file', 'mimes:jpg,jpeg,svg,png,gif,webp,mp4', 'max:10240'], // 10MB

            'variants.*.attributes' => ['array'],
            'variants.*.attributes.*.attribute_id' => ['required', 'exists:attributes,id'],
            'variants.*.attributes.*.attribute_value_id' => ['nullable', 'exists:attributes_values,id'],
            'variants.*.attributes.*.value' => ['nullable'],

            // ✅ CAMBIO: Especificaciones técnicas AHORA DENTRO de la variante
            'variants.*.specifications' => ['nullable', 'array'],
            'variants.*.specifications.*.attribute_id' => ['required', 'exists:attributes,id'],
            'variants.*.specifications.*.value' => ['nullable', 'string'], // Permitimos nullable por si el usuario borra el texto

            // Selector temporal (solo para que no de error si llega al server, aunque no se valide)
            'variants.*.specification_selector' => ['nullable'],

            'technicalSheets' => ['array'],
            'technicalSheets.*.file' => ['nullable', 'file', 'mimes:pdf,doc,docx,xlsx', 'max:20480'], // 20MB
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'El nombre del producto es obligatorio.',
            'slug.required' => 'El slug del producto es obligatorio.',
            'slug.unique' => 'El slug ya está en uso, elige otro.',
            'categories.required' => 'Debes seleccionar al menos una categoría.',
            'categories.array' => 'El formato de categorías es inválido.',
            'categories.*.exists' => 'Una de las categorías seleccionadas no es válida.',
            'business_lines.array' => 'El formato de las líneas de negocio es inválido.',
            'business_lines.*.exists' => 'Una de las líneas de negocio seleccionadas no es válida.',
            'is_active.required' => 'Debes indicar si el producto está activo.',
            'metadata.noindex.required' => 'Debes indicar si usar noindex.',
            'metadata.nofollow.required' => 'Debes indicar si usar nofollow.',
            'is_home.required' => 'Debes indicar si el producto se muestra en el home.',
            'variants.*.sku.required' => 'El SKU es obligatorio para cada variante.',
            'variants.*.sku.unique' => 'El SKU ya existe, ingresa uno diferente.',
            'variants.*.price.required' => 'El precio es obligatorio para cada variante.',
            // ✅ MENSAJES DE PROMO_PRICE
            'variants.*.promo_price.numeric' => 'El precio de oferta debe ser un número.',
            'variants.*.promo_price.lt' => 'La oferta debe ser menor al precio original.',
            'variants.*.promo_price.min' => 'El precio de oferta no puede ser negativo.',

            'variants.*.stock.required' => 'El stock es obligatorio para cada variante.',

            'variants.*.media.*.file.file' => 'Cada archivo debe ser un archivo válido.',
            'variants.*.media.*.file.mimes' => 'Los archivos permitidos son: jpg, jpeg, svg, png, gif, webp, mp4.',
            'variants.*.media.*.file.max' => 'El tamaño máximo permitido para el archivo es 10MB.',


            'variants.*.is_main.boolean' => 'El valor de "Principal" debe ser verdadero o falso.',

            'variants.*.attributes.*.attribute_id.required' => 'Debes seleccionar un atributo para la variante.',
            'variants.*.attributes.*.attribute_value_id.exists' => 'El valor seleccionado del atributo no existe.',

            'variants.*.specifications.*.attribute_id.required' => 'Debes seleccionar un atributo para la especificación técnica.',
            'variants.*.specifications.*.value.string' => 'El valor de la especificación debe ser un texto.',

            'technicalSheets.*.file.file' => 'Cada ficha técnica debe ser un archivo válido.',
            'technicalSheets.*.file.mimes' => 'Los tipos permitidos son: pdf, doc, docx, xlsx.',
            'technicalSheets.*.file.max' => 'El tamaño máximo permitido es 20MB.',

        ];
    }
}
