<?php

namespace App\Http\Api\v1\Requests\Leads;

use App\Rules\ValidPeruvianDocument;
use App\Rules\ValidPeruvianPhone;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class AboutUsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'fullName'    => ['required', 'string', 'max:255'],
            'lastName'    => ['required', 'string', 'max:255'],
            'email'       => ['required', 'email', 'max:255'],
            'phone'       => ['required', 'string', new ValidPeruvianPhone],
            'companyName' => ['required', 'string', 'max:255'],
            'rucOrDni'    => ['required', 'string', new ValidPeruvianDocument],
            'comments'    => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function attributes(): array
    {
        return [
            'fullName'    => 'nombre completo',
            'lastName'    => 'apellido completo',
            'email'       => 'correo electrónico',
            'phone'       => 'teléfono',
            'companyName' => 'nombre de la empresa',
            'rucOrDni'    => 'número de RUC / DNI',
            'comments'    => 'comentarios',
        ];
    }

    public function messages(): array
    {
        return [
            'fullName.required'    => 'El nombre completo es obligatorio.',
            'lastName.required'    => 'El apellido completo es obligatorio.',
            'email.required'       => 'El correo electrónico es obligatorio.',
            'email.email'          => 'Ingrese un correo electrónico válido.',
            'phone.required'       => 'El teléfono de contacto es obligatorio.',
            'companyName.required' => 'El nombre de la empresa es obligatorio.',
            'rucOrDni.required'    => 'El número de RUC / DNI es obligatorio.',
            'comments.max'         => 'Los comentarios no pueden exceder los 1000 caracteres.',
        ];
    }

   
    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(
            response()->json([
                'success' => false,
                'message' => 'Error de validación en el formulario de información.',
                'errors'  => $validator->errors()
            ], 422)
        );
    }

 
    protected function prepareForValidation()
    {
        $this->merge([
          
            'fullName' => isset($this->fullName) ? preg_replace('/\s+/', ' ', trim($this->fullName)) : null,
            'lastName' => isset($this->lastName) ? preg_replace('/\s+/', ' ', trim($this->lastName)) : null,
      
            'email'    => isset($this->email) ? strtolower(trim($this->email)) : null,
           
            'rucOrDni' => isset($this->rucOrDni) ? preg_replace('/[^0-9]/', '', $this->rucOrDni) : null,
     
            'phone'    => isset($this->phone) ? trim($this->phone) : null,
        ]);
    }
}