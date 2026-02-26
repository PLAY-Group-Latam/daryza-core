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

];