<?php

namespace App\Http\Api\v1\Controllers;

use App\Http\Api\Traits\ApiTrait;
use App\Http\Api\v1\Requests\Customers\LoginCustomerRequest;
use App\Http\Api\v1\Requests\Customers\RegisterCustomerRequest;
use App\Http\Api\v1\Services\CustomerService;
use App\Models\Customers\Customer;
use Illuminate\Support\Facades\Hash;

class CustomerAuthController extends Controller
{
  use ApiTrait;

  public function __construct(protected CustomerService $customerService) {}




  public function register(RegisterCustomerRequest $request)
  {
    $customer = $this->customerService->create($request->validated());

    $token = $customer->createToken('customer_token')->plainTextToken;

    return $this->created('Cliente registrado correctamente.', [
      'token' => $token,
      'user' => $customer
    ]);
  }

  public function login(LoginCustomerRequest $request)
  {
    $customer = $this->customerService->validateCredentials($request->validated());

    if (!$customer) {
      return $this->error('Credenciales incorrectas.', 401);
    }

    $token = $customer->createToken('customer_token')->plainTextToken;

    return $this->success('Login exitoso.', [
      'token' => $token,
      'user' => $customer,
    ]);
  }

  // public function edit(Customer $customer)
  // {
  //     $customer->load(['billingProfiles', 'addresses']);

  //     return Inertia::render('customers/Edit', [
  //         'customer' => $customer,
  //     ]);
  // }

  // public function update(UpdateCustomerRequest $request, Customer $customer): RedirectResponse
  // {
  //     $this->customerService->update($customer, $request->validated());

  //     return back()->with('flash', [
  //         'type' => 'success',
  //         'message' => 'Cliente actualizado correctamente.',
  //     ]);
  // }

  // public function destroy(Customer $customer): RedirectResponse
  // {
  //     try {
  //         $this->customerService->delete($customer);

  //         return back()->with('flash', [
  //             'type' => 'success',
  //             'message' => 'Cliente eliminado correctamente.',
  //         ]);
  //     } catch (\Exception $e) {
  //         return back()->with('flash', [
  //             'type' => 'error',
  //             'message' => $e->getMessage(),
  //         ]);
  //     }
  // }
}
