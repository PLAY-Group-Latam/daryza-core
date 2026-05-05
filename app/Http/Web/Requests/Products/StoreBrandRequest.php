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
                'mimetypes:image/svg+xml',
                'max:1024', 
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'image.mimetypes' => 'El archivo debe ser exclusivamente en formato SVG.',
            'image.max' => 'El archivo no debe pesar más de 1 MB.',
        ];
    }
}