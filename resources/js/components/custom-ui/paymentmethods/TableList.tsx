'use client';

import { DataTable } from '@/components/data-table';
import { Input } from '@/components/ui/input';
import { PaymentMethod } from '@/types/paymentmethods';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useEffect, useMemo, useState } from 'react';
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

    const filteredData = useMemo(() => {
        const term = globalFilter.toLowerCase().trim();
        if (!term) return data;
        return data.filter((item) =>
            String(item.company_type ?? '').toLowerCase().includes(term) ||
            String(item.name ?? '').toLowerCase().includes(term) ||
            String(item.account_number ?? '').toLowerCase().includes(term)
        );
    }, [data, globalFilter]);

    const table = useReactTable({
        data: filteredData,
        columns: tableColumns,
        state: {
            columnVisibility: { id: false },
        },
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className="p-0">
            <div className="flex items-center py-4">
                <Input
                    placeholder="Buscar cuenta bancaria..."
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    className="max-w-sm"
                />
            </div>

            <DataTable table={table} />
        </div>
    );
}