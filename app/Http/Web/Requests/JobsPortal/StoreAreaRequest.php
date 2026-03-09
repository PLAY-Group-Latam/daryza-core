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

    public function messages(): array
    {
        return [
            'name.required' => 'El nombre del área es obligatorio.',
            'name.max' => 'El nombre del área no puede superar 120 caracteres.',
            'name.unique' => 'Ya existe un área con ese nombre.',
            'is_active.boolean' => 'El estado activo debe ser verdadero o falso.',
        ];
    }
}
