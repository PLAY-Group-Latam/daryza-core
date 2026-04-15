<?php

namespace App\Enums\Coupon;

enum CouponValidationError: string
{
    case NOT_FOUND                    = 'not_found';
    case INACTIVE                     = 'inactive';
    case NOT_YET_VALID                = 'not_yet_valid';
    case EXPIRED                      = 'expired';
    case USAGE_LIMIT_REACHED          = 'usage_limit_reached';
    case USAGE_LIMIT_PER_USER_REACHED = 'usage_limit_per_user_reached';
    case CART_NOT_FOUND               = 'cart_not_found';
    case MINIMUM_ORDER_AMOUNT_NOT_MET = 'minimum_order_amount_not_met';
    case CONTAINS_PROMOTED_PRODUCTS   = 'contains_promoted_products';
    case CUSTOMER_REQUIRED            = 'customer_required';
    case CUSTOMER_NOT_ALLOWED         = 'customer_not_allowed';
    case NO_MATCHING_CATEGORY_PRODUCTS    = 'no_matching_category_products';
    case NO_MATCHING_PRODUCT_COUPONS      = 'no_matching_product_coupons';
    case NO_MATCHING_PACK_PRODUCTS        = 'no_matching_pack_products';         // 👈 nuevo
    case NO_MATCHING_BUSINESS_DYNAMIC     = 'no_matching_business_dynamic';
}
