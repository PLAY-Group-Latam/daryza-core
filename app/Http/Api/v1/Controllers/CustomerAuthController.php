<?php

namespace App\Http\Api\v1\Controllers;

use App\Http\Api\Traits\ApiTrait;
use App\Http\Api\v1\Requests\Customers\LoginCustomerRequest;
use App\Http\Api\v1\Requests\Customers\RegisterCustomerRequest;
use App\Http\Api\v1\Services\CustomerService;

use Tymon\JWTAuth\Facades\JWTAuth;

class CustomerAuthController extends Controller
{
  use ApiTrait;

  public function __construct(protected CustomerService $customerService) {}




  public function register(RegisterCustomerRequest $request)
  {
    $customer = $this->customerService->create($request->validated());

    $token = JWTAuth::fromUser($customer);


    return $this->successWithCookie(
      'Cliente registrado correctamente',
      ['user' => $customer],
      $token
    );
  }
  public function login(LoginCustomerRequest $request)
  {
    $credentials = $request->only('email', 'password'); 

    /** @var \Tymon\JWTAuth\JWTGuard $auth */
    $auth = auth('api');

    if (!$token = $auth->attempt($credentials)) {
      return $this->error('Credenciales incorrectas.', 401);
    }

    $customer = auth('api')->user();


    return $this->successWithCookie(
      'Login exitoso',
      ['user' => $customer],
      $token
    );
  }

  // Logout (opcional)

  public function logout()
  {
    JWTAuth::invalidate(JWTAuth::getToken()); // invalida token actual

    $expiredCookie = cookie('jwt', '', -1);

    return $this->success('Logout exitoso')->withCookie($expiredCookie);
  }
}
