export interface OrderRow {
    id: string;
    code: string;
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
    quantity: number;
    unit_price: string;
    line_total: string;
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
    customer_mobile_phone: string;
    payment_method_type: 'bank_transfer' | 'niubiz';
    allowed_actions?: string[];
    rollback_action?: string | null;
    rollback_label?: string | null;
    total: string;
    delivery_cost: string;
    subtotal: string;
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
