// types/products/product.ts
import { Metadata } from '../metadata';
import { Media } from './media';

export interface ProductVariantAttribute {
    attribute_id: string;
    attribute_value_id: string | null;
    value?: string;
}

export interface ProductSpecification {
    attribute_id: string;
    value: string;
}

export interface ProductVariant {
    id: string;
    sku: string;
    sku_supplier?: string;
    price: number;
    promo_price?: number;
    stock: number;
    is_active: boolean;
    is_on_promo: boolean;
    is_main: boolean;
    promo_start_at?: string; // ISO string del backend
    promo_end_at?: string; // ISO string del backend
    media: Media[];
    attributes: ProductVariantAttribute[];
    specifications: ProductSpecification[];
}

export interface ProductEdit {
    id: string;
    name: string;
    slug: string;
    brief_description?: string;
    description?: string;
    is_active: boolean;
    is_home: boolean;
    categories: string[]; // array de IDs
    business_lines: string[]; // array de IDs
    variant_attribute_ids: string[]; // array de IDs
    variants: ProductVariant[];
    technicalSheets: Media[]; // ya son Media directamente
    metadata?: Metadata;
}
