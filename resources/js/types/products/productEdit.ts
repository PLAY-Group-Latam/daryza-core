// types/products/productEdit.ts
import { Media } from './media';
import {
    type ProductBase,
    type ProductSpecificationBase,
    type ProductVariantAttributeBase,
    type ProductVariantBase,
} from './product.shared';

export type ProductVariantAttribute = ProductVariantAttributeBase;

export type ProductSpecification = ProductSpecificationBase;

export interface ProductVariant extends ProductVariantBase {
    sku_supplier?: string;
    price: number;
    promo_price?: number | null;
    is_active: boolean;
    media: Media[];
    attributes: ProductVariantAttribute[];
    specifications: ProductSpecification[];
}

export interface ProductRecommendable {
    id: string;
    code?: string | null;
    name: string;
    slug: string;
}

export interface ProductEdit extends ProductBase {
    is_home: boolean;
    categories: string[];
    business_lines: string[];
    recommended_product_ids: string[];
    recommended_products?: ProductRecommendable[];
    variant_attribute_ids: string[];
    variants: ProductVariant[];
    technicalSheets: Media[];
}
