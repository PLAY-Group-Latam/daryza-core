/* eslint-disable react-hooks/incompatible-library */

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
    getFilteredRowModel,
    getPaginationRowModel,
    useReactTable,
} from '@tanstack/react-table';
import * as React from 'react';

interface DataTableProps<T> {
    columns: ColumnDef<T>[];
    data: T[];
    pageCount?: number; // para paginación manual
    pageIndex?: number;
    pageSize?: number;
    onPaginationChange?: (pageIndex: number, pageSize: number) => void;
}

export function DataTable<T>({
    columns,
    data,
    pageCount,
    pageIndex = 0,
    pageSize = 10,
    onPaginationChange,
}: DataTableProps<T>) {
    const [globalFilter, setGlobalFilter] = React.useState('');

    const table = useReactTable({
        data,
        columns,
        state: {
            globalFilter,
            pagination: { pageIndex, pageSize },
        },
        manualPagination: !!pageCount, // si hay pageCount, la paginación es controlada desde fuera
        pageCount,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onGlobalFilterChange: setGlobalFilter,
        onPaginationChange: (updater) => {
            if (onPaginationChange) {
                const newState =
                    typeof updater === 'function'
                        ? updater({ pageIndex, pageSize })
                        : updater;
                onPaginationChange(newState.pageIndex, newState.pageSize);
            }
        },
    });

    return (
        <div className="w-full space-y-6">
            <div>
                <Input
                    placeholder="Buscar..."
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    className="max-w-sm"
                />
            </div>
            <div className="overflow-x-auto rounded-md border">
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
            {/* aquí puedes agregar tu componente DataTablePagination si quieres */}
        </div>
    );
}
