<?php

namespace App\Http\Web\Requests\JobsPortal;

use Illuminate\Foundation\Http\FormRequest;

class StorePlaceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'address' => ['required', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:120'],
            'is_active' => ['sometimes', 'boolean'],
            'area_ids' => ['required', 'array', 'min:1'],
            'area_ids.*' => ['required', 'exists:areas,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'El nombre de la sede es obligatorio.',
            'name.max' => 'El nombre de la sede no puede superar 120 caracteres.',
            'address.required' => 'La dirección de la sede es obligatoria.',
            'address.max' => 'La dirección no puede superar 255 caracteres.',
            'city.required' => 'La ciudad es obligatoria.',
            'city.max' => 'La ciudad no puede superar 120 caracteres.',
            'is_active.boolean' => 'El estado activo debe ser verdadero o falso.',
            'area_ids.required' => 'Debes seleccionar al menos un área para la sede.',
            'area_ids.array' => 'El listado de áreas es inválido.',
            'area_ids.min' => 'Debes seleccionar al menos un área para la sede.',
            'area_ids.*.exists' => 'Una de las áreas seleccionadas no existe.',
        ];
    }
}
