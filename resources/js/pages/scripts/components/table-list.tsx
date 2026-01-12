import { getCoreRowModel, getFilteredRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table';

import { DataTable } from '@/components/data-table';
import { DataTablePagination } from '@/components/data-table-pagination';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';
import { columns } from './columns';
import { Script } from './ScriptForm';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function TableList({ data: defaultData, meta }: { data: Script[]; meta: any }) {
    const [data, setData] = useState(() => [...defaultData]);
    const [globalFilter, setGlobalFilter] = useState('');
    // const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    //   []
    // )

    useEffect(() => {
        setData(defaultData);
    }, [defaultData]);

    const table = useReactTable({
        data,
        columns,
        state: {
            globalFilter,
            pagination: {
                pageIndex: meta.current_page - 1, // tanstack usa base 0
                pageSize: meta.per_page,
            },
        },
        manualPagination: true,
        pageCount: meta.last_page,

        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        // onColumnFiltersChange: setColumnFilters,
        // getFilteredRowModel: getFilteredRowModel(),
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
            <DataTable table={table} />
            <DataTablePagination table={table} meta={meta} />
        </div>
    );
}
