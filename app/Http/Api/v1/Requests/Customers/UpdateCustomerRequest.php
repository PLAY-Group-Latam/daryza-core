<?php

namespace App\Http\Api\v1\Requests\Customers;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCustomerRequest extends FormRequest
{
  public function authorize(): bool
  {
    // Solo usuarios autenticados pueden actualizar
    return auth('api')->check();
  }

  public function rules(): array
  {
    $customerId = auth('api')->id(); // ID del usuario logueado

    return [
      'full_name' => ['required', 'string', 'max:255'],
      'email' => [
        'required',
        'email',
        Rule::unique('customers', 'email')->ignore($customerId),
      ],
      'dni' => [
        'required',
        'string',
        'size:8',
        Rule::unique('customers', 'dni')->ignore($customerId),
      ],
      'phone' => [
        'required',
        'string',
        'size:9',
        Rule::unique('customers', 'phone')->ignore($customerId),
      ],
      'is_company' => ['boolean'],
      'ruc' => [
        'nullable',
        'string',
        'size:11',
        Rule::unique('billing_profiles', 'ruc')->ignore($this->user()->billingProfile?->id ?? null),
      ],
      'social_reason' => [
        'nullable',
        'string',
        'max:255',
        Rule::unique('billing_profiles', 'social_reason')->ignore($this->user()->billingProfile?->id ?? null),
      ],
    ];
  }

  public function messages(): array
  {
    return [
      'full_name.required' => 'El nombre completo es obligatorio.',
      'email.required' => 'El correo es obligatorio.',
      'email.email' => 'El correo debe ser válido.',
      'email.unique' => 'Este correo ya está registrado.',
      'dni.required' => 'El DNI es obligatorio.',
      'dni.size' => 'El DNI debe tener 8 dígitos.',
      'dni.unique' => 'Este DNI ya está registrado.',
      'phone.required' => 'El teléfono es obligatorio.',
      'phone.size' => 'El teléfono debe tener 9 dígitos.',
      'phone.unique' => 'Este teléfono ya está registrado.',
      'ruc.size' => 'El RUC debe tener 11 dígitos.',
      'ruc.unique' => 'Este RUC ya está registrado.',
      'social_reason.unique' => 'Esta razón social ya está registrada.',
    ];
  }
}
