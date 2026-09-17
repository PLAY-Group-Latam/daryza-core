'use client';

import { DataTable } from '@/components/custom-ui/tables/DataTable';
import { router } from '@inertiajs/react';
import { useMemo } from 'react';
import { DestinationEmail, DestinationEmailPageOption } from '../types';
import { columns } from './columns';

interface TableListProps {
    data: Paginated<DestinationEmail>;
    filters?: { search?: string };
    pageOptions: DestinationEmailPageOption[];
}


export function TableList({ data, filters, pageOptions }: TableListProps) {
    // 1. Declaramos los hooks siempre en el mismo orden arriba del todo
    const tableColumns = useMemo(() => columns(pageOptions), [pageOptions]);

    const handleSearch = (value: string) => {
        router.get(
            window.location.pathname,
            { search: value },
            {
                preserveState: true,
                replace: true,
                only: ['paginatedDestinationEmails', 'filters'],
            },
        );
    };

    // 2. Si quieres proteger por si 'data' viene vacío o nulo, hazlo aquí abajo (después de los hooks)
    if (!data || !data.data) {
        return null; 
    }

    return (
        <div className="p-0">
            <DataTable<DestinationEmail>
                columns={tableColumns}
                data={data}
                onSearch={handleSearch}
                initialSearch={filters?.search ?? ''}
                placeholder="Buscar por nombre o correo"
            />
        </div>
    );
}