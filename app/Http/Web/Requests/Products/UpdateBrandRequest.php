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
                'image', // Valida que sea un archivo de imagen
                'mimes:jpg,jpeg,png,webp,svg', // Extensiones permitidas
                'max:2048', // Aumentado a 2MB opcionalmente, ya que fotos suelen pesar más que SVGs
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'image.image' => 'El archivo debe ser una imagen válida.',
            'image.mimes' => 'La imagen debe ser un archivo de tipo: jpg, jpeg, png, webp o svg.',
            'image.max' => 'La imagen no debe pesar más de 2 MB.',
        ];
    }
}