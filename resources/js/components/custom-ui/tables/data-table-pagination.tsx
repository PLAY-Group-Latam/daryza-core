import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useServerPagination } from '@/lib/utils/useServerPagination';
import { Paginated } from '@/types';
import { Table } from '@tanstack/react-table';
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from 'lucide-react';

interface DataTablePaginationProps<TData> {
    table: Table<TData>;
    paginated: Paginated<TData>;
}

const maxPerPageOptions = 50;
const step = 10;

export function DataTablePagination<TData>({
    table,
    paginated,
}: DataTablePaginationProps<TData>) {
    const { current_page, last_page, per_page, total } = paginated;
    const { goToPage } = useServerPagination();

    const perPageOptions = Array.from(
        { length: Math.ceil(Math.min(total, maxPerPageOptions) / step) },
        (_, i) => (i + 1) * step,
    );

    return (
        <div className="flex items-center justify-between">
            {/* 🧩 Info de selección */}
            <div className="flex-1 text-sm text-muted-foreground">
                {table.getFilteredSelectedRowModel().rows.length} de{' '}
                {table.getFilteredRowModel().rows.length} fila(s) seleccionadas
                ({total} en total).
            </div>

            <div className="flex items-center space-x-6 lg:space-x-8">
                {/* 🔹 Selector de filas por página */}
                <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium">Filas por página</p>
                    <Select
                        value={`${per_page}`}
                        onValueChange={(value) => goToPage(1, Number(value))} // 👈 siempre reinicia a la página 1
                    >
                        <SelectTrigger className="h-8 w-[70px]">
                            <SelectValue placeholder={`${per_page}`} />
                        </SelectTrigger>
                        <SelectContent side="top">
                            {perPageOptions.map((pageSize) => (
                                <SelectItem
                                    key={pageSize}
                                    value={`${pageSize}`}
                                >
                                    {pageSize}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* 🔹 Indicador de página */}
                <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                    Página {current_page} de {last_page}
                </div>

                {/* 🔹 Controles de paginación */}
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        className="hidden h-8 w-8 p-0 lg:flex"
                        onClick={() => goToPage(1, per_page)}
                        disabled={current_page === 1}
                    >
                        <span className="sr-only">Primera página</span>
                        <ChevronsLeft />
                    </Button>

                    <Button
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => goToPage(current_page - 1, per_page)}
                        disabled={current_page === 1}
                    >
                        <ChevronLeft />
                    </Button>

                    <Button
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => goToPage(current_page + 1, per_page)}
                        disabled={current_page === last_page}
                    >
                        <ChevronRight />
                    </Button>

                    <Button
                        variant="outline"
                        className="hidden h-8 w-8 p-0 lg:flex"
                        onClick={() => goToPage(last_page, per_page)}
                        disabled={current_page === last_page}
                    >
                        <span className="sr-only">Última página</span>
                        <ChevronsRight />
                    </Button>
                </div>
            </div>
        </div>
    );
}
