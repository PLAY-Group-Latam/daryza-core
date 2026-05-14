/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    ColumnDef,
    ExpandedState,
    flexRender,
    getCoreRowModel,
    getExpandedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import * as React from 'react';
import { DataTablePagination } from '../data-table-pagination';
import { useDebounce } from '@/hooks/use-debounce'; // Asegúrate de tener este hook o usa uno simple

interface DataTableProps<T extends { children?: T[]; id: string | number }> {
    columns: ColumnDef<T>[];
    data: Paginated<T>;
    placeholder?: string;
    onSearch?: (value: string) => void; // 👈 Nueva prop
    initialSearch?: string; // 👈 Para mantener el valor al recargar
}

export function DataTableExpandable<
    T extends { children?: T[]; id: string | number },
>({ columns, data, placeholder, onSearch, initialSearch = '' }: DataTableProps<T>) {
    
    const [searchValue, setSearchValue] = React.useState(initialSearch);
    const [expanded, setExpanded] = React.useState<ExpandedState>({});
    
    // Ref para evitar bucles infinitos y controlar qué se buscó por última vez
    const lastSearchRef = React.useRef(initialSearch);

    const debouncedSearch = useDebounce(searchValue, 500);

    // ESCENCIAL: Si la URL cambia (ej. navegaste atrás o borraste filtros), 
    // el input debe resetearse.
    React.useEffect(() => {
        setSearchValue(initialSearch);
        lastSearchRef.current = initialSearch;
    }, [initialSearch]);

    // Disparamos la búsqueda hacia el servidor
    React.useEffect(() => {
        // Si el valor debounced es distinto al último que mandamos al servidor
        if (onSearch && debouncedSearch !== lastSearchRef.current) {
            lastSearchRef.current = debouncedSearch;
            onSearch(debouncedSearch);
        }
    }, [debouncedSearch, onSearch]);

    const table = useReactTable({
        data: data.data,
        columns,
        state: { expanded },
        onExpandedChange: setExpanded,
        manualPagination: true,
        manualFiltering: true,   
        pageCount: data.last_page,
        getCoreRowModel: getCoreRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        getRowCanExpand: (row) => !!row.original.children?.length,
        getSubRows: (row) => row.children,
    });

    return (
        <div className="w-full space-y-6">
            <div>
                <Input
                    placeholder={placeholder ?? 'Buscar...'}
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className="max-w-sm"
                />
            </div>

            {/* Resto del JSX (ScrollArea, Table, etc.) se mantiene igual */}
            <div className="mb-4 overflow-hidden rounded-md border">
                <ScrollArea className="h-[600px] w-full overflow-x-auto overflow-y-auto">
                    <Table>
                        <TableHeader className="sticky top-0 z-10 bg-muted">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id}>
                                            {flexRender(
                                                header.column.columnDef.header,
                                                header.getContext(),
                                            )}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>

                        <TableBody>
                            {table.getRowModel().rows.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="text-center">
                                        No hay registros
                                    </TableCell>
                                </TableRow>
                            ) : (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        className={`transition-all hover:bg-gray-100 ${
                                            row.depth > 0 ? 'bg-gray-50' : 'bg-white'
                                        }`}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext(),
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </ScrollArea>
            </div>

            <DataTablePagination table={table} paginated={data} />
        </div>
    );
}