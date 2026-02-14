'use client';

import { ColumnDef } from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/helpers/formatDate';
import { cn } from '@/lib/utils';
import products from '@/routes/products';
import categories from '@/routes/products/categories';
import { Category } from '@/types/products/categories';
import { Link } from '@inertiajs/react';
import { ChevronRight, Edit, Trash } from 'lucide-react';
import { ConfirmDeleteAlert } from '../../ConfirmDeleteAlert';
import { DataTableExpandable } from '../../tables/table-dnd-expanded/DataTableExpandable';

interface TableListProps {
    data: Paginated<Category>;
}

const columns: ColumnDef<Category>[] = [
    {
        id: 'expander',
        header: () => null,
        cell: ({ row }) => {
            if (!row.original.children?.length) return null;

            return (
                <button
                    onClick={(e) => {
                        e.stopPropagation(); // evita que el click active el drag
                        row.toggleExpanded();
                    }}
                    className={cn(
                        'flex items-center justify-center transition-transform',
                        row.getIsExpanded() && 'rotate-90',
                    )}
                >
                    <ChevronRight className="h-4 w-4" />
                </button>
            );
        },
        enableSorting: false,
    },

    {
        accessorKey: 'order',
        header: 'Ordenº',
    },
    {
        accessorKey: 'name',
        header: 'Nombre',
    },
    {
        accessorKey: 'slug',
        header: 'Slug',
    },

    {
        accessorKey: 'is_active',
        header: 'Estado',
        cell: ({ row }) => (
            <span
                className={
                    row.original.is_active
                        ? 'font-medium text-green-600'
                        : 'font-medium text-red-600'
                }
            >
                {row.original.is_active ? 'Activo' : 'Inactivo'}
            </span>
        ),
    },
    {
        accessorKey: 'created_at',
        header: 'Creado el',
        cell: ({ row }) => (
            <span>{formatDate(row.original.created_at, true)}</span>
        ),
    },
    {
        accessorKey: 'updated_at',
        header: 'Actualizado el',
        cell: ({ row }) => (
            <span>{formatDate(row.original.updated_at, true)}</span>
        ),
    },
    {
        id: 'actions',
        header: 'Acciones',
        cell: ({ row }) => {
            const category = row.original;
            // console.log(category);
            return (
                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        title="Editar atributo"
                        asChild
                    >
                        <Link href={products.categories.edit(category.id)}>
                            <Edit />
                        </Link>
                    </Button>
                    <ConfirmDeleteAlert
                        resourceId={category.id}
                        resourceName={category.name}
                        routes={categories}
                        trigger={
                            <Button
                                variant="destructive"
                                size="icon"
                                title="Eliminar Categoría"
                                className="bg-red-700!"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <Trash />
                            </Button>
                        }
                    />
                </div>
            );
        },
    },
];

export default function TableList({ data }: TableListProps) {
    if (!data) {
        return (
            <div className="p-4 text-center text-gray-500">
                No hay categorías disponibles.
            </div>
        );
    }

    return <DataTableExpandable columns={columns} data={data} />;
}
