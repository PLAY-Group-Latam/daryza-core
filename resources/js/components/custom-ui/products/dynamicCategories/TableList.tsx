'use client';

import { formatDate } from '@/lib/helpers/formatDate';
import {
    DynamicCategory,
    PaginatedDynamicCategories,
} from '@/types/products/dynamicCategories';
import { ColumnDef } from '@tanstack/react-table';
import { Calendar } from 'lucide-react';
import { DataTable } from '../../tables/DataTable';

interface TableListProps {
    data: PaginatedDynamicCategories;
}

const columns: ColumnDef<DynamicCategory>[] = [
    {
        accessorKey: 'name',
        header: 'Nombre',
        cell: ({ row }) => (
            <div className="flex flex-col">
                <span className="font-medium">{row.original.name}</span>
                <span className="text-xs text-muted-foreground">
                    {row.original.slug}
                </span>
            </div>
        ),
    },
    {
        accessorKey: 'is_active',
        header: 'Estado',
        cell: ({ row }) => (
            <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    row.original.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                }`}
            >
                {row.original.is_active ? 'Activo' : 'Inactivo'}
            </span>
        ),
    },
    {
        id: 'validity',
        header: 'Vigencia',
        cell: ({ row }) => {
            const start = row.original.starts_at;
            const end = row.original.ends_at;

            if (!start && !end)
                return (
                    <span className="text-xs text-gray-400">
                        Siempre activo
                    </span>
                );

            return (
                <div className="flex flex-col gap-1 text-[10px] text-gray-500">
                    <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>
                            Desde: {start ? formatDate(start, false) : '∞'}
                        </span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Hasta: {end ? formatDate(end, false) : '∞'}</span>
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: 'created_at',
        header: 'Creado el',
        cell: ({ row }) => (
            <span className="text-sm">
                {formatDate(row.original.created_at, true)}
            </span>
        ),
    },
    {
        id: 'actions',
        header: 'Acciones',
        cell: ({ row }) => {
            const category = row.original;

            return (
                <div className="flex items-center gap-2">
                    {/* <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        title="Editar categoría"
                        asChild
                    >
                        <Link
                            href={productsNamespace.dynamicCategories.edit(category.id)}
                        >
                            <Edit className="h-4 w-4" />
                        </Link>
                    </Button>
                    <ConfirmDeleteAlert
                        resourceId={category.id}
                        resourceName={category.name}
                        // Usamos el namespace de rutas para categorías dinámicas
                        routes={productsNamespace.dynamicCategories}
                        trigger={
                            <Button
                                variant="destructive"
                                size="icon"
                                title="Eliminar categoría"
                                className="bg-red-700!"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <Trash className="h-4 w-4" />
                            </Button>
                        }
                    /> */}
                </div>
            );
        },
    },
];

export default function TableList({ data }: TableListProps) {
    if (!data || !data.data) {
        return (
            <div className="p-4 text-center text-gray-500">
                No hay categorías especiales disponibles.
            </div>
        );
    }

    return <DataTable columns={columns} data={data} />;
}
