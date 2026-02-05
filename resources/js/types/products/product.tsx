import { Metadata } from '../metadata';

export interface ProductSpecification {
    attribute_id: string;
    attribute_name: string;
    value: string;
}

export interface ProductAttribute {
    attribute_id: string;
    attribute_name: string;
    attribute_value_id: string;
    attribute_value: string;
    value?: string;
}
export interface Media {
    id?: number;
    type: 'image' | 'video' | 'technical_sheet';
    file_path: string;
    is_main?: boolean;
    order?: number;
}
export interface ProductVariant {
    id: string;
    sku: string;
    price: string;
    promo_price: string | null;
    promo_start_at?: string | null;
    promo_end_at?: string | null;
    is_active?: boolean;

    is_on_promo: boolean;
    stock: number;
    attributes: ProductAttribute[];
    attribute_values: {
        id: string;
        attribute_id: string;
        value: string;
        attribute: {
            name: string;
        };
    }[];
    media: Media[];
    is_main: boolean;
}

export interface ProductCategory {
    id: string;
    name: string;
    slug: string;
}

export interface Product {
    id: string;
    name: string;
    slug: string;
    category: ProductCategory | null;
    brief_description: string;
    description: string;
    is_active: boolean;
    variants: ProductVariant[];
    technicalSheets: Media[];
    specifications: ProductSpecification[];
    metadata: Metadata;
    created_at: string;
    updated_at: string;
    category_id?: string;
}

export interface VariantAttributeEdit {
    attribute_id: string; // ULID
    attribute_value_id?: string; // ULID
    value?: string | boolean | number;
}
export interface MediaExisting {
    id: string;
    type: 'image' | 'video' | 'technical_sheet';
    file_path: string;
    is_main?: boolean;
    order?: number;
}

export interface ProductVariantEdit {
    sku: string;

    price: number;
    promo_price?: number | null;

    is_on_promo: boolean;
    promo_start_at?: string | null;
    promo_end_at?: string | null;

    stock: number;

    is_active?: boolean;
    is_main: boolean;

    media: MediaExisting[]; // puedes tiparlo luego si quieres

    attributes: VariantAttributeEdit[];
}

export interface TechnicalSheetEdit {
    file?: File; // solo cuando se sube uno nuevo
    file_path?: string; // existente en backend
}

export interface ProductSpecificationEdit {
    attribute_id: string;
    value: string | boolean | number;
}

export interface ProductEdit {
    id: string;

    name: string;
    slug: string;
    category_id: string;

    brief_description?: string;
    description?: string;

    is_active: boolean;

    metadata: Metadata;

    variant_attribute_ids: string[];

    variants: ProductVariantEdit[];

    technicalSheets: TechnicalSheetEdit[];

    specifications: ProductSpecificationEdit[];
}
