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
}

export type PaginatedCustomers = Paginated<Customer>;
