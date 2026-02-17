<?php

namespace App\Http\Web\Requests\Products;

use App\Models\Products\ProductCategory;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $category = $this->route('category');
        // Extraemos el ID ya sea que venga el objeto o el ULID
        $categoryId = $category instanceof ProductCategory ? $category->id : $category;

        return [
            'name'      => ['required', 'string', 'max:255'],
            'slug'      => [
                'required',
                'string',
                'max:255',
                Rule::unique('product_categories', 'slug')->ignore($categoryId)
            ],
            'parent_id' => [
                'nullable',
                'string',
                'exists:product_categories,id',
                Rule::notIn([$categoryId])
            ],
            'order'     => ['nullable', 'integer', 'min:0'],
            'is_active' => ['required', 'boolean'],
            'image'     => [
                'nullable',
                // Si es un archivo, aplicamos reglas de imagen. Si es string (URL), solo validamos que sea string.
                $this->hasFile('image') ? 'image' : 'string',
                $this->hasFile('image') ? 'mimes:jpg,jpeg,png,webp' : '',
                $this->hasFile('image') ? 'max:2048' : '',
            ],
        ];
    }



    public function messages(): array
    {
        return [
            'name.required'    => 'El nombre es obligatorio.',
            'slug.unique'      => 'Este slug ya está en uso.',
            'parent_id.not_in' => 'La categoría no puede ser su propio padre.',
            'image.image'      => 'El archivo debe ser una imagen válida.',
            'image.max'        => 'La imagen no debe superar los 2MB.',
        ];
    }
}
