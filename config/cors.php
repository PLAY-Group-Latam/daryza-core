<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    'paths' => ['api/*'],

    'allowed_methods' => ['*'],

   'allowed_origins' => [
        'http://localhost:3000', 
        'https://dev-daryza.playgrouplatam.com',
        'https://3mb899v9-3000.brs.devtunnels.ms', // <-- ¡Agrega esta línea aquí!
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [], // importante si usas header Bearer

    'max_age' => 0,

    'supports_credentials' => true,

];
