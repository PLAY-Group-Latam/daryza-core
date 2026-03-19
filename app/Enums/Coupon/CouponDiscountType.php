<?php

namespace App\Enums\Coupon;

enum CouponDiscountType: string
{
    case Fixed      = 'fixed';
    case Percentage = 'percentage';
}