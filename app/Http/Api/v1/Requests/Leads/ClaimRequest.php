<?php

namespace App\Http\Api\v1\Requests\Leads;

use Illuminate\Foundation\Http\FormRequest;

class ClaimRequest extends FormRequest
{

    public function authorize(): bool
    {
        
        return true; 
    }

  
    public function rules(): array
    {
        return [
            'name'               => 'required|string|max:255',
            'email'              => 'required|email|max:255',
            'document_type_id'   => 'required|string',
            'document_number'    => 'required|string|max:20',
            'address'            => 'required|string|max:500',
            'district'           => 'required|string|max:100',
            'phone_number'       => 'required|string|max:20',
            'well_hired_id'      => 'required|string', 
            'type_of_service_id' => 'required|string', 
            'type_of_claim_id'   => 'required|string', 
            'description'        => 'required|string|min:10',
            'terms_conditions'   => 'required|accepted', 
            'file_attached'      => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120', 
        ];
    }

    public function messages(): array
    {
        return [
            'terms_conditions.accepted' => 'Debes aceptar los términos y condiciones para continuar.',
            'file_attached.mimes'       => 'El archivo adjunto debe ser un PDF o una imagen.',
            'file_attached.max'         => 'El archivo no debe pesar más de 5MB.',
        ];
    }
}