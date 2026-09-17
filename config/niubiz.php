<?php

return [
    'enabled' => env('NIUBIZ_ENABLED', false),

    // Endpoints REST de Niubiz.
    'security_url' => env('NIUBIZ_SECURITY_URL', 'https://apisandbox.vnforappstest.com/api.security/v1/security'),
    'session_url' => env('NIUBIZ_SESSION_URL', 'https://apisandbox.vnforappstest.com/api.ecommerce/v2/ecommerce/token/session'),
    'authorization_url' => env('NIUBIZ_AUTHORIZATION_URL', 'https://apisandbox.vnforappstest.com/api.authorization/v3/authorization/ecommerce'),

    'user' => env('NIUBIZ_USER', env('NIUBIZ_USERNAME')),
    'password' => env('NIUBIZ_PASSWORD'),

    'currency' => env('NIUBIZ_CURRENCY', 'PEN'),
    'merchant_id' => env('NIUBIZ_MERCHANT_ID'),

    // dataMap de autorización (datos del comercio).
    'url_address' => env('NIUBIZ_URL_ADDRESS'),
    'service_location_country' => env('NIUBIZ_SERVICE_LOCATION_COUNTRY', 'PER'),

    // dataMap de sesión (info del cliente; si no se tiene, la del comercio).
    'cardholder' => [
        'city' => env('NIUBIZ_CARDHOLDER_CITY', 'Lima'),
        'country' => env('NIUBIZ_CARDHOLDER_COUNTRY', 'PE'),
        'address' => env('NIUBIZ_CARDHOLDER_ADDRESS'),
        'postal_code' => env('NIUBIZ_CARDHOLDER_POSTAL_CODE'),
        'state' => env('NIUBIZ_CARDHOLDER_STATE', 'LIM'),
        'phone' => env('NIUBIZ_CARDHOLDER_PHONE'),
    ],

    // Timeout HTTP del backend hacia Niubiz. Debe ser MAYOR que el límite de
    // Niubiz (60 s) para seguir escuchando y recibir su respuesta (resultado o 504).
    'timeout' => env('NIUBIZ_TIMEOUT', 65),
    'resolve_ip' => env('NIUBIZ_RESOLVE_IP'),
    'debug' => env('NIUBIZ_DEBUG', false),
];
