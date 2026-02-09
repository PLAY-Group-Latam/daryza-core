<?php

namespace App\Http\Web\Requests\Leads;

use App\Rules\ValidPeruvianDocument;
use App\Rules\ValidPeruvianPhone;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;


class WebAboutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // Campos principales
            'fullName'    => ['required', 'string', 'max:255'],
            'email'       => ['required', 'email', 'max:255'],
            
            // Usando tu regla personalizada para Celular
            'phone'       => ['required', new ValidPeruvianPhone], 
            
            // Campos de 'data'
            'lastName'    => ['required', 'string', 'max:255'],
            'companyName' => ['required', 'string', 'max:255'],
            
            // Usando tu regla personalizada para DNI/RUC
            'rucOrDni'    => ['required', new ValidPeruvianDocument], 
            
            'comments'    => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'fullName.required'    => 'El nombre completo es obligatorio.',
            'lastName.required'    => 'El apellido completo es obligatorio.',
            'email.required'       => 'El correo electrónico es obligatorio.',
            'email.email'          => 'Ingresa una dirección de correo válida.',
            'companyName.required' => 'El nombre de la empresa es obligatorio.',
            'rucOrDni.required'    => 'El número de RUC o DNI es obligatorio.',
        ];
    }

    public function attributes(): array
    {
        return [
            'fullName'    => 'nombre completo',
            'lastName'    => 'apellido completo',
            'email'       => 'correo electrónico',
            'phone'       => 'teléfono de contacto',
            'companyName' => 'nombre de la empresa',
            'rucOrDni'    => 'número de RUC / DNI',
            'comments'    => 'comentarios',
        ];
    }
}