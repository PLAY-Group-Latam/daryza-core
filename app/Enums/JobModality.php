<?php

namespace App\Enums;

enum JobModality: string
{
    case ON_SITE = 'on_site';
    case REMOTE = 'remote';
    case HYBRID = 'hybrid';
}
