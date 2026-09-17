<?php

namespace App\Http\Api\v1\Controllers\Customers;

use App\Http\Api\v1\Controllers\Controller;
use App\Http\Api\v1\Requests\Customers\UpdateCustomerRequest;
use App\Models\Customers\Customer;


class CustomerController extends Controller
{
  /**
   * Actualiza los datos del usuario logueado
   */
  public function update(UpdateCustomerRequest $request)
  {
    $customer = Customer::findOrFail(auth('api')->id());

    $data = $request->validated();

    // Log::info('Datos recibidos en updateCustomer:', $data);

    $customer->update([
    'full_name'      => $data['full_name'],
    'full_last_name' => $data['full_last_name'] ?? null,
    'document_type'  => $data['document_type'] ?? null,
    'email'          => $data['email'],
    'dni'            => $data['dni'] ?? null,
    'phone'          => $data['phone'],
]);

    if (!empty($data['is_company'])) {
      $customer->billingProfile()->updateOrCreate(
        ['customer_id' => $customer->id],
        [
          'ruc' => $data['ruc'] ?? null,
          'social_reason' => $data['social_reason'] ?? null,
          'fiscal_address' => $data['fiscal_address'] ?? null,
        ]
      );
    }
    
    return $this->success('Datos actualizados correctamente', $customer);
  }
}
