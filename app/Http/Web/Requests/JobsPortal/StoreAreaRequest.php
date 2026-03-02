<?php

namespace App\Http\Web\Requests\JobsPortal;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAreaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120', Rule::unique('areas', 'name')],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
