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
}

/**
 * Interfaz para la respuesta paginada de Laravel
 */
export type PaginatedDynamicCategories = Paginated<DynamicCategory>;
