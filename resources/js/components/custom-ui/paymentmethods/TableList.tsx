'use client';

import { DataTable } from '@/components/custom-ui/tables/DataTable';
import { PaymentMethod } from '@/types/paymentmethods';
import { router } from '@inertiajs/react';
import { useMemo } from 'react';
import { columns } from './columns';

interface TableListProps {
    data: Paginated<PaymentMethod>;
    filters?: { search?: string };
}

export function TableList({ data, filters }: TableListProps) {
    // Si data no ha llegado todavía, evitamos que el componente explote
    if (!data || !data.data) return null;

    const handleDelete = (id: string): void => {
        // Lógica de eliminación si la necesitas
    };

    const tableColumns = useMemo(() => columns(handleDelete), []);

    const handleSearch = (value: string) => {
        router.get(
            window.location.pathname,
            { search: value },
            {
                preserveState: true,
                replace: true,
                // Esto debe coincidir con el nombre en el Controller
                only: ['paginatedPaymentMethods', 'filters'],
            }
        );
    };

    return (
        <div className="p-0">
            <DataTable<PaymentMethod>
                columns={tableColumns}
                data={data}
                onSearch={handleSearch}
                initialSearch={filters?.search ?? ''}
                placeholder="Buscar por banco o número de cuenta..."
            />
        </div>
    );
}