<?php

namespace App\Http\Web\Requests\Products;

use App\Models\Products\Brand;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateBrandRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $brand = $this->route('brand');
        $brandId = $brand instanceof Brand ? $brand->id : $brand;

        return [
            'name' => ['required', 'string', 'max:255', Rule::unique('brands', 'name')->ignore($brandId)],
            'slug' => ['required', 'string', 'max:255', Rule::unique('brands', 'slug')->ignore($brandId)],
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