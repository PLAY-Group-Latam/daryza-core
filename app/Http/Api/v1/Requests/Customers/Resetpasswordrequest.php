<?php

namespace App\Http\Api\v1\Requests\Customers;

use Illuminate\Foundation\Http\FormRequest;

class ResetPasswordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'token'    => 'required|string',
            'email'    => 'required|email',
            'password' => 'required|string|min:8|confirmed',
        ];
    }

    public function messages(): array
    {
        return [
            'token.required'             => 'El token es requerido.',
            'email.required'             => 'El correo electrónico es requerido.',
            'email.email'                => 'El correo electrónico no es válido.',
            'password.required'          => 'La contraseña es requerida.',
            'password.min'               => 'La contraseña debe tener al menos 8 caracteres.',
            'password.confirmed'         => 'Las contraseñas no coinciden.',
        ];
    }
}