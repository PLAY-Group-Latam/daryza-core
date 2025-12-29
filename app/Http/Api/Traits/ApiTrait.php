<?php

namespace App\Http\Api\Traits;

trait ApiTrait
{
  public function success($message = null, $data = null, $status = 200)
  {
    return response()->json([
      'success' => true,
      'message' => $message,
      'data'    => $data,
    ], $status);
  }

  public function created($message = null, $data = null)
  {
    return $this->success($message, $data, 201);
  }

  public function error($message, $errors = null, $status = 400)
  {
    return response()->json([
      'success' => false,
      'message' => $message,
      'errors'  => $errors,
    ], $status);
  }

  // public function paginated($message = null, $paginator)
  // {
  //   return response()->json([
  //     'success' => true,
  //     'message' => $message,
  //     'data'    => $paginator->items(),
  //     'meta'    => [
  //       'total'        => $paginator->total(),
  //       'current_page' => $paginator->currentPage(),
  //       'per_page'     => $paginator->perPage(),
  //       'last_page'    => $paginator->lastPage(),
  //     ]
  //   ]);
  // }

  // Nuevo método para generar cookie JWT con soporte local/prod
  public function jwtCookie($token, $minutes = 60)
  {
    $isProd = config('app.env') === 'production';

    return cookie(
      name: 'jwt',
      value: $token,
      minutes: $minutes,
      path: '/',
      domain: $isProd ? 'https://daryza.vercel.app' : null, // dominio en prod, null en local
      secure: $isProd,
      httpOnly: true,
      raw: false,
      sameSite: $isProd ? 'None' : 'Lax'
    );
  }

  // Nuevo método para responder con cookie usando el helper
  public function successWithCookie($message, $data, $token, $minutes = 60, $status = 200)
  {
    return $this->success($message, $data, $status)
      ->withCookie($this->jwtCookie($token, $minutes));
  }
}
