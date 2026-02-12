/* eslint-disable react-hooks/incompatible-library */
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
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table';
import * as React from 'react';
import { DataTablePagination } from './data-table-pagination';

interface DataTableProps<T> {
    columns: ColumnDef<T>[];
    data: Paginated<T>;
    onSearch?: (value: string) => void;
    initialSearch?: string;
}

export function DataTable<T>({
    columns,
    data,
    onSearch,
    initialSearch = '',
}: DataTableProps<T>) {
   
    const [globalFilter, setGlobalFilter] = React.useState(initialSearch ?? "");

    const isFirstRender = React.useRef(true);
    const lastSearchRef = React.useRef(initialSearch ?? "");

    React.useEffect(() => {
        if (!onSearch) return;

        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        if (globalFilter === lastSearchRef.current) return;

        const timer = setTimeout(() => {
            lastSearchRef.current = globalFilter;
            onSearch(globalFilter);
        }, 500);

        return () => clearTimeout(timer);
    }, [globalFilter, onSearch]);

    const table = useReactTable({
        data: data.data,
        columns,
        state: {
            globalFilter,
        },
        manualPagination: true,
        manualFiltering: true,
        pageCount: data.last_page,
        getCoreRowModel: getCoreRowModel(),
        onGlobalFilterChange: setGlobalFilter,
    });

    const rows = table.getRowModel().rows;

    return (
        <div className="w-full space-y-6">
            <div className="flex items-center justify-between">
                <Input
                    placeholder="Buscar..."
                    value={globalFilter ?? ""} 
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    className="max-w-sm"
                />
            </div>

            <div className="mb-4 overflow-x-auto rounded-md border">
                <Table>
                    <TableHeader className="sticky top-0 z-10 bg-muted">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                  header.column.columnDef
                                                      .header,
                                                  header.getContext(),
                                              )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>

                    <TableBody>
                        {rows.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    No hay registros.
                                </TableCell>
                            </TableRow>
                        ) : (
                            rows.map((row) => (
                                <TableRow key={row.id}>
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

            <DataTablePagination table={table} paginated={data} />
        </div>
    );
}
