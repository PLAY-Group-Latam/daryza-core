<?php

namespace App\Http\Api\Support;

class JwtCookie
{
    /**
     * Construye la cookie httpOnly que transporta el JWT del cliente.
     * Local: host-only, sin Secure y SameSite=Lax.
     * Producción: dominio compartido, Secure y SameSite=None.
     */
    public static function make(string $token)
    {
        $isProd = config('app.env') === 'production';

        return cookie(
            name: config('jwt.access_cookie_name', 'jwt'),
            value: $token,
            minutes: config('jwt.refresh_ttl'),
            path: '/',
            domain: $isProd ? '.playgrouplatam.com' : null,
            secure: $isProd,
            httpOnly: true,
            raw: false,
            sameSite: $isProd ? 'None' : 'Lax'
        );
    }

    /**
     * Cookie expirada con los mismos atributos que `make`, para que el navegador
     * elimine exactamente la misma cookie (mismo nombre, dominio y path).
     */
    public static function forget()
    {
        $isProd = config('app.env') === 'production';

        return cookie(
            name: config('jwt.access_cookie_name', 'jwt'),
            value: null,
            minutes: -1,
            path: '/',
            domain: $isProd ? '.playgrouplatam.com' : null,
            secure: $isProd,
            httpOnly: true,
            raw: false,
            sameSite: $isProd ? 'None' : 'Lax'
        );
    }
}
