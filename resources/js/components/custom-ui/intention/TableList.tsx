'use client';

import { DataTable } from '@/components/custom-ui/tables/DataTable';
import { Paginate } from '@/interfaces/paginate';
import { columns } from './columns-intention-list';
import { router, usePage } from '@inertiajs/react';

interface TableListProps {
    data: any[];
    meta: Paginate;
}

export function TableList({ data, meta }: TableListProps) {
    const { filters } = usePage<{ filters: any }>().props;

    const paginatedData = {
        data: data,
        current_page: meta.currentPage,
        last_page: meta.lastPage,
        per_page: meta.perPage,
        total: meta.total,
    } as any; 

    const handleSearch = (value: string) => {
        const params: any = { per_page: meta.perPage };
        
        if (value && value.trim() !== "") {
            params.search = value;
        }

        router.get(
            '/intention-purchase', // Cambiar por tu ruta real de intenciones
            params,
            {
                preserveState: true,
                replace: true,
                only: ['paginatedIntents', 'filters'],
            }
        );
    };

    return (
        <div className="p-4">
            <DataTable
                columns={columns}
                data={paginatedData}
                onSearch={handleSearch}
                initialSearch={filters?.search || ''}
                placeholder="Buscar por cliente o email..."
            />
        </div>
    );
}