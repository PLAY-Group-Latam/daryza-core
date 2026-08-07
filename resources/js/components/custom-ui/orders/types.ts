export interface OrderRow {
    id: string;
    code: string;
    customer_first_name?: string;
    customer_last_name?: string;
    customer_email: string;
    customer_document_number: string;
    total: string;
    payment_method_type?: 'bank_transfer' | 'niubiz';
    state: string;
    allowed_actions?: string[];
    rollback_action?: string | null;
    rollback_label?: string | null;
    created_at: string;
}

export interface OrderItem {
    id: string;
    product_name: string;
    variant_sku: string;
    item_type?: 'simple_product' | 'product_pack';
    quantity: number;
    unit_price: string;
    line_total: string;
    metadata?: {
        is_on_promo?: boolean;
        regular_price?: number | string | null;
        variant_attributes?: string[] | null;
    } | null;
}

export interface OrderPayment {
    id: string;
    method: string;
    status: string;
    amount: string;
    voucher_url?: string | null;
    created_at: string;
}

export interface OrderStatusHistory {
    id: string;
    from_status?: string | null;
    to_status: string;
    changed_by_type: string;
    note?: string | null;
    created_at: string;
}

export interface OrderDetail {
    id: string;
    code: string;
    state: string;
    customer_email: string;
    customer_first_name: string;
    customer_last_name: string;
    customer_document_number: string;
    customer_document_type?: string | null;
    customer_mobile_phone: string;
    voucher_type?: 'boleta' | 'factura';
    billing_ruc?: string | null;
    billing_social_reason?: string | null;
    billing_fiscal_address?: string | null;
    payment_method_type: 'bank_transfer' | 'niubiz';
    allowed_actions?: string[];
    rollback_action?: string | null;
    rollback_label?: string | null;
    total: string;
    delivery_cost: string;
    subtotal: string;
    discount_total: string;
    coupon_discount_total?: string;
    delivery_base_cost?: string;
    delivery_discount_total?: string;
    shipping_address_line: string;
    shipping_number?: string | null;
    shipping_floor_apartment?: string | null;
    shipping_reference?: string | null;
    district_name: string;
    province_name: string;
    department_name: string;
    created_at?: string;
    updated_at?: string;
    placed_at?: string | null;
    paid_at?: string | null;
    customer?: {
        id: string;
        full_name: string;
        full_last_name?: string | null;
        document_type?: string | null;
        email?: string | null;
        phone?: string | null;
        photo?: string | null;
        dni?: string | null;
    };
    items: OrderItem[];
    payments: OrderPayment[];
    status_history: OrderStatusHistory[];
}

export type FormErrors = Record<string, string | undefined>;
