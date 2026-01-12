<?php

namespace App\Http\Web\Requests\Products;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCategoryRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', Rule::unique('product_categories')->ignore($this->category)],
            'parent_id' => ['nullable', 'exists:product_categories,id'],
            'order' => ['nullable', 'integer'],
            'is_active' => ['required', 'boolean'],
            'image' => ['nullable', 'image', 'max:2048'], // opcional, máximo 2MB
        ];
    }

    public function authorize(): bool
    {
        return true; // ajustar según permisos
    }
}
