'use client';

import { ColumnDef } from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/helpers/formatDate';
import categories from '@/routes/products/categories';
import { Category, CategorySelect } from '@/types/products';
import { ChevronRight, Edit, Trash } from 'lucide-react';
import { ConfirmDeleteAlert } from '../../ConfirmDeleteAlert';
import { DataTableExpandable } from '../../tables/DataTableExpandable';
import { ModalFormCategories } from './ModalFormCategories';

interface TableListProps {
    data: Paginated<Category>;
    parentCategories?: CategorySelect[];
}

const columns = (
    parentCategories: CategorySelect[] = [],
): ColumnDef<Category>[] => [
    {
        id: 'expander',
        header: () => null,
        cell: ({ row }) => {
            if (!row.original.children || row.original.children.length === 0)
                return null;

            return (
                <span
                    className={`flex w-fit items-center justify-center transition-transform duration-200 ${
                        row.getIsExpanded() ? 'rotate-90' : ''
                    }`}
                >
                    <ChevronRight className="size-4" />
                </span>
            );
        },
        enableSorting: false,
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
            console.log(category);
            return (
                <div className="flex items-center gap-2">
                    <ModalFormCategories
                        category={category}
                        parentCategories={parentCategories} // Aquí pasamos los padres
                        trigger={
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                title="Editar Categoría"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <Edit />
                            </Button>
                        }
                    />
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

export default function TableList({ data, parentCategories }: TableListProps) {
    if (!data) {
        return (
            <div className="p-4 text-center text-gray-500">
                No hay categorías disponibles.
            </div>
        );
    }
    const tableColumns = columns(parentCategories);

    return <DataTableExpandable columns={tableColumns} data={data} />;
}
