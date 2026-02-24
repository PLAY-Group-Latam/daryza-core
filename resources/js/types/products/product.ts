import { Media } from './media';
import {
    type AttributeValueRef,
    type ProductBase,
    type ProductCategory,
    type ProductSpecificationBase,
    type ProductVariantAttributeBase,
    type ProductVariantBase,
} from './product.shared';

export interface ProductSpecification extends ProductSpecificationBase {
    attribute_name: string;
}

export interface ProductAttribute extends ProductVariantAttributeBase {
    attribute_name: string;
    attribute_value: string;
}

export interface ProductVariant extends ProductVariantBase {
    price: string | number;
    promo_price: string | null;
    attributes: ProductAttribute[];
    attribute_values: AttributeValueRef[];
}

export interface Product extends ProductBase {
    category?: ProductCategory | null;
    variants: ProductVariant[];
    technicalSheets?: Media[];
    specifications?: ProductSpecification[];
    category_id?: string;
}
