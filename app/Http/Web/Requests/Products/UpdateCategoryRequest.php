<?php

namespace App\Http\Web\Requests\Products;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCategoryRequest extends FormRequest
{
    public function rules(): array
    {
        $categoryId = $this->route('categories'); // obtiene el ID de la categoría desde la ruta

        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => [
                'nullable',
                'string',
                'max:255',
                Rule::unique('product_categories')->ignore($categoryId),
            ],
            'parent_id' => [
                'nullable',
                'exists:product_categories,id',
                'not_in:' . $categoryId,
            ],
            'order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['required', 'boolean'],
            'image' => ['nullable', 'image', 'max:2048'], // máximo 2MB
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'      => 'El nombre de la categoría es obligatorio.',
            'name.string'        => 'El nombre debe ser un texto válido.',
            'name.max'           => 'El nombre no puede exceder los 255 caracteres.',

            'slug.string'        => 'El slug debe ser un texto válido.',
            'slug.max'           => 'El slug no puede exceder los 255 caracteres.',
            'slug.unique'        => 'Este slug ya está en uso. Por favor, elige otro.',

            'parent_id.exists'   => 'La categoría padre seleccionada no es válida.',
            'parent_id.not_in'   => 'No puedes asignar esta categoría como padre de sí misma.',

            'order.integer'      => 'El orden debe ser un número entero.',
            'order.min'          => 'El orden no puede ser menor que 0.',

            'is_active.boolean'  => 'El valor de activo debe ser verdadero o falso.',

            'image.image'        => 'El archivo debe ser una imagen válida.',
            'image.max'          => 'La imagen no puede superar los 2MB.',
        ];
    }

    public function authorize(): bool
    {
        return true; // ajustar según permisos
    }
}
