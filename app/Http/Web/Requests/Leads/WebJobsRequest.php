<?php

namespace App\Http\Web\Requests\Leads;

use App\Rules\ValidPeruvianPhone;
use Illuminate\Foundation\Http\FormRequest;

class WebJobsRequest extends FormRequest
{
   
    public function authorize(): bool
    {
        return true; 
    }

  
    public function rules(): array
    {
        return [
 
            'firstName'        => ['required', 'string', 'max:255'],
            'lastName'         => ['required', 'string', 'max:255'],
            'email'            => ['required', 'email', 'max:255'],
            'phone'            => ['required', new ValidPeruvianPhone],

            'area'             => ['required', 'string', 'in:ventas,marketing,tecnologia,recursos-humanos,finanzas'],
            'position'         => ['required', 'string', 'in:junior,semi-senior,senior,gerente,director'],
            'location'         => ['required', 'string', 'in:remoto,oficina-central,sucursal-norte,sucursal-sur'],
            'employmentStatus' => ['required', 'string', 'in:empleado,desempleado,estudiante,freelance'],

        
            'cv'               => ['nullable', 'file', 'mimes:pdf,doc,docx,txt', 'max:2048'],

   
            'acceptedPolicy'   => ['required', 'accepted'],
        ];
    }

 
    public function messages(): array
    {
        return [
            'firstName.required'      => 'El nombre es obligatorio.',
            'lastName.required'       => 'El apellido es obligatorio.',
            'email.required'          => 'El correo electrónico es obligatorio.',
            'email.email'             => 'Ingrese un formato de correo válido.',
            'area.required'           => 'Debe seleccionar un área.',
            'position.required'       => 'Debe seleccionar un puesto.',
            'location.required'       => 'Debe seleccionar un lugar.',
            'employmentStatus.required' => 'Debe seleccionar su situación laboral actual.',
            'cv.required'             => 'Debe adjuntar su currículum vitae.',
            'cv.mimes'                => 'El CV debe ser formato PDF, Word o TXT.',
            'cv.max'                  => 'El archivo no debe pesar más de 2MB.',
            'acceptedPolicy.accepted' => 'Debe aceptar la política de privacidad.',
        ];
    }

 
    public function attributes(): array
    {
        return [
            'firstName'        => 'nombre',
            'lastName'         => 'apellido',
            'email'            => 'correo electrónico',
            'phone'            => 'teléfono',
            'area'             => 'área',
            'position'         => 'puesto',
            'location'         => 'lugar de postulación',
            'employmentStatus' => 'situación laboral',
            'cv'               => 'currículum vitae',
            'acceptedPolicy'   => 'política de privacidad',
        ];
    }
}