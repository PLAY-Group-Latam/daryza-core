import { Product } from '@/types/products';

export interface Pack {
    id: number;
    name: string;
    slug?: string;

    description?: string | null;

    price: number;
    original_price?: number | null;

    is_active: boolean;

    // Relación con productos
    products?: PackProduct[];

    // Fechas
    created_at: string;
    updated_at: string;
}

export interface PackProduct {
    id: number;
    product_id: number;
    pack_id: number;

    quantity: number;

    product: Product;
}
export type PaginatedPacks = Paginated<Pack>;
