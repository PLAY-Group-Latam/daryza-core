<?php

namespace App\Http\Web\Requests\Products;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductPackRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:product_packs,slug'],
            'brief_description' => ['nullable', 'string'],
            'description' => ['nullable', 'string'],
            'stock' => ['required', 'integer', 'min:0'],
            'price' => ['required', 'numeric', 'min:0'],
            'promo_price' => ['nullable', 'numeric', 'lt:price'],
            'is_on_promotion' => ['sometimes', 'boolean'],
            'show_on_home' => ['sometimes', 'boolean'],
            'is_active' => ['sometimes', 'boolean'],
            'promo_start_at' => ['nullable', 'date'],
            'promo_end_at' => ['nullable', 'date', 'after_or_equal:promo_start_at'],
            'media' => ['nullable', 'array'],
            'media.*' => ['nullable'],
            'media.*.id' => ['nullable', 'string', 'exists:product_media,id'],
            'media.*.file_path' => ['nullable', 'string'],
            'media.*.type' => ['nullable', 'in:image,video'],
            'media.*.position' => ['nullable', 'integer', 'min:0'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.variant_id' => ['required', 'exists:product_variants,id'],
            'items.*.product_id' => ['required', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
        ];
    }
}
