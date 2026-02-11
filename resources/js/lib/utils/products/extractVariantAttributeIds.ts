import { Product } from '@/types/products/product';

export function extractVariantAttributeIds(product?: Product): string[] {
    if (!product?.variants?.length) return [];

    return Array.from(
        new Set(
            product.variants.flatMap(
                (variant) =>
                    variant.attribute_values?.map((av) => av.attribute_id) ??
                    [],
            ),
        ),
    );
}
