// 1. La interfaz base del modelo
export interface BusinessLine {
    id: string; // Representa el ULID
    name: string;
    slug: string;
    image: string | null; // Ruta del archivo en el storage
    is_active: boolean;
    created_at: string;
    updated_at: string;

    // Opcional: si en algún momento cargas la relación de productos
}

export type PaginatedBusinessLines = Paginated<BusinessLine>;
