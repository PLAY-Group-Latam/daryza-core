import { DataTable } from '@/components/data-table';
import { DataTablePagination } from '@/components/data-table-pagination';
import { Input } from '@/components/ui/input';
import { Paginate } from '@/interfaces/paginate';
import { getCoreRowModel, getFilteredRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table';
import { useState, useMemo } from 'react'; 
import { columns } from './columns-intention-list';

export function TableList({ data: purchaseIntents = [], meta }: { data: any[]; meta: Paginate }) {
    
    // Extraemos meta con valores seguros
    const { 
        currentPage = 1, 
        perPage: pageSize = 15, 
        lastPage: pageCount = 1 
    } = meta || {}; 

    const [globalFilter, setGlobalFilter] = useState('');


    const paginationState = useMemo(() => ({
        pageIndex: Math.max(0, currentPage - 1),
        pageSize,
    }), [currentPage, pageSize]);

    const columnVisibility = useMemo(() => ({ 'customer_id': false }), []);

    const table = useReactTable({
        columns,
        data: purchaseIntents, // Pasamos la prop directamente, TanStack se encarga del resto
        manualPagination: true,
        pageCount: pageCount,
        state: { 
            globalFilter, 
            pagination: paginationState, // Usamos la referencia estable
            columnVisibility
        },
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });
   
    return (
        <div className="p-4">
            <div className="flex items-center py-4">
                <Input
                    className="max-w-sm"
                    onChange={(event) => setGlobalFilter(event.target.value)}
                    placeholder="Filtrar por nombre o correo..."
                    value={globalFilter ?? ''}
                />
            </div>

            {/* Renderizado de la tabla principal */}
            <DataTable table={table} />

            {/* Paginación conectada al meta de Laravel */}
            <DataTablePagination
                meta={{ 
                    current_page: currentPage, 
                    last_page: pageCount, 
                    per_page: pageSize, 
                }}
                table={table}
            />
        </div>
    );
}