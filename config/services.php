<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],
    'google' => [
        'client_id' => env('GOOGLE_CLIENT_ID'),
    ],

    'gcs' => [
        'project_id' => env('GCS_PROJECT_ID'),
        'bucket' => env('GCS_BUCKET'),
        'key_file' => env('GCS_KEY_FILE'),
    ],
    'niubiz' => [
        'enabled' => env('NIUBIZ_ENABLED', false),
        'api_url' => env('NIUBIZ_API_URL', env('NIUBIZ_BASE_URL', 'https://apiprod.vnforapps.com')),
        'base_url' => env('NIUBIZ_API_URL', env('NIUBIZ_BASE_URL', 'https://apiprod.vnforapps.com')),
        'resolve_ip' => env('NIUBIZ_RESOLVE_IP'),
        'debug' => env('NIUBIZ_DEBUG', false),
        'merchant_id' => env('NIUBIZ_MERCHANT_ID'),
        'user' => env('NIUBIZ_USER', env('NIUBIZ_USERNAME')),
        'username' => env('NIUBIZ_USERNAME'),
        'password' => env('NIUBIZ_PASSWORD'),
        'timeout' => env('NIUBIZ_TIMEOUT', 15),
    ],
    'mailgun' => [
        'domain' => env('MAILGUN_DOMAIN'),
        'secret' => env('MAILGUN_SECRET'),
        'endpoint' => env('MAILGUN_ENDPOINT', 'api.mailgun.net'),
        'scheme' => 'https',
    ],

];
