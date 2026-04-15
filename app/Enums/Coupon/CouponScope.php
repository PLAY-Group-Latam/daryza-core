<?php

namespace App\Enums\Coupon;

enum CouponScope: string
{
    case Global       = 'global';
    case Product      = 'product';
    case Category     = 'category';
    case Pack         = 'pack';
    case BusinessDynamic = 'business_dynamic';
    case Customer        = 'customer';
}
