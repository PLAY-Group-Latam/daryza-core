<?php

namespace App\Http\Web\Requests\Products;

use App\Models\Products\BusinessLine;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateBusinessLineRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $businessLine = $this->route('businessLine');
        $businessLineId = $businessLine instanceof BusinessLine ? $businessLine->id : $businessLine;

        return [
            'name' => ['required', 'string', 'max:255', Rule::unique('business_lines', 'name')->ignore($businessLineId)],
            'slug' => ['required', 'string', 'max:255', Rule::unique('business_lines', 'slug')->ignore($businessLineId)],
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