<?php

use App\Models\Leads\Lead;

return [

    'contact_recipients' => [
        Lead::TYPE_HELP_CENTER      => env('MAIL_HELP_CENTER'),
        Lead::TYPE_DISTRIBUTOR      => env('MAIL_DISTRIBUTOR'),
        Lead::TYPE_ADVISOR          => env('MAIL_ADVISOR'),
        Lead::TYPE_CUSTOMER_SERVICE => env('MAIL_CUSTOMER_SERVICE'),
        Lead::TYPE_ABOUT_US         => env('MAIL_ABOUT_US'),
        Lead::TYPE_WORK_WITH_US     => env('MAIL_WORK_WITH_US'),
    ],

    'claim_admin_email' => env('MAIL_CLAIMS'),

    'social_links' => [
        'facebook' => env('MAIL_SOCIAL_FACEBOOK'),
        'instagram' => env('MAIL_SOCIAL_INSTAGRAM'),
        'youtube' => env('MAIL_SOCIAL_YOUTUBE'),
        'linkedin' => env('MAIL_SOCIAL_LINKEDIN'),
    ],

    'contact_phone' => env('MAIL_CONTACT_PHONE', '+51 1 234 5678'),

    'assets' => [
        'logo' => env('MAIL_ASSET_LOGO', 'https://storage.googleapis.com/daryza_dev/logo-email-daryza.png'),
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

];
