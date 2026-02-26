import { ProductEdit } from '@/types/products/productEdit';
import { ProductFormValues } from './schema';

export function mapProductToForm(product: ProductEdit): ProductFormValues {
    return {
        name: product.name,
        slug: product.slug,
        brief_description: product.brief_description ?? '',
        description: product.description ?? '',
        is_active: product.is_active,
        is_home: product.is_home ?? false,
        categories: product.categories ?? [],
        business_lines: product.business_lines ?? [],
        recommended_product_ids: product.recommended_product_ids ?? [],
        variant_attribute_ids: product.variant_attribute_ids ?? [],

        variants: product.variants.map((v) => ({
            id: v.id,
            sku: v.sku,
            sku_supplier: v.sku_supplier ?? '',
            price: v.price,
            promo_price: v.promo_price ?? undefined,
            stock: v.stock,
            is_active: v.is_active,
            is_on_promo: v.is_on_promo,
            is_main: v.is_main,
            promo_start_at: v.promo_start_at
                ? new Date(v.promo_start_at)
                : undefined,
            promo_end_at: v.promo_end_at ? new Date(v.promo_end_at) : undefined,
            media: v.media ?? [],
            attributes: v.attributes ?? [],
            specifications: v.specifications ?? [],
        })),

        // technicalSheets comparten tabla media con type = 'technical_sheet'
        technicalSheets: product.technicalSheets ?? [],
        metadata: {
            meta_title: product.metadata?.meta_title ?? '',
            meta_description: product.metadata?.meta_description ?? '',
            canonical_url: product.metadata?.canonical_url ?? '',
            og_title: product.metadata?.og_title ?? '',
            og_description: product.metadata?.og_description ?? '',
            noindex: product.metadata?.noindex ?? false,
            nofollow: product.metadata?.nofollow ?? false,
        },
    };
}
