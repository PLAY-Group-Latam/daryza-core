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
            'document_type_id'   => 'required|string|in:DNI,RUC', 
            
            'document_number'    => [
                'required',
                'string',
                $this->document_type_id === 'DNI' ? 'size:8' : 'size:11',
                'regex:/^[0-9]+$/'
            ],
            
            'address'            => 'required|string|max:500',
            'district'           => 'required|string|max:100',
            'phone_number'       => 'required|string|max:20',
            'well_hired_id'      => 'required|string|in:Producto,Servicio', 
            'type_of_service_id' => 'required|string|max:255', 
            'type_of_claim_id'   => 'required|string|in:reclamo,queja', 
            'description'        => 'required|string|min:1',
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
            
            'document_number.size'      => 'El documento debe tener :size dígitos.',
            'document_number.regex'     => 'El número de documento solo debe contener números.',
            'description.min'           => 'Por favor, detalle un poco más su queja o reclamo.',
        ];
    }
}