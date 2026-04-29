<?php

namespace App\Http\Api\v1\Middleware;

use Closure;

class JwtFromCookie
{
  public function handle($request, Closure $next)
  {
    $cookieName = config('jwt.access_cookie_name', 'jwt');

    // logger('🟦 JwtFromCookie ejecutado', [
    //   'jwt_cookie' => $request->cookie($cookieName),
    // ]);
    // Si viene la cookie 'jwt', la pasamos al header Authorization
    if ($token = $request->cookie($cookieName)) {
      // logger('Token tomado de cookie', ['token' => $token]);

      $request->headers->set('Authorization', 'Bearer ' . $token);
    }

    return $next($request);
  }
}
