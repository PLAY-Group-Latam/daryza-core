import { Product, ProductVariant } from '@/types/products/product';

/**
 * Devuelve la variante principal de un producto.
 * Si no hay variante marcada como is_main, devuelve la primera.
 */
export const getMainVariant = (product: Product): ProductVariant | null => {
    if (!product?.variants || product.variants.length === 0) return null;

    return product.variants.find((v) => v.is_main) || product.variants[0];
};

/**
 * Devuelve la URL de la primera imagen de la variante.
 * Si no hay imágenes, devuelve un placeholder.
 */
export const getVariantFirstImage = (
    variant: ProductVariant | null,
): string => {
    if (!variant?.media || variant.media.length === 0) {
        return '/image-not-found.jpg';
    }

    // Tomar la primera imagen (tipo 'image')
    const firstImage = variant.media.find((m) => m.type === 'image');
    return firstImage?.file_path || '/image-not-found.jpg';
};
