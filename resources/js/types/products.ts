/* eslint-disable @typescript-eslint/no-explicit-any */
// types/productCategories.ts

export interface Category {
    id: string;
    name: string;
    slug: string;
    image?: string | null;
    parent_id?: string | null;
    order?: number;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;

    // Relaciones
    parent?: Category | null;
    children?: Category[];
}

export type PaginatedProductCategories = Paginated<Category>;

// types/productCategories.ts

export type CategorySelect = {
    id: string;
    name: string;
    parent_id: string | null;
    order: number;
    active_children: CategorySelect[];
};

export interface Product {
    id: string;
    name: string;
    slug: string;
    price: number;
    stock: number;
    category?: {
        id: string;
        name: string;
    };
    created_at: string;
    updated_at: string;
}

// types.ts
export interface ProductFormValues {
    name: string;
    slug: string;
    code?: string;
    category_id: string | null;
    brief_description?: string;
    description?: string;
    is_active: boolean;

    metadata: {
        meta_title?: string;
        meta_description?: string;
        canonical_url?: string;
        og_title?: string;
        og_description?: string;
        noindex: boolean;
        nofollow: boolean;
    };

    variants: any[];
    media: any[];
    specifications: any[];
}
