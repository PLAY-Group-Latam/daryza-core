<?php

namespace App\Http\Web\Requests\Distributors;

use Illuminate\Foundation\Http\FormRequest;

class DistributorRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name'     => 'required|string|max:255',
            'region'   => 'required|string|max:100',
            'lat'      => 'required|numeric|between:-90,90',
            'lng'      => 'required|numeric|between:-180,180',
            'ruc'      => 'nullable|string|size:11',
            'address'  => 'nullable|string|max:500',
            'email'    => 'nullable|email|max:255',
            'phone'    => 'nullable|string|max:20',
            'note'     => 'nullable|string',
            'img_info' => $this->isMethod('POST') 
                            ? 'nullable|image|max:2048' 
                            : 'nullable',             
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'   => 'El nombre del distribuidor es obligatorio.',
            'region.required' => 'Debes especificar una región.',
            'lat.required'    => 'La ubicación en el mapa es obligatoria.',
            'ruc.size'        => 'El RUC debe tener exactamente 11 dígitos.',
        ];
    }
}
