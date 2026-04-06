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
            'document_type_id'   => 'required|string|in:DNI,RUC,CE,razon_social',
            
            'document_number'    => [
                'required',
                'string',
                function ($attribute, $value, $fail) {
                    $type = $this->document_type_id;
                    
                    if ($type === 'DNI') {
                        if (!preg_match('/^[0-9]{8}$/', $value)) {
                            $fail('El DNI debe tener exactamente 8 dígitos numéricos.');
                        }
                    } elseif ($type === 'RUC') {
                        if (!preg_match('/^[0-9]{11}$/', $value)) {
                            $fail('El RUC debe tener exactamente 11 dígitos numéricos.');
                        }
                    } elseif ($type === 'CE') {
                        if (!preg_match('/^[a-zA-Z0-9]{4,15}$/', $value)) {
                            $fail('El Carné de Extranjería no tiene un formato válido.');
                        }
                    } elseif ($type === 'razon_social') {
                        
                        if (!preg_match('/^[a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑ.]{3,255}$/', $value)) {
                            $fail('La Razón Social no tiene un formato válido.');
                        }
                    }
                },
            ],
            
            'address'            => 'required|string|max:500',
            'district'           => 'required|string|max:100',
            'phone_number'       => 'required|string|max:20',
            'well_hired_id'      => 'required|string|in:Producto,Servicio', 
            'type_of_service_id' => 'required|string|max:255', 
            'type_of_claim_id'   => 'required|string|in:reclamo,queja', 
            'customer_request'   => 'required|string|min:1',
            'description'        => 'required|string|min:1',
            'terms_conditions'   => 'required|accepted', 
            'file_attached'      => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120', 
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'               => 'El nombre es obligatorio.',
            'email.required'              => 'El correo electrónico es obligatorio.',
            'email.email'                 => 'El correo electrónico no es válido.',
            'document_type_id.required'   => 'El tipo de documento es obligatorio.',
            'document_type_id.in'         => 'El tipo de documento seleccionado no es válido.',
            'document_number.required'    => 'El número de documento es obligatorio.',
            'address.required'            => 'La dirección es obligatoria.',
            'district.required'           => 'El distrito es obligatorio.',
            'phone_number.required'       => 'El número de celular es obligatorio.',
            'well_hired_id.required'      => 'Debe indicar si es un producto o servicio.',
            'type_of_service_id.required' => 'El nombre del producto o servicio es obligatorio.',
            'type_of_claim_id.required'   => 'Debe seleccionar si es un reclamo o una queja.',
            'customer_request.required'   => 'El pedido del cliente es obligatorio.',
            'description.required'        => 'La descripción es obligatoria.',
            'description.min'             => 'Por favor, detalle un poco más su queja o reclamo.',
            'terms_conditions.accepted'   => 'Debes aceptar los términos y condiciones para continuar.',
            'file_attached.mimes'         => 'El archivo adjunto debe ser un PDF o una imagen.',
            'file_attached.max'           => 'El archivo no debe pesar más de 5MB.',
        ];
    }
}