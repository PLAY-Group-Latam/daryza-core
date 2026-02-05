<?php

namespace App\Http\Web\Requests\Leads;

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
     
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone_number' => 'required|string|max:20',


            'document_type_id' => 'required|string|in:DNI,RUC',
            'document_number' => 'required|string|max:20',
            'address' => 'required|string|max:500',
            'district' => 'required|string|max:100',
            'well_hired_id' => 'required|string|in:Producto,Servicio',
            'type_of_service_id' => 'required|string|max:255',
            'type_of_claim_id' => 'required|string|in:reclamo,queja',
            'description' => 'required|string|min:10',
       
            'terms_conditions' => 'required|accepted',

            'file_attached' => [
                'nullable',
                'file',
                'mimes:pdf',
                'max:20480',
            ],
            
      
            'status' => 'nullable|string|in:new,contacted,in_progress,resolved,closed,lost',
        ];
    }

 
    public function messages(): array
    {
        return [
            'name.required' => 'El nombre completo es obligatorio.',
            'email.required' => 'El correo electrónico es necesario para contactarlo.',
            'email.email' => 'Por favor, ingrese un correo electrónico válido.',
            'phone_number.required' => 'El número de celular es obligatorio.',
            
            'document_type_id.required' => 'Seleccione un tipo de documento.',
            'document_number.required' => 'El número de documento es obligatorio.',
            
            'address.required' => 'La dirección es obligatoria.',
            'district.required' => 'El distrito es obligatorio.',
            
            'well_hired_id.required' => 'Debe especificar si es un Producto o Servicio.',
            'type_of_service_id.required' => 'Indique el tipo de servicio.',
            
            'type_of_claim_id.required' => 'Debe elegir entre Reclamo o Queja.',
            'description.required' => 'Por favor, detalle su mensaje en la descripción.',
            'description.min' => 'La descripción debe ser más detallada.',
            
            'terms_conditions.accepted' => 'Debe aceptar los términos y condiciones para proceder.',
            
            'file_attached.mimes' => 'El archivo adjunto debe ser estrictamente formato PDF.',
            'file_attached.max' => 'El archivo no puede superar los 20MB.',
            
            'status.in' => 'El estado seleccionado no es válido.',
        ];
    }
}