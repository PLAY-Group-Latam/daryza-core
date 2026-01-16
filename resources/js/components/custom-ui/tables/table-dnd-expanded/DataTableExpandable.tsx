/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/incompatible-library */
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
    getFilteredRowModel,
    useReactTable,
} from '@tanstack/react-table';
import * as React from 'react';
import { DataTablePagination } from '../data-table-pagination';

interface DataTableProps<T extends { children?: T[]; id: string | number }> {
    columns: ColumnDef<T>[];
    data: Paginated<T>;
}

export function DataTableExpandable<
    T extends { children?: T[]; id: string | number },
>({ columns, data }: DataTableProps<T>) {
    const [globalFilter, setGlobalFilter] = React.useState('');
    const [expanded, setExpanded] = React.useState<ExpandedState>({});
    const [rows, setRows] = React.useState<T[]>(data.data);

    React.useEffect(() => {
        setRows(data.data);
    }, [data.data]);

    const table = useReactTable({
        data: rows,
        columns,
        state: { globalFilter, expanded },
        onExpandedChange: setExpanded,
        onGlobalFilterChange: setGlobalFilter,
        manualPagination: true,
        pageCount: data.last_page,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        getRowCanExpand: (row) => !!row.original.children?.length,
        getSubRows: (row) => row.children,
        globalFilterFn: (row, columnId, filterValue) => {
            // Chequea si el valor del hijo o del row contiene el filtro
            const checkRow = (r: any): boolean => {
                const cellValue = r.getValue(columnId);
                if (
                    String(cellValue)
                        .toLowerCase()
                        .includes(filterValue.toLowerCase())
                ) {
                    return true;
                }

                // Chequea hijos recursivamente
                if (r.original.children?.length) {
                    return r.original.children.some((child: any) =>
                        checkRow({
                            ...r,
                            original: child,
                            getValue: (id: string) => child[id],
                        }),
                    );
                }

                return false;
            };

            return checkRow(row);
        },
    });

    return (
        <div className="w-full space-y-6">
            {/* Filtro global */}
            <div>
                <Input
                    placeholder="Buscar..."
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    className="max-w-sm"
                />
            </div>

            {/* Tabla */}
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
                                    <TableCell
                                        colSpan={columns.length}
                                        className="text-center"
                                    >
                                        No hay registros
                                    </TableCell>
                                </TableRow>
                            ) : (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        className={`transition-all hover:bg-gray-100 ${
                                            row.depth > 0
                                                ? 'bg-gray-50'
                                                : 'bg-white'
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

            {/* Paginación */}
            <DataTablePagination table={table} paginated={data} />
        </div>
    );
}
