import { Metadata } from '../metadata';
import { Media } from './media';

export interface ProductCategory {
    id: string;
    name: string;
    slug: string;
}

export interface AttributeValueRef {
    id: string;
    attribute_id: string;
    value: string;
    attribute: {
        name: string;
    };
}

export interface ProductVariantAttributeBase {
    attribute_id: string;
    attribute_value_id: string | null;
    value?: string;
}

export interface ProductSpecificationBase {
    attribute_id: string;
    value: string;
}

export interface ProductVariantBase {
    id: string;
    sku: string;
    stock: number;
    is_active?: boolean;
    is_on_promo: boolean;
    is_main: boolean;
    promo_start_at?: string | null;
    promo_end_at?: string | null;
    media: Media[];
}

export interface ProductBase {
    id: string;
    name: string;
    slug: string;
    brief_description?: string | null;
    description?: string | null;
    is_active: boolean;
    metadata?: Metadata;
    created_at?: string;
    updated_at?: string;
    categories?: string[];
    variant_attribute_ids?: string[];
}

