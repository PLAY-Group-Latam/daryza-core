<?php

namespace App\Http\Web\Requests\Products;

use Illuminate\Foundation\Http\FormRequest;

class StoreBusinessLineRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255', 'unique:business_lines,name'],
            'slug' => ['required', 'string', 'max:255', 'unique:business_lines,slug'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
