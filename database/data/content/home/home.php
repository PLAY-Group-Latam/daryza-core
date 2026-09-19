<?php

return [


    /*
    |--------------------------------------------------------------------------
    | HOME MODAL
    |--------------------------------------------------------------------------
    */
    'home_modal' => [
        'start_date'  => '2026-04-17',
        'end_date'    => '2026-10-12',
        'is_visible'  => true,
        'image'       => 'https://storage.googleapis.com/daryza/static/fallbacks/fallback_Daryza_i.webp',
    ],

    /*
    |--------------------------------------------------------------------------
    | HOME BANNER
    |--------------------------------------------------------------------------
    */
    'home_banner' => [
        'slides' => [
         
    
            [
                'id'         => '1771913190430',
                'type'       => 'url',
                'is_active'  => true,
                'link_url'   => 'https://daryza.com/',
                'src_desktop' => 'https://storage.googleapis.com/daryza/static/fallbacks/fallback_Daryza_i.webp',
                'src_mobile' => 'https://storage.googleapis.com/daryza/static/fallbacks/fallback_Daryza_i.webp',
            ],
        ],
    ],


    /*
    |--------------------------------------------------------------------------
    | HOME PROMO IMAGE
    |--------------------------------------------------------------------------
    */
    'home_promo_image' => [
        'link_url'     => 'https://daryza.com/',
        'image_desktop' => 'https://storage.googleapis.com/daryza/static/fallbacks/fallback_Daryza_i.webp',
        'image_mobile' => 'https://storage.googleapis.com/daryza/static/fallbacks/fallback_Daryza_i.webp',
    ],

    /*
    |--------------------------------------------------------------------------
    | HOME PROMO DYNAMIC
    |--------------------------------------------------------------------------
    */
    'home_promo_dynamic' => [
        'items' => [
            ['id' => '1', 'alt' => null, 'link' => 'https://daryza.com/', 'src' => 'https://storage.googleapis.com/daryza/static/fallbacks/fallback_Daryza_i.webp'],
            ['id' => '2', 'alt' => null, 'link' => 'https://daryza.com/', 'src' => 'https://storage.googleapis.com/daryza/static/fallbacks/fallback_Daryza_i.webp'],
            ['id' => '3', 'alt' => null, 'link' => 'https://daryza.com/', 'src' => 'https://storage.googleapis.com/daryza/static/fallbacks/fallback_Daryza_i.webp'],
            ['id' => '4', 'alt' => null, 'link' => 'https://daryza.com/', 'src' => 'https://storage.googleapis.com/daryza/static/fallbacks/fallback_Daryza_i.webp'],
            ['id' => '5', 'alt' => null, 'link' => null,                                    'src' => 'https://storage.googleapis.com/daryza/static/fallbacks/fallback_Daryza_i.webp'],
            ['id' => '6', 'alt' => null, 'link' => 'https://daryza.com/', 'src' => 'https://storage.googleapis.com/daryza/static/fallbacks/fallback_Daryza_i.webp'],
            ['id' => '7', 'alt' => null, 'link' => null,                                    'src' => 'https://storage.googleapis.com/daryza/static/fallbacks/fallback_Daryza_i.webp'],
            ['id' => '8', 'alt' => null, 'link' => null,                                    'src' => 'https://storage.googleapis.com/daryza/static/fallbacks/fallback_Daryza_i.webp'],
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | HOME ATTRIBUTES
    |--------------------------------------------------------------------------
    */
    'home_attributes' => [
        'items' => [
            [
                'id'   => '1',
                'text' => 'Productos certificados con respaldo técnico garantizado',
                'icon' => 'https://storage.googleapis.com/daryza/static/home/home1.png',
            ],
            [
                'id'   => '2',
                'text' => 'Envíos a toda Lima Metropolitana',
                'icon' => 'https://storage.googleapis.com/daryza/static/home/home2.png',
            ],
            [
                'id'   => '3',
                'text' => 'Servicio postventa comprometido contigo',
                'icon' => 'https://storage.googleapis.com/daryza/static/home/home3.png',
            ],
            [
                'id'   => '4',
                'text' => 'Pagos 100% seguros y protegidos',
                'icon' => 'https://storage.googleapis.com/daryza/static/home/home4.png',
            ],
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | HOME SECTION TITLE
    |--------------------------------------------------------------------------
    */
    'home_section_title' => [
        'titles' => [
            ['key' => 'brands',      'label' => 'Marcas Aliadas'],
            ['key' => 'best_sellers', 'label' => 'Los más vendidos'],
            ['key' => 'pack',        'label' => 'Pack de Productos'],
            ['key' => 'blog',        'label' => 'Nuestro Blog'],
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | HOME NEWSLETTER
    |--------------------------------------------------------------------------
    */
    'home_newsletter' => [
        'title'             => 'Suscríbete y recibe las últimas novedades',
        'description'       => 'Recibe en tu correo electrónico promociones exclusivas, campañas especiales, las últimas novedades, nuevos lanzamientos e innovaciones de Daryza.',
        'input_placeholder' => 'correo@ejemplo.com',
        'button_text'       => 'Suscribirse',
    ],

];
