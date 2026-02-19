// types/productCategories.ts

import { Metadata } from './metadata';

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

export interface VariantAttribute {
    attribute_id: number;
    attribute_value_id: number;
    attribute_name?: string; // opcional para frontend
    value_name?: string; // opcional para frontend
}

export interface VariantMedia {
    id?: number;
    type: 'image' | 'video' | 'technical_sheet';
    file_path: string;
    is_main?: boolean;
    order?: number;
}

export interface ProductSpecification {
    id?: number;
    name: string;
    value: string;
}

export interface ProductVariant {
    id?: string;
    sku: string;
    price: number;
    promo_price?: number;
    is_on_promo?: boolean;
    stock: number;

    attributes: VariantAttribute[];
    media: VariantMedia[];
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

    metadata: Metadata;

    variants: ProductVariant[];
    specifications: ProductSpecification[];
}
