import { Table } from '@tanstack/react-table';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { router, usePage } from '@inertiajs/react';

interface DataTablePaginationProps<TData> {
    table: Table<TData>;
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
    };
    dynamic_route?: string;
    setSpecs?: any;
    onPagination?: any;
    search?: string
}

export function DataTablePagination<TData>({ table, meta, onPagination }: DataTablePaginationProps<TData>) {
    const { url } = usePage()
    const goToPage = async (page: number, perPage: string) => {
        if (onPagination) {
            onPagination({ page, perPage })
        } else
            router.visit(`?page=${page}&per_page=${meta.per_page}`, {
                preserveScroll: true,
                preserveState: true
            })
    }
    return (
        <div className="mt-4 flex items-center justify-between px-2">
            <div className="text-muted-foreground flex-1 text-sm">
                {table.getFilteredSelectedRowModel().rows.length} de {table.getFilteredRowModel().rows.length} fila(s) seleccionadas.
            </div>
            <div className="flex items-center space-x-6 lg:space-x-8">
                <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium">Filas por página</p>
                    <Select
                        value={`${table.getState().pagination.pageSize}`}
                        onValueChange={(perPage) => { goToPage(meta.current_page, perPage) }}
                    >
                        <SelectTrigger className="h-8 w-[70px]">
                            <SelectValue placeholder={table.getState().pagination.pageSize} />
                        </SelectTrigger>
                        <SelectContent side="top" className="min-w-[3rem]">
                            {[10, 20, 30, 40, 50].map((pageSize) => (
                                <SelectItem key={pageSize} value={`${pageSize}`}>
                                    {pageSize}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                    Pagina {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        type='button' variant="outline" className="hidden h-8 w-8 p-0 lg:flex"
                        onClick={() => goToPage(1, String(table.getState().pagination.pageSize))} disabled={meta.current_page === 1}
                    >
                        <span className="sr-only">Ir a la primera página</span>
                        <ChevronsLeft />
                    </Button>
                    <Button
                        type='button'
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => goToPage(meta.current_page - 1, String(table.getState().pagination.pageSize))}
                        disabled={meta.current_page === 1}
                    >
                        <ChevronLeft />
                    </Button>
                    <span className="text-sm">
                        Página {meta.current_page} de {meta.last_page}
                    </span>
                    <Button
                        type='button'
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => goToPage(meta.current_page + 1, String(table.getState().pagination.pageSize))}
                        disabled={meta.current_page === meta.last_page}
                    >
                        <ChevronRight />
                    </Button>
                    <Button
                        type='button'
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => goToPage(meta.last_page, String(table.getState().pagination.pageSize))}
                        disabled={meta.current_page === meta.last_page}
                    >
                        <ChevronsRight />
                    </Button>
                </div>
            </div>
        </div>
    );
}

