<?php

namespace App\Http\Api\v1\Requests\JobsPortal;

use Illuminate\Foundation\Http\FormRequest;

class StoreApplicationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'first_name' => ['required', 'string', 'max:120'],
            'last_name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:120'],
            'phone' => ['required', 'string', 'max:30'],
            'cv' => ['required', 'file', 'mimes:pdf,doc,docx', 'max:5120'],
            'job_id' => ['required', 'exists:job_offers,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'first_name.required' => 'Los nombres son obligatorios.',
            'first_name.max' => 'Los nombres no pueden superar 120 caracteres.',
            'last_name.required' => 'Los apellidos son obligatorios.',
            'last_name.max' => 'Los apellidos no pueden superar 120 caracteres.',
            'email.required' => 'El correo electrónico es obligatorio.',
            'email.email' => 'Ingresa un correo electrónico válido.',
            'email.max' => 'El correo electrónico no puede superar 120 caracteres.',
            'phone.required' => 'El teléfono es obligatorio.',
            'phone.max' => 'El teléfono no puede superar 30 caracteres.',
            'cv.required' => 'Debes adjuntar tu CV.',
            'cv.file' => 'El CV debe ser un archivo válido.',
            'cv.mimes' => 'El CV debe estar en formato PDF, DOC o DOCX.',
            'cv.max' => 'El CV no puede superar 5MB.',
            'job_id.required' => 'La oferta laboral es obligatoria.',
            'job_id.exists' => 'La oferta laboral seleccionada no existe.',
        ];
    }
}
