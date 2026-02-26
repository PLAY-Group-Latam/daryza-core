<?php

namespace App\Http\Web\Requests\Products;

use App\Http\Web\Support\Products\VariantPayloadValidator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreProductRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            // — Producto base —
            'name'              => ['required', 'string', 'max:255'],
            'slug'              => ['required', 'string', 'max:255', 'unique:products,slug'],
            'brief_description' => ['nullable', 'string', 'max:500'],
            'description'       => ['nullable', 'string'],
            'is_active'         => ['required', 'boolean'],
            'is_home'           => ['required', 'boolean'],

            // — Relaciones —
            'categories'       => ['required', 'array', 'min:1'],
            'categories.*'     => ['exists:product_categories,id'],
            'business_lines'   => ['nullable', 'array'],
            'business_lines.*' => ['exists:business_lines,id'],
            'recommended_product_ids'   => ['nullable', 'array'],
            'recommended_product_ids.*' => ['distinct', 'exists:products,id'],

            // — Atributos de variante —
            'variant_attribute_ids'   => ['nullable', 'array'],
            'variant_attribute_ids.*' => ['exists:attributes,id'],

            // — Variantes —
            'variants'                  => ['required', 'array', 'min:1'],
            'variants.*.sku'            => ['required', 'string', 'max:100', 'unique:product_variants,sku'],
            'variants.*.sku_supplier'   => ['nullable', 'string', 'max:100'],
            'variants.*.price'          => ['required', 'numeric', 'min:0'],
            'variants.*.promo_price'    => ['nullable', 'numeric', 'min:0'],
            'variants.*.promo_start_at' => ['nullable', 'date'],
            'variants.*.promo_end_at'   => ['nullable', 'date', 'after:variants.*.promo_start_at'],
            'variants.*.stock'          => ['required', 'integer', 'min:0'],
            'variants.*.is_active'      => ['boolean'],
            'variants.*.is_on_promo'    => ['boolean'],
            'variants.*.is_main'        => ['boolean'],

            // — Media —
            'variants.*.media'   => ['nullable', 'array'],
            'variants.*.media.*' => ['file', 'mimes:jpg,jpeg,png,gif,webp,svg,mp4', 'max:10240'],

            // — Atributos —
            'variants.*.attributes'                      => ['nullable', 'array'],
            'variants.*.attributes.*.attribute_id'       => ['required', 'exists:attributes,id'],
            'variants.*.attributes.*.attribute_value_id' => ['nullable', 'exists:attributes_values,id'],
            'variants.*.attributes.*.value'              => ['nullable'],

            // — Especificaciones —
            'variants.*.specifications'                => ['nullable', 'array'],
            'variants.*.specifications.*.attribute_id' => ['required', 'exists:attributes,id'],
            'variants.*.specifications.*.value'        => ['nullable', 'string', 'max:1000'],

            // — Fichas técnicas —
            'technicalSheets'   => ['nullable', 'array'],
            'technicalSheets.*' => ['nullable', 'file', 'mimes:pdf,doc,docx,xlsx', 'max:20480'],

            // — SEO —
            'metadata.meta_title'       => ['nullable', 'string', 'max:160'],
            'metadata.meta_description' => ['nullable', 'string', 'max:320'],
            'metadata.canonical_url'    => ['nullable', 'url', 'max:500'],
            'metadata.og_title'         => ['nullable', 'string', 'max:160'],
            'metadata.og_description'   => ['nullable', 'string', 'max:320'],
            'metadata.noindex'          => ['required', 'boolean'],
            'metadata.nofollow'         => ['required', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            // — Producto base —
            'name.required'              => 'El nombre del producto es obligatorio.',
            'name.max'                   => 'El nombre no puede superar los 255 caracteres.',
            'slug.required'              => 'El slug es obligatorio.',
            'slug.unique'                => 'Este slug ya está en uso, elige otro.',
            'slug.max'                   => 'El slug no puede superar los 255 caracteres.',
            'brief_description.max'      => 'La descripción corta no puede superar los 500 caracteres.',
            'is_active.required'         => 'Debes indicar si el producto está activo.',
            'is_home.required'           => 'Debes indicar si el producto se muestra en el home.',

            // — Relaciones —
            'categories.required'        => 'Debes seleccionar al menos una categoría.',
            'categories.min'             => 'Debes seleccionar al menos una categoría.',
            'categories.*.exists'        => 'Una de las categorías seleccionadas no es válida.',
            'business_lines.*.exists'    => 'Una de las líneas de negocio seleccionadas no es válida.',

            // — Variantes —
            'variants.required'          => 'El producto debe tener al menos una variante.',
            'variants.min'               => 'El producto debe tener al menos una variante.',
            'variants.*.sku.required'    => 'El SKU es obligatorio en cada variante.',
            'variants.*.sku.unique'      => 'El SKU :input ya existe, ingresa uno diferente.',
            'variants.*.sku.max'         => 'El SKU no puede superar los 100 caracteres.',
            'variants.*.price.required'  => 'El precio es obligatorio en cada variante.',
            'variants.*.price.numeric'   => 'El precio debe ser un valor numérico.',
            'variants.*.price.min'       => 'El precio no puede ser negativo.',
            'variants.*.promo_price.numeric' => 'El precio promocional debe ser un valor numérico.',
            'variants.*.promo_price.min'     => 'El precio promocional no puede ser negativo.',
            'variants.*.promo_start_at.date' => 'La fecha de inicio de promoción no es válida.',
            'variants.*.promo_end_at.date'   => 'La fecha de fin de promoción no es válida.',
            'variants.*.promo_end_at.after'  => 'La fecha de fin debe ser posterior a la fecha de inicio.',
            'variants.*.stock.required'  => 'El stock es obligatorio en cada variante.',
            'variants.*.stock.integer'   => 'El stock debe ser un número entero.',
            'variants.*.stock.min'       => 'El stock no puede ser negativo.',

            // — Media —
            'variants.*.media.*.file'    => 'El archivo adjunto no es válido.',
            'variants.*.media.*.mimes'   => 'Los formatos permitidos son: jpg, jpeg, png, gif, webp, svg, mp4.',
            'variants.*.media.*.max'     => 'El tamaño máximo por archivo es 10MB.',

            // — Atributos —
            'variants.*.attributes.*.attribute_id.required'      => 'El atributo de la variante es obligatorio.',
            'variants.*.attributes.*.attribute_id.exists'        => 'El atributo seleccionado no existe.',
            'variants.*.attributes.*.attribute_value_id.exists'  => 'El valor del atributo seleccionado no existe.',

            // — Especificaciones —
            'variants.*.specifications.*.attribute_id.required'  => 'El atributo de la especificación es obligatorio.',
            'variants.*.specifications.*.attribute_id.exists'    => 'El atributo de especificación no existe.',
            'variants.*.specifications.*.value.max'              => 'El valor de la especificación no puede superar los 1000 caracteres.',

            // — Fichas técnicas —
            'technicalSheets.*.file.file'  => 'La ficha técnica debe ser un archivo válido.',
            'technicalSheets.*.mimes' => 'Los formatos permitidos para fichas técnicas son: pdf, doc, docx, xlsx.',
            'technicalSheets.*.max'   => 'El tamaño máximo por ficha técnica es 20MB.',

            // — SEO —
            'metadata.meta_title.max'       => 'El meta título no puede superar los 160 caracteres.',
            'metadata.meta_description.max' => 'La meta descripción no puede superar los 320 caracteres.',
            'metadata.canonical_url.url'    => 'La URL canónica no tiene un formato válido.',
            'metadata.canonical_url.max'    => 'La URL canónica no puede superar los 500 caracteres.',
            'metadata.og_title.max'         => 'El OG título no puede superar los 160 caracteres.',
            'metadata.og_description.max'   => 'La OG descripción no puede superar los 320 caracteres.',
            'metadata.noindex.required'     => 'Debes indicar el valor de noindex.',
            'metadata.nofollow.required'    => 'Debes indicar el valor de nofollow.',
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
                null,
                false
            );
        });
    }
}
