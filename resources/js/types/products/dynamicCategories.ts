import { ProductVariant } from './product';

export interface DynamicCategory {
    id: string;
    name: string;
    slug: string;
    banner_image?: string | null;
    is_active: boolean;

    // Las fechas vienen como string (ISO 8601) desde Eloquent/Inertia
    starts_at?: string | null;
    ends_at?: string | null;

    created_at: string;
    updated_at: string;
    deleted_at?: string | null; // Por si usas SoftDeletes
    variants_ids?: string[];
}

/**
 * Interfaz para la respuesta paginada de Laravel
 */
export type PaginatedDynamicCategories = Paginated<DynamicCategory>;

// En tu archivo de tipos o en el componente
export interface SelectableVariant
    extends Pick<ProductVariant, 'id' | 'sku' | 'price' | 'is_on_promo'> {
    product_name: string; // Nombre del Product padre
    variant_name: string; // Nombre legible de la variante (ej: "Rojo / XL" o el valor del atributo principal)
}
