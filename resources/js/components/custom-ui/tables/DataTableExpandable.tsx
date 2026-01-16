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
    closestCenter,
    DndContext,
    DragEndEvent,
    KeyboardSensor,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
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

import {
    arrayMove,
    SortableContext,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { DraggableRow } from './DraggtableRow';

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
    });
    const sensors = useSensors(
        useSensor(MouseSensor, {
            activationConstraint: {
                distance: 3,
            },
        }),
        useSensor(TouchSensor),
        useSensor(KeyboardSensor),
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        setRows((prev) => {
            const oldIndex = prev.findIndex((i) => i.id === active.id);
            const newIndex = prev.findIndex((i) => i.id === over.id);
            return arrayMove(prev, oldIndex, newIndex);
        });
    };

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

                    <DndContext
                        sensors={sensors} // 🔑 agregamos los sensores
                        collisionDetection={closestCenter}
                        modifiers={[restrictToVerticalAxis]} // ✅ limita solo vertical
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={table
                                .getRowModel()
                                .rows.map((r) => r.original.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <TableBody className="relative">
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
                                        <DraggableRow key={row.id} row={row}>
                                            {row
                                                .getVisibleCells()
                                                .map((cell) => (
                                                    <TableCell key={cell.id}>
                                                        {flexRender(
                                                            cell.column
                                                                .columnDef.cell,
                                                            cell.getContext(),
                                                        )}
                                                    </TableCell>
                                                ))}
                                        </DraggableRow>
                                    ))
                                )}
                            </TableBody>
                        </SortableContext>
                    </DndContext>
                </Table>
            </div>

            {/* Paginación */}
            <DataTablePagination table={table} paginated={data} />
        </div>
    );
}
