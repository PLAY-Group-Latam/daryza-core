<?php

namespace App\Http\Api\v1\Requests\Customers;

use Illuminate\Foundation\Http\FormRequest;

class RegisterCustomerRequest extends FormRequest
{
  public function authorize(): bool
  {
    return true;
  }

  public function rules(): array
  {
    return [
      'full_name' => ['required', 'string', 'max:255'],
      'email'     => ['required', 'email', 'unique:customers,email'],
      'phone'     => ['nullable', 'string', 'unique:customers,phone'],
      'password'  => ['nullable', 'string', 'min:6'],
      'google_id' => ['nullable', 'string'],
      'photo'     => ['nullable', 'string'],
      'dni'       => ['nullable', 'string', 'size:8', 'unique:customers,dni'],
    ];
  }

  public function messages(): array
  {
    return [
      'full_name.required' => 'El nombre completo es obligatorio.',
      'email.required'     => 'El correo es obligatorio.',
      'email.email'        => 'El correo no es válido.',
      'email.unique'       => 'Este correo ya está registrado.',

      'phone.unique'       => 'Este número de teléfono ya está registrado.',

      'password.min'       => 'La contraseña debe tener al menos 6 caracteres.',

      'dni.size'           => 'El DNI debe tener exactamente 8 dígitos.',
      'dni.unique'         => 'Este DNI ya está registrado.',
    ];
  }
}
