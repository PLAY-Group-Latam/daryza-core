export interface DynamicCategoryItem {
    variant_id: string;
    product_id: string;
    sku: string;
    product_name: string;
    variant_name?: string;
}

/**
 * Representa la Categoría Dinámica completa
 */
export interface DynamicCategory {
    id: string;
    name: string;
    slug: string;
    is_active: boolean;
    starts_at: string; // Viene como string ISO desde Laravel
    ends_at: string; // Viene como string ISO desde Laravel
    items: DynamicCategoryItem[];
    items_count?: number; // Disponible en el Index gracias a withCount()
    created_at: string;
    updated_at: string;
}

/**
 * Interfaz para la respuesta paginada de Laravel
 */
export type PaginatedDynamicCategories = Paginated<DynamicCategory>;
