// types/productCategories.ts

import { Metadata } from './metadata';

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

// AttributeValue.ts
export interface AttributeValue {
    id: number;
    attribute_id: number;
    value: string;
    created_at: string;
    updated_at: string;
}

export interface AttributeWithValues extends Attribute {
    values: AttributeValue[]; // ya vienen cargados
}

// Attribute.ts

export type AttributeType = 'select' | 'number' | 'boolean' | 'text';
export interface AttributeTypeOption {
    value: AttributeType;
    label: string;
}

export interface Attribute {
    id: number;
    name: string;
    type: AttributeType;
    is_filterable: boolean;
    is_variant: boolean;
    values: AttributeValue[];
    created_at: string;
    updated_at: string;
}

export type PaginatedAttributes = Paginated<Attribute>;
