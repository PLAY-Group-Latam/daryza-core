<?php

namespace App\Http\Api\v1\Requests\Leads;

use App\Rules\ValidPeruvianPhone;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class JobsRequest extends FormRequest
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
            'phone'            => ['required', 'string', new ValidPeruvianPhone],
            'area'             => ['required', 'string'],
            'position'         => ['required', 'string'],
            'location'         => ['required', 'string'],
            'employmentStatus' => ['required', 'string'],
            'acceptedPolicy'   => ['required', 'accepted'],
            'cv'               => ['required', 'file', 'mimes:pdf,doc,docx', 'max:2048'], 
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
            'location'         => 'lugar',
            'employmentStatus' => 'situación laboral',
            'acceptedPolicy'   => 'política de privacidad',
            'cv'               => 'currículum vitae',
        ];
    }

    public function messages(): array
    {
        return [
            'firstName.required'      => 'El nombre es obligatorio.',
            'lastName.required'       => 'El apellido es obligatorio.',
            'email.required'          => 'El correo electrónico es obligatorio.',
            'email.email'             => 'Ingrese un correo electrónico válido.',
            'phone.required'          => 'El teléfono es obligatorio.',
            'area.required'           => 'Debe seleccionar un área.',
            'position.required'       => 'Debe seleccionar un puesto.',
            'location.required'       => 'Debe seleccionar un lugar.',
            'employmentStatus.required' => 'Debe seleccionar su situación laboral actual.',
            'acceptedPolicy.accepted' => 'Debe aceptar la política de privacidad.',
            'cv.required'             => 'Debe adjuntar su currículum vitae.',
            'cv.mimes'                => 'El CV debe ser un archivo PDF o Word.',
            'cv.max'                  => 'El archivo no debe pesar más de 2MB.',
        ];
    }

    
    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(
            response()->json([
                'success' => false,
                'message' => 'Error de validación en la postulación.',
                'errors'  => $validator->errors()
            ], 422)
        );
    }

 
    protected function prepareForValidation()
    {
        $this->merge([
            'firstName' => isset($this->firstName) ? preg_replace('/\s+/', ' ', trim($this->firstName)) : null,
            'lastName'  => isset($this->lastName) ? preg_replace('/\s+/', ' ', trim($this->lastName)) : null,
            'email'     => isset($this->email) ? strtolower(trim($this->email)) : null,
            'phone'     => isset($this->phone) ? trim($this->phone) : null,
            'acceptedPolicy' => filter_var($this->input('acceptedPolicy'), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE),
        ]);
    }
}