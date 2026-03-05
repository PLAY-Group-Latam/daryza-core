export interface VariantSearchResult {
    variant_id: string;
    product_id: string;
    sku: string;
    is_on_promo: boolean;
    product_name: string;
    variant_name: string;
    image?: string | null;
}
