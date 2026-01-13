'use client';

import { Input } from '@/components/ui/input';
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
import { DataTablePagination } from './data-table-pagination';

interface DataTableProps<T extends { children?: T[]; id: string | number }> {
    columns: ColumnDef<T>[];
    data: Paginated<T>;
}

export function DataTableExpandable<
    T extends { children?: T[]; id: string | number },
>({ columns, data }: DataTableProps<T>) {
    const [globalFilter, setGlobalFilter] = React.useState('');
    const [expanded, setExpanded] = React.useState<ExpandedState>({});

    // Filtrado recursivo para padres e hijos
    // const filteredData = React.useMemo(() => {
    //     if (!globalFilter) return data.data;

    //     const filterRows = (rows: T[]): T[] => {
    //         return rows
    //             .map((row) => {
    //                 const children = row.children
    //                     ? filterRows(row.children)
    //                     : [];

    //                 const matchesFilter = row.name
    //                     .toLowerCase()
    //                     .includes(globalFilter.toLowerCase());

    //                 if (matchesFilter || children.length > 0) {
    //                     return { ...row, children };
    //                 }
    //                 return null;
    //             })
    //             .filter(Boolean) as T[];
    //     };

    //     return filterRows(data.data);
    // }, [data.data, globalFilter]);

    // eslint-disable-next-line react-hooks/incompatible-library
    const table = useReactTable({
        data: data.data,
        columns,
        state: { globalFilter, expanded },
        onExpandedChange: setExpanded,
        onGlobalFilterChange: setGlobalFilter,
        manualPagination: true,
        pageCount: data.last_page,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        getRowCanExpand: (row) => !!row.original.children?.length, // permite expandir si hay hijos
        getSubRows: (row) => row.children, // aquí indicamos que los hijos están en children
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
            <div className="mb-4 overflow-x-auto rounded-md border">
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
                                    className={`cursor-pointer hover:bg-gray-100 ${row.depth > 0 ? 'bg-gray-100' : ''} `}
                                    onClick={() => {
                                        if (row.getCanExpand()) {
                                            row.toggleExpanded();
                                        }
                                    }}
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
            </div>

            {/* Paginación */}
            <DataTablePagination table={table} paginated={data} />
        </div>
    );
}
