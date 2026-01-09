// types/customerMetrics.ts
export interface BillingProfile {
    ruc: string;
    social_reason: string;
}

export interface CustomerMetrics {
    total_orders: number;
    total_spent: number;
    average_order_value: number;
}
export interface LocationItem {
    id: number;
    name: string;
}
export interface Address {
    address: string;
    reference?: string | null;
    postal_code?: string;
    department: LocationItem;
    province: LocationItem;
    district: LocationItem;
    country?: string;
    label?: string;
}

export interface Customer {
    id: string;
    full_name: string;
    email: string;
    phone?: string | null;
    password?: string | null;
    google_id?: string | null;
    photo?: string | null;
    dni?: string | null;
    created_at?: string;
    updated_at?: string;
    addresses?: Address[];
    metrics?: CustomerMetrics;
    billing_profile?: BillingProfile | null;
}

export type PaginatedCustomers = Paginated<Customer>;
