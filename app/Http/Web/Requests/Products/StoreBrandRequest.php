<?php

namespace App\Http\Web\Requests\Products;

use Illuminate\Foundation\Http\FormRequest;

class StoreBrandRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255', 'unique:brands,name'],
            'slug' => ['required', 'string', 'max:255', 'unique:brands,slug'],
            'is_active' => ['sometimes', 'boolean'],
            'image' => [
    'nullable',
    'file',
    'mimes:jpg,jpeg,png,svg,webp',
    'max:1024',
],
        ];
    }

   public function messages(): array
{
    return [
        'image.mimes' => 'El archivo debe ser JPG, JPEG, PNG, SVG o WEBP.',
        'image.max' => 'El archivo no debe pesar más de 1 MB.',
    ];
}
}