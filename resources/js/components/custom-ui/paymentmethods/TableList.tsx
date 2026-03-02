'use client';

import { getCoreRowModel, getFilteredRowModel, useReactTable } from '@tanstack/react-table';
import { useEffect, useState, useMemo } from 'react';
import { PaymentMethod } from '@/types/paymentmethods';
import { DataTable } from '@/components/data-table';
import { Input } from '@/components/ui/input';
import { columns } from './columns';

export function TableList({ data: defaultData }: { data: PaymentMethod[] }) {

    const [data, setData] = useState<PaymentMethod[]>(() => [...defaultData]);
    const [globalFilter, setGlobalFilter] = useState('');

    useEffect(() => {
        setData(defaultData);
    }, [defaultData]);

  
    const handleDelete = (id: string) => {
        setData((prev) => prev.filter((item) => item.id.toString() !== id));
    };


    const tableColumns = useMemo(() => columns(handleDelete), []);

    const table = useReactTable({
        data,
        columns: tableColumns,
        state: {
            globalFilter,
            columnVisibility: {
                id: false
            },
        },
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    });

    return (
        <div className="p-0">
            <div className="flex items-center py-4">
                <Input
                    placeholder="Buscar cuenta bancaria..."
                    value={globalFilter ?? ''}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => setGlobalFilter(event.target.value)}
                    className="max-w-sm"
                />
            </div>
            
            <DataTable key={data.length} table={table} />
        </div>
    );
}