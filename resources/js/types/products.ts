// types/productCategories.ts

export interface Category {
    id: string;
    name: string;
    slug: string;
    image?: string | null;
    parent_id?: string | null;
    order: number;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;

    // Relaciones
    parent?: Category | null;
    children?: Category[];
}

export type PaginatedProductCategories = Paginated<Category>;
