<?php

return [

    /*
    |--------------------------------------------------------------------------
    | HOME MODAL
    |--------------------------------------------------------------------------
    */
    'home_modal' => [
        'start_date'  => '2026-04-17',
        'end_date'    => '2026-05-29',
        'is_visible'  => true,
        'image'       => 'https://storage.googleapis.com/daryza_dev/sections/1/images/69a08e07e217f.webp',
    ],

    /*
    |--------------------------------------------------------------------------
    | HOME BANNER
    |--------------------------------------------------------------------------
    */
    'home_banner' => [
        'slides' => [
            [
                'id'        => '1771912716145',
                'type'      => 'video',
                'is_active' => true,
                'link_url'  => null,
                'src_video' => 'https://storage.googleapis.com/daryza_dev/sections/2/videos/699d4001b882f.mp4',
            ],
            [
                'id'         => '1771913181364',
                'type'       => 'image',
                'is_active'  => true,
                'link_url'   => null,
                'src_desktop' => 'https://storage.googleapis.com/daryza_dev/sections/2/images/699d4220b0474.webp',
                'src_mobile' => 'https://storage.googleapis.com/daryza_dev/sections/2/images/699d400995a36.webp',
            ],
            [
                'id'         => '1771913190430',
                'type'       => 'url',
                'is_active'  => true,
                'link_url'   => 'https://dev-daryza.playgrouplatam.com/',
                'src_desktop' => 'https://storage.googleapis.com/daryza_dev/sections/2/images/699d422288763.webp',
                'src_mobile' => 'https://storage.googleapis.com/daryza_dev/sections/2/images/699d400b3d851.jpg',
            ],
        ],
    ],


    /*
    |--------------------------------------------------------------------------
    | HOME PROMO IMAGE
    |--------------------------------------------------------------------------
    */
    'home_promo_image' => [
        'link_url'     => 'https://dev-daryza.playgrouplatam.com/',
        'image_desktop' => 'https://storage.googleapis.com/daryza_dev/sections/4/images/699d4306564c0.webp',
        'image_mobile' => 'https://storage.googleapis.com/daryza_dev/sections/4/images/699d4307cae49.webp',
    ],

    /*
    |--------------------------------------------------------------------------
    | HOME PROMO DYNAMIC
    |--------------------------------------------------------------------------
    */
    'home_promo_dynamic' => [
        'items' => [
            ['id' => '1', 'alt' => null, 'link' => 'https://dev-daryza.playgrouplatam.com/', 'src' => 'https://storage.googleapis.com/daryza_dev/sections/5/images/699d45ca6da5c.webp'],
            ['id' => '2', 'alt' => null, 'link' => 'https://dev-daryza.playgrouplatam.com/', 'src' => 'https://storage.googleapis.com/daryza_dev/sections/5/images/699d45cbd15c4.webp'],
            ['id' => '3', 'alt' => null, 'link' => 'https://dev-daryza.playgrouplatam.com/', 'src' => 'https://storage.googleapis.com/daryza_dev/sections/5/images/699d45cc67d7a.jpg'],
            ['id' => '4', 'alt' => null, 'link' => 'https://dev-daryza.playgrouplatam.com/', 'src' => 'https://storage.googleapis.com/daryza_dev/sections/5/images/699d45cd400c8.jpg'],
            ['id' => '5', 'alt' => null, 'link' => null,                                    'src' => 'https://storage.googleapis.com/daryza_dev/sections/5/images/699d45ce1ce66.webp'],
            ['id' => '6', 'alt' => null, 'link' => 'https://dev-daryza.playgrouplatam.com/', 'src' => 'https://storage.googleapis.com/daryza_dev/sections/5/images/699d45ce968db.webp'],
            ['id' => '7', 'alt' => null, 'link' => null,                                    'src' => 'https://storage.googleapis.com/daryza_dev/sections/5/images/699d45cf1a52c.webp'],
            ['id' => '8', 'alt' => null, 'link' => null,                                    'src' => 'https://storage.googleapis.com/daryza_dev/sections/5/images/699d45cf95aa6.webp'],
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
                'icon' => 'https://storage.googleapis.com/daryza_dev/sections/6/images/699d447eda825.png',
            ],
            [
                'id'   => '2',
                'text' => 'Envíos a toda Lima Metropolitana',
                'icon' => 'https://storage.googleapis.com/daryza_dev/sections/6/images/699d448050eed.png',
            ],
            [
                'id'   => '3',
                'text' => 'Servicio postventa comprometido contigo',
                'icon' => 'https://storage.googleapis.com/daryza_dev/sections/6/images/699d4480a9e86.png',
            ],
            [
                'id'   => '4',
                'text' => 'Pagos 100% seguros y protegidos',
                'icon' => 'https://storage.googleapis.com/daryza_dev/sections/6/images/699d44811fe15.png',
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
        'title'             => 'No te pierdas las últimas novedades',
        'description'       => 'Recibe y no teperderas bro en tu correo electrónico promociones exclusivas, campañas especiales, las últimas novedades, nuevos lanzamientos e innovaciones de las soluciones Daryza.',
        'input_placeholder' => 'correo@e12jemplo.com',
        'button_text'       => 'Suscribiddrse',
    ],

];
