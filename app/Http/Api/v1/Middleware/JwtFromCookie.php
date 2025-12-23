<?php

namespace App\Http\Api\v1\Middleware;

use Closure;

class JwtFromCookie
{
  public function handle($request, Closure $next)
  {
    // logger('🟦 JwtFromCookie ejecutado', [
    //   'jwt_cookie' => $request->cookie('jwt'),
    // ]);
    // Si viene la cookie 'jwt', la pasamos al header Authorization
    if ($token = $request->cookie('jwt')) {
      // logger('Token tomado de cookie', ['token' => $token]);

      $request->headers->set('Authorization', 'Bearer ' . $token);
    }

    return $next($request);
  }
}
