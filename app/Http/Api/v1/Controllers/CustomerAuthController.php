<?php

namespace App\Http\Api\v1\Controllers;

use App\Http\Api\v1\Requests\Customers\LoginCustomerRequest;
use App\Http\Api\v1\Requests\Customers\RegisterCustomerRequest;
use App\Http\Api\v1\Services\CustomerService;
use Tymon\JWTAuth\Exceptions\JWTException;
use Tymon\JWTAuth\Facades\JWTAuth;

class CustomerAuthController extends Controller
{

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

  public function me()
  {
    $user = auth('api')->user();

    if (!$user) {
      return $this->error(
        'Usuario no autenticado',
        null,
        401
      );
    }
    return $this->success(
      'Usuario autenticado correctamente',
      ['user' => $user->toArray()]
    );
  }

  public function logout()
  {
    try {
      if ($token = JWTAuth::getToken()) {
        JWTAuth::invalidate($token);
      }
    } catch (JWTException $e) {
      // no hacemos nada, logout debe continuar
    }

    return $this->success('Cerró sesión exitosamente')
      ->withCookie(cookie()->forget('jwt'));
  }
}
