import { Customer } from '../customers';

export type DiscountType = 'fixed' | 'percentage';
export type CouponScope = 'global' | 'category' | 'product' | 'pack' | 'business_line' | 'customer';
type CouponRelationItem = { id: string; name?: string | null };

export interface CouponRedemption {
    id: string;
    coupon_id: string;
    customer_id: string;
    discount_applied: number; // 👈 nuevo
    redeemed_at: string;
    created_at: string;
    updated_at: string;
    customer?: Customer;
}

export interface CouponModel {
    id?: string;
    code: string;
    description: string | null;
    discount_type: DiscountType;
    discount_amount: number;
    maximum_discount_amount: number | null;
    minimum_order_amount: number;
    scope: CouponScope;
    is_active: boolean;
    is_public: boolean;
    usage_limit: number | null;
    usage_limit_per_user: number | null;
    usage_count?: number;
    usage_count_by_customer?: number | null;
    remaining_usage_global?: number | null;
    remaining_usage_by_customer?: number | null;
    // 👈 usage_count eliminado
    valid_from: string | null;
    valid_until: string | null;
    created_at?: string;
    updated_at?: string;
    deleted_at?: string | null; // 👈 nuevo por softDeletes

    // Relaciones
    products?: CouponRelationItem[];
    categories?: CouponRelationItem[];
    packs?: CouponRelationItem[];
    business_lines?: CouponRelationItem[];  // 👈 renombrado de business_dynamics
    customers?: Customer[];
    redemptions?: CouponRedemption[];
}

export interface PaginatedCoupons {
    data: CouponModel[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}
