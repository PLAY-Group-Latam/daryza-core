<?php

namespace App\Http\Web\Requests\Distributors;

use Illuminate\Foundation\Http\FormRequest;

class DistributorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

   public function rules(): array
    {
        $rules = [
            'name'      => 'required|string|max:255',
            'region'    => 'required|string|max:100',
            'lat'       => 'required|numeric|between:-90,90',
            'lng'       => 'required|numeric|between:-180,180',
            'ruc'       => 'nullable|string|size:11',
            'address'   => 'nullable|string|max:500',
            'email'     => 'nullable|email|max:255',
            'phone'     => 'nullable|string|max:20',
            'note'      => 'nullable|string',
            'is_active' => 'nullable|boolean',
        ];

        if ($this->isMethod('POST')) {
            $rules['logo_pin'] = 'nullable|image|mimes:jpeg,png,jpg,svg|max:2048';
            $rules['establishment_img'] = 'nullable|image|mimes:jpeg,png,jpg|max:4096';
        } else {
            $rules['logo_pin'] = 'nullable'; 
            $rules['establishment_img'] = 'nullable';
        }

        return $rules;
    }

    public function messages(): array
    {
        return [
            'name.required'             => 'El nombre del distribuidor es obligatorio.',
            'region.required'           => 'Debes especificar una región.',
            'lat.required'              => 'La ubicación en el mapa es obligatoria.',
            'ruc.size'                  => 'El RUC debe tener exactamente 11 dígitos.',
            'logo_pin.image'            => 'El logo para el mapa debe ser una imagen.',
            'logo_pin.max'              => 'El logo no debe pesar más de 2MB.',
            'establishment_img.image'   => 'La foto del establecimiento debe ser una imagen.',
            'establishment_img.max'     => 'La foto del establecimiento no debe pesar más de 4MB.',
        ];
    }
}