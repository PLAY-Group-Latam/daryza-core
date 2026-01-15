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
            'slug' => ['required', 'string', 'max:255', Rule::unique('product_categories')],
            'parent_id' => ['nullable', 'exists:product_categories,id'],
            'order' => ['nullable', 'integer'],
            'is_active' => ['required', 'boolean'],
            'image' => ['nullable', 'image', 'max:2048'], // opcional, máximo 2MB
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'El nombre de la categoría es obligatorio.',
            'name.string' => 'El nombre de la categoría debe ser un texto válido.',
            'name.max' => 'El nombre no puede exceder los 255 caracteres.',

            'slug.required' => 'El slug es obligatorio.',
            'slug.string' => 'El slug debe ser un texto válido.',
            'slug.max' => 'El slug no puede exceder los 255 caracteres.',
            'slug.unique' => 'Este slug ya está en uso. Por favor, elige otro.',
            'parent_id.exists' => 'La categoría padre seleccionada no es válida.',
            'order.integer' => 'El orden debe ser un número entero.',
            'is_active.required' => 'Debes seleccionar si la categoría está activa o no.',
            'is_active.boolean' => 'El valor de activo debe ser verdadero o falso.',
            'image.image' => 'El archivo debe ser una imagen válida.',
            'image.max' => 'La imagen no puede superar los 2MB.',
        ];
    }


    public function authorize(): bool
    {
        return true; // ajustar según permisos
    }
}
