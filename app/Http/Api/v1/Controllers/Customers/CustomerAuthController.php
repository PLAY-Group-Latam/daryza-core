<?php

namespace App\Http\Api\v1\Controllers\Customers;

use App\Http\Api\v1\Controllers\Controller;
use App\Http\Api\v1\Requests\Customers\LoginCustomerRequest;
use App\Http\Api\v1\Requests\Customers\RegisterCustomerRequest;
use App\Http\Api\v1\Services\CustomerService;
use App\Models\Customers\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
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

  public function loginWithGoogle(Request $request)
  {
    $request->validate([
      'token' => 'required|string',
    ]);

    $idToken = $request->input('token');

    $response = Http::get(
      'https://oauth2.googleapis.com/tokeninfo',
      ['id_token' => $idToken]
    );

    if (!$response->ok()) {
      return $this->error('Token de Google inválido', 401);
    }

    $googleUser = $response->json();

    // 🔐 Validar que el token fue emitido para TU APP
    if ($googleUser['aud'] !== config('services.google.client_id')) {
      return $this->error('Token no válido para esta aplicación', 401);
    }

    $customer = $this->customerService->findOrCreateFromGoogle([
      'email'     => $googleUser['email'],
      'full_name' => $googleUser['name'] ?? $googleUser['email'],
      'google_id' => $googleUser['sub'],
      'photo'     => $googleUser['picture'] ?? null,
    ]);

    $token = JWTAuth::fromUser($customer);

    return $this->successWithCookie(
      'Login con Google exitoso',
      ['user' => $customer],
      $token
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

    $user->load('billingProfile');

    return $this->success(
      'Usuario autenticado correctamente',
      ['user' => $user]
    );
  }
}
