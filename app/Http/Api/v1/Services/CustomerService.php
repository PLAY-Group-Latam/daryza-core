<?php

namespace App\Http\Api\v1\Services;

use App\Models\Customers\Customer;
use Illuminate\Support\Facades\Hash;

class CustomerService
{
  /**
   * Crear un cliente (registro normal o con Google).
   */
  public function create(array $data): Customer
  {
    // Si envían password, encriptarlo
    if (isset($data['password'])) {
      $data['password'] = Hash::make($data['password']);
    }

    return Customer::create($data);
  }

  /**
   * Actualizar el perfil del cliente.
   */
  public function update(Customer $customer, array $data): Customer
  {
    if (isset($data['password'])) {
      $data['password'] = Hash::make($data['password']);
    }

    $customer->update($data);

    return $customer;
  }

  /**
   * Validar credenciales y retornar el cliente si son correctas.
   */
  public function validateCredentials(array $data): ?Customer
  {
    $customer = Customer::where('email', $data['email'])->first();

    if (!$customer || !Hash::check($data['password'], $customer->password)) {
      return null;
    }

    return $customer;
  }
}
