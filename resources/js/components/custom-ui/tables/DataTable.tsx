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
    perPageOptions?: number[];
    toolbarRight?: React.ReactNode;
    searchKeys?: (keyof T | ((row: T) => string))[];
    placeholder?: string;
}

export function DataTable<T>({
    columns,
    data,
    onSearch,
    initialSearch = '',
    perPageOptions,
    toolbarRight,
    searchKeys,
    placeholder,
}: DataTableProps<T>) {
    const [globalFilter, setGlobalFilter] = React.useState(initialSearch ?? '');

    const isFirstRender = React.useRef(true);
    const lastSearchRef = React.useRef(initialSearch ?? '');

    // Auto-genera el placeholder desde los searchKeys
    const resolvedPlaceholder = React.useMemo(() => {
        if (placeholder) return placeholder;
        if (searchKeys && searchKeys.length > 0) {
            const labels = searchKeys
                .filter((k) => typeof k !== 'function')
                .map((k) =>
                    String(k)
                        .replace(/_/g, ' ')
                        .replace(/\b\w/g, (c) => c.toUpperCase()),
                );
            return `Buscar por ${labels.join(', ')}...`;
        }
        return 'Buscar...';
    }, [placeholder, searchKeys]);

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

    const filteredData = React.useMemo(() => {
        if (onSearch) return data.data;

        const term = (globalFilter ?? '').trim().toLowerCase();
        if (!term) return data.data;

        return data.data.filter((row) => {
            if (!row || typeof row !== 'object') return false;

            // Si hay searchKeys, solo filtrar por esos campos
            const entries = searchKeys
                ? searchKeys.flatMap((k) => {
                      if (typeof k === 'function') return [k(row)];
                      return [(row as Record<keyof T, unknown>)[k]];
                  })
                : Object.values(row as Record<string, unknown>);

            return entries.some((value) => {
                if (value == null) return false;
                if (typeof value === 'string' || typeof value === 'number') {
                    return String(value).toLowerCase().includes(term);
                }
                return false;
            });
        });
    }, [data.data, globalFilter, onSearch, searchKeys]);

    const table = useReactTable({
        data: filteredData,
        columns,
        state: { globalFilter },
        manualPagination: true,
        manualFiltering: true,
        pageCount: data.last_page,
        getCoreRowModel: getCoreRowModel(),
        onGlobalFilterChange: setGlobalFilter,
    });

    const rows = table.getRowModel().rows;

    return (
        <div className="w-full space-y-6">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <Input
                    placeholder={resolvedPlaceholder}
                    value={globalFilter ?? ''}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    className="max-w-sm"
                />
                {toolbarRight ? (
                    <div className="flex items-center justify-end gap-2">
                        {toolbarRight}
                    </div>
                ) : null}
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

            <DataTablePagination
                table={table}
                paginated={data}
                perPageOptions={perPageOptions}
            />
        </div>
    );
}
