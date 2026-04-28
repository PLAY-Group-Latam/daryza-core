import { getCoreRowModel, getFilteredRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table';

import { DataTable } from '@/components/data-table';
import { DataTablePagination } from '@/components/data-table-pagination';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';
import { Script } from '../types';
import { columns } from './columns';

export function TableList({ data: defaultData, meta }: { data: Script[]; meta: any }) {
    const [data, setData] = useState(() => [...defaultData]);
    const [globalFilter, setGlobalFilter] = useState('');

    useEffect(() => {
        setData(defaultData);
    }, [defaultData]);

    const handleDelete = (id: string) => {
        setData(prev => prev.filter(s => s.id !== id));
    };

    const table = useReactTable({
        data,
        columns: columns(handleDelete), // ← único cambio
        state: {
            globalFilter,
            pagination: {
                pageIndex: meta.current_page - 1,
                pageSize: meta.per_page,
            },
        },
        manualPagination: true,
        pageCount: meta.last_page,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    return (
        <div className="p-4">
            <div className="flex items-center py-4">
                <Input
                    placeholder="Buscar..."
                    value={globalFilter ?? ''}
                    onChange={(event) => setGlobalFilter(event.target.value)}
                    className="max-w-sm"
                />
            </div>
            <DataTable key={data.length} table={table} />
            <DataTablePagination table={table} meta={meta} />
        </div>
    );
}
