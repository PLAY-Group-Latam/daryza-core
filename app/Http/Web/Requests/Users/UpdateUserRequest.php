<?php

namespace App\Http\Web\Requests\Users;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
{
  public function authorize(): bool
  {
    return true;
  }

  public function rules(): array
  {
    return [
      'name' => ['required', 'string', 'max:255'],
      'email' => [
        'required',
        'email',
        Rule::unique('users', 'email')->ignore($this->route('user')),
      ],
      'password' => ['nullable', 'confirmed', 'min:8'],
    ];
  }

  public function messages(): array
  {
    return [
      'name.required' => 'El nombre es obligatorio.',
      'email.required' => 'El correo electrónico es obligatorio.',
      'email.email' => 'Debe ingresar un correo electrónico válido.',
      'email.unique' => 'El correo ya está registrado.',
      'password.confirmed' => 'Las contraseñas no coinciden.',
      'password.min' => 'La contraseña debe tener al menos 8 caracteres.',
    ];
  }
}
