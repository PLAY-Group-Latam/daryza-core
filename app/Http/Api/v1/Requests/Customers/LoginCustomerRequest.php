<?php

namespace App\Http\Api\v1\Requests\Customers;

use Illuminate\Foundation\Http\FormRequest;

class LoginCustomerRequest extends FormRequest
{
  public function authorize(): bool
  {
    return true;
  }
  public function rules(): array
  {
    return [
      'email' => 'required|email',
      'password' => 'required|string|min:6',
    ];
  }

  public function messages(): array
  {
    return [
      'email.required' => 'El correo es obligatorio.',
      'email.email' => 'El correo debe tener un formato válido.',
      'password.required' => 'La contraseña es obligatoria.',
      'password.string' => 'La contraseña debe ser texto.',
      'password.min' => 'La contraseña debe tener al menos 6 caracteres.',
    ];
  }
}
