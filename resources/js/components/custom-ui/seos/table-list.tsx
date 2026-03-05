/* eslint-disable @typescript-eslint/no-explicit-any */
import { 
    getCoreRowModel, 
    getFilteredRowModel, 
    getPaginationRowModel, 
    useReactTable 
} from '@tanstack/react-table';

import { Seo } from '@/types/seo/Seo';
import { useEffect, useState, useMemo } from 'react';
import { DataTable } from '@/components/data-table';
import { DataTablePagination } from '@/components/data-table-pagination';
import { Input } from '@/components/ui/input';
import { columns } from './columns';

export function TableList({ data: defaultData, meta }: { data: Seo[]; meta: any }) {
    const [data, setData] = useState<Seo[]>(() => [...defaultData]);
    const [globalFilter, setGlobalFilter] = useState('');

    // Sincronizar estado local si las props cambian (ej. al cambiar de página)
    useEffect(() => {
        setData(defaultData);
    }, [defaultData]);

    /**
     * Función que pasamos a las columnas para que, al eliminar un registro
     * exitosamente en el backend, lo quitemos de la vista inmediatamente.
     */
    const handleDelete = (id: string) => {
        setData((prev) => prev.filter((item) => item.id !== id));
    };

    /**
     * Importante: Como 'columns' ahora es una función (onDelete) => ColumnDef[],
     * debemos ejecutarla para obtener el array que useReactTable espera.
     * Usamos useMemo para que no se recalculen las definiciones en cada render innecesariamente.
     */
    const tableColumns = useMemo(() => columns(handleDelete), []);

    const table = useReactTable({
        data,
        columns: tableColumns,
        state: {
            globalFilter,
            pagination: {
                pageIndex: meta.current_page - 1, // TanStack es base 0
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
        <div className="space-y-4">
            <div className="flex items-center py-4">
                <Input
                    placeholder="Filtrar por página o título..."
                    value={globalFilter ?? ''}
                    onChange={(event) => setGlobalFilter(event.target.value)}
                    className="max-w-sm"
                />
            </div>
            <div className="rounded-md border">
                <DataTable table={table} />
            </div>
            <DataTablePagination table={table} meta={meta} />
        </div>
    );
}