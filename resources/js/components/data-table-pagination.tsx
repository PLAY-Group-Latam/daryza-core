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
      
        <div className="mt-4 flex flex-col items-center justify-between gap-4 px-1 md:flex-row md:px-2">
            
            <div className="hidden text-sm text-muted-foreground md:block md:flex-1">
                {table.getFilteredSelectedRowModel().rows.length} de {table.getFilteredRowModel().rows.length} fila(s) seleccionadas.
            </div>

            
            <div className="flex flex-col items-center gap-4 sm:flex-row md:space-x-6 lg:space-x-8">
                
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

                
                <div className="flex items-center space-x-2">
                    <Button
                        type='button' variant="outline" className="hidden h-8 w-8 p-0 sm:flex"
                        onClick={() => goToPage(1, String(table.getState().pagination.pageSize))} 
                        disabled={meta.current_page === 1}
                    >
                        <span className="sr-only">Ir a la primera página</span>
                        <ChevronsLeft className="h-4 w-4" />
                    </Button>

                    <Button
                        type='button'
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => goToPage(meta.current_page - 1, String(table.getState().pagination.pageSize))}
                        disabled={meta.current_page === 1}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <span className="text-sm font-medium px-2">
                        Página {meta.current_page} de {meta.last_page}
                    </span>

                    <Button
                        type='button'
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => goToPage(meta.current_page + 1, String(table.getState().pagination.pageSize))}
                        disabled={meta.current_page === meta.last_page}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>

                    <Button
                        type='button'
                        variant="outline"
                        className="hidden h-8 w-8 p-0 sm:flex"
                        onClick={() => goToPage(meta.last_page, String(table.getState().pagination.pageSize))}
                        disabled={meta.current_page === meta.last_page}
                    >
                        <ChevronsRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}