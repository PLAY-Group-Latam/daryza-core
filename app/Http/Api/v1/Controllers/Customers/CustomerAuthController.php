<?php

namespace App\Http\Api\v1\Controllers\Customers;

use App\Http\Api\v1\Controllers\Controller;
use App\Http\Api\v1\Requests\Customers\ForgotPasswordRequest;
use App\Http\Api\v1\Requests\Customers\LoginCustomerRequest;
use App\Http\Api\v1\Requests\Customers\RegisterCustomerRequest;
use App\Http\Api\v1\Requests\Customers\ResetPasswordRequest;
use App\Http\Api\v1\Services\CustomerService;
use App\Jobs\SendEmailJob;
use App\Mail\Login\SuccessLogin;
use App\Mail\ResetPassword\RecoveryPassword;
use App\Mail\ResetPassword\SuccessReset;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Password;
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

    SendEmailJob::dispatch(
      new SuccessLogin($customer->full_name ?? 'Usuario'),
      $customer->email
    );

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


 // Funciones de Recuperar contraseña
    public function forgotPassword(ForgotPasswordRequest $request)
{
    Password::broker('customers')->sendResetLink(
        $request->only('email'),
        function ($customer, $token) {
            $url = config('app.frontend_url')
                . '/recuperar-contrasena?token=' . $token
                . '&email=' . urlencode($customer->email);

            SendEmailJob::dispatch(
                new RecoveryPassword($customer->email, $url),
                $customer->email
            );
        }
    );

 
    return $this->success('Si este correo está registrado, recibirás un enlace en breve.');
}

    public function resetPassword(ResetPasswordRequest $request)
    {
        $status = Password::broker('customers')->reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($customer, $password) {
                $customer->forceFill([
                    'password' => bcrypt($password),
                ])->save();

                SendEmailJob::dispatch(
                    new SuccessReset($customer->full_name ?? 'Usuario'),
                    $customer->email
                );
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            return $this->error('Token inválido o expirado.', 400);
        }

        return $this->success('Contraseña actualizada correctamente.');
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
