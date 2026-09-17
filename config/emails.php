<?php

use App\Models\Leads\Lead;

return [
    'destination_emails' => [
        'pages' => [
            'contacto_centro_ayuda' => [
                'label' => 'Contáctanos - Centro de Ayuda',
                'fallback_env' => 'MAIL_HELP_CENTER',
                'fallback_email' => env('MAIL_HELP_CENTER'),
            ],
            'contacto_red_comercial' => [
                'label' => 'Contáctanos - Red Comercial',
                'fallback_env' => 'MAIL_DISTRIBUTOR',
                'fallback_email' => env('MAIL_DISTRIBUTOR'),
            ],
            'contacto_asesoria' => [
                'label' => 'Contáctanos - Asesoría',
                'fallback_env' => 'MAIL_ADVISOR',
                'fallback_email' => env('MAIL_ADVISOR'),
            ],
            'contacto_servicio_cliente' => [
                'label' => 'Contáctanos - Servicio al Cliente',
                'fallback_env' => 'MAIL_CUSTOMER_SERVICE',
                'fallback_email' => env('MAIL_CUSTOMER_SERVICE'),
            ],
            'nosotros' => [
                'label' => 'Nosotros',
                'fallback_env' => 'MAIL_ABOUT_US',
                'fallback_email' => env('MAIL_ABOUT_US'),
            ],
            'trabajos' => [
                'label' => 'Trabajos',
                'fallback_env' => 'MAIL_WORK_WITH_US',
                'fallback_email' => env('MAIL_WORK_WITH_US'),
            ],
            'libro_reclamaciones' => [
                'label' => 'Libro de Reclamaciones',
                'fallback_env' => 'MAIL_CLAIMS',
                'fallback_email' => env('MAIL_CLAIMS'),
            ],
            'landing_leads' => [
                'label' => 'Landing Leads',
                'fallback_env' => 'MAIL_LANDING_LEADS_ADMIN',
                'fallback_email' => env('MAIL_LANDING_LEADS_ADMIN'),
            ],
            'stock_bajo' => [
                'label' => 'Stock Bajo',
                'fallback_env' => 'MAIL_LOW_STOCK',
                'fallback_email' => env('MAIL_LOW_STOCK', env('MAIL_INVENTORY_ALERTS', 'info@tiendarubbermaidperu.com')),
            ],
            'stock_agotado' => [
                'label' => 'Stock Agotado',
                'fallback_env' => 'MAIL_OUT_OF_STOCK',
                'fallback_email' => env('MAIL_OUT_OF_STOCK', env('MAIL_INVENTORY_ALERTS', 'info@tiendarubbermaidperu.com')),
            ],
            'checkout_admin' => [
                'label' => 'Administración de Órdenes',
                'fallback_env' => 'MAIL_CHECKOUT_ADMIN',
                'fallback_email' => env('MAIL_CHECKOUT_ADMIN', 'info@tiendarubbermaidperu.com'),
            ],
        ],
    ],

    'contact_recipients' => [
        Lead::TYPE_HELP_CENTER    => env('MAIL_HELP_CENTER'),
        Lead::TYPE_DISTRIBUTOR    => env('MAIL_DISTRIBUTOR'),
        Lead::TYPE_ADVISOR        => env('MAIL_ADVISOR'),
        Lead::TYPE_CUSTOMER_SERVICE => env('MAIL_CUSTOMER_SERVICE'),
        Lead::TYPE_ABOUT_US       => env('MAIL_ABOUT_US'),
        Lead::TYPE_WORK_WITH_US   => env('MAIL_WORK_WITH_US'),
    ],

    'claim_admin_email' => env('MAIL_CLAIMS'),

    'admin_email_inventory' => env('MAIL_LOW_STOCK', env('MAIL_INVENTORY_ALERTS', 'info@tiendarubbermaidperu.com')),

    'admin_email_orders' => env('MAIL_CHECKOUT_ADMIN', 'info@tiendarubbermaidperu.com'),

    'landing_leads' => [
        'admin_email' => env('MAIL_LANDING_LEADS_ADMIN'),
        'attention_schedule' => env('MAIL_LAND_LEADS_ATTENTION_SCHEDULE', 'Lunes a viernes de 8am a 5 pm y sábado de 8am a 12 pm'),
    ],

    'social_links' => [
        'facebook' => env('MAIL_SOCIAL_FACEBOOK'),
        'instagram' => env('MAIL_SOCIAL_INSTAGRAM'),
        'youtube' => env('MAIL_SOCIAL_YOUTUBE'),
        'linkedin' => env('MAIL_SOCIAL_LINKEDIN'),
    ],

    'contact_phone' => env('MAIL_CONTACT_PHONE', '+51 1 234 5678'),

    'assets' => [
        'logo' => env('MAIL_ASSET_LOGO', 'https://storage.googleapis.com/daryza_dev/assets-mails/logo_daryza.png'),
        'website_icon' => env('MAIL_ASSET_ICON_WEBSITE', 'https://img.icons8.com/material-rounded/48/ffffff/globe--v1.png'),
        'phone_icon' => env('MAIL_ASSET_ICON_PHONE', 'https://img.icons8.com/ios-filled/50/ffffff/phone.png'),
        'location_icon' => env('MAIL_ASSET_ICON_LOCATION', 'https://img.icons8.com/ios-filled/50/ffffff/marker.png'),
        'social' => [
            'facebook' => env('MAIL_ASSET_ICON_FACEBOOK', 'https://img.icons8.com/ios-filled/50/ffffff/facebook-new.png'),
            'instagram' => env('MAIL_ASSET_ICON_INSTAGRAM', 'https://cdn.simpleicons.org/instagram/FFFFFF'),
            'youtube' => env('MAIL_ASSET_ICON_YOUTUBE', 'https://img.icons8.com/ios-filled/50/ffffff/youtube-play.png'),
            'linkedin' => env('MAIL_ASSET_ICON_LINKEDIN', 'https://img.icons8.com/ios-filled/50/ffffff/linkedin.png'),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Configuración de Órdenes (Transferencias y Contacto)
    |--------------------------------------------------------------------------
    */
    'orders_contact_email' => env('ORDERS_CONTACT_EMAIL', 'info@tiendarubbermaidperu.com'),
    'orders_contact_phone' => env('ORDERS_CONTACT_PHONE', '974 608 215'),

];