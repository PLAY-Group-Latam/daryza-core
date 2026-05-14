'use client';

import { DataTable } from '@/components/custom-ui/tables/DataTable';
import { Seo } from '@/types/seo/Seo';
import { router } from '@inertiajs/react';
import { useMemo } from 'react';
import { columns } from './columns';

interface TableListProps {
    data: Paginated<Seo>;
    filters?: {
        search?: string;
    };
}

export function TableList({ data, filters }: TableListProps) {
    // Si la data no existe o el objeto está vacío, evitamos el renderizado
    if (!data || !data.data) return null;

    // Función para manejar la eliminación (Inertia refrescará la prop 'data' automáticamente)
    const handleDelete = (id: string) => {
        // Generalmente aquí ejecutarías router.delete(...) 
        // o lo manejarías dentro de los componentes de acción en las columnas
    };

    // Memorizamos las columnas
    const tableColumns = useMemo(() => columns(handleDelete), []);

    // Lógica de búsqueda por servidor (Pattern consistente con Applications/Users)
    const handleSearch = (value: string) => {
        router.get(
            window.location.pathname,
            { search: value },
            {
                preserveState: true,
                replace: true,
                only: ['paginatedSeo', 'filters'], // Asegúrate que 'paginatedSeo' coincida con tu Controller
            }
        );
    };

    return (
        <div className="p-0">
            <DataTable<Seo>
                columns={tableColumns}
                data={data}
                onSearch={handleSearch}
                initialSearch={filters?.search ?? ''}
                placeholder="Buscar por título de página o meta title..."
            />
        </div>
    );
}