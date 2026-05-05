export interface Brand {
    id: string;
    name: string;
    slug: string;
    image?: string | null;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

export type PaginatedBrands = Paginated<Brand>;
