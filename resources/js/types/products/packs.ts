import { VariantSearchResult } from './search';

export interface PackItem {
    variant_id: string;
    product_id: string;
    sku: string;
    product_name: string;
    variant_name: string;
    quantity: number;
}

export interface ProductPack {
    id: string;
    code: string;
    name: string;
    slug: string;
    brief_description: string | null;
    description: string | null;
    stock: number;
    price: string; // Viene como "123.00"
    promo_price: string | null;
    is_active: boolean;
    show_on_home: boolean;
    is_on_promotion: boolean;
    promo_start_at: string | null; // Formato ISO o Y-m-d\TH:i
    promo_end_at: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;

    items: PackItem[];
}

export type SearchResult = VariantSearchResult;
export type PaginatedPacks = Paginated<ProductPack>;
