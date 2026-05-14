'use client';

import { DataTable } from '@/components/custom-ui/tables/DataTable';
import { router } from '@inertiajs/react';
import { useMemo } from 'react';
import { Script } from '../types';
import { columns } from './columns';

interface TableListProps {
    data: Paginated<Script>;
    filters?: { search?: string };
}

export function TableList({ data, filters }: TableListProps) {
    // Evitamos que explote si la data no ha cargado
    if (!data || !data.data) return null;

    const handleDelete = (id: string) => {
        // La eliminación se maneja vía router.delete y refresca la prop 'data'
    };

    const tableColumns = useMemo(() => columns(handleDelete), []);

    const handleSearch = (value: string) => {
        router.get(
            window.location.pathname,
            { search: value },
            {
                preserveState: true,
                replace: true,
                only: ['paginatedScripts', 'filters'],
            }
        );
    };

    return (
        <div className="p-0">
            <DataTable<Script>
                columns={tableColumns}
                data={data}
                onSearch={handleSearch}
                initialSearch={filters?.search ?? ''}
                placeholder="Buscar por nombre"
            />
        </div>
    );
}