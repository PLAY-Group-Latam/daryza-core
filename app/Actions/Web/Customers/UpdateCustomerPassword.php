<?php

namespace App\Actions\Web\Customers;

use App\Http\Web\Services\CustomerService;
use Illuminate\Http\Request;

class UpdateCustomerPassword
{
  public function __construct(
    protected CustomerService $customerService
  ) {}

  public function execute(string $customerId, Request $request): void
  {
    $validated = $request->validate(
      [
        'password' => ['required', 'string', 'min:6', 'confirmed'],
      ],
      [
        'password.required' => 'La contraseña es obligatoria.',
        'password.string' => 'La contraseña debe ser una cadena de texto.',
        'password.min' => 'La contraseña debe tener al menos :min caracteres.',
        'password.confirmed' => 'Las contraseñas no coinciden. Por favor, confirma correctamente.',
      ]
    );

    $this->customerService->updatePassword(
      $customerId,
      $validated['password']
    );
  }
}
