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

export interface SearchResult {
    variant_id: string; // Antes era 'id', ahora coincide con el PHP
    product_id: string; // Ya no es opcional, el PHP siempre lo envía
    sku: string;
    is_on_promo: boolean;
    product_name: string;
    variant_name: string;
}
export type PaginatedPacks = Paginated<ProductPack>;
