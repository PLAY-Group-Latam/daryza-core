'use client';

import { ColumnDef } from '@tanstack/react-table';

import { formatDate } from '@/lib/helpers/formatDate';
import { Category } from '@/types/products';
import { DataTable } from '../../tables/DataTable';

interface TableListProps {
    data: Paginated<Category>;
}

export const columns: ColumnDef<Category>[] = [
    {
        accessorKey: 'name',
        header: 'Nombre',
    },
    {
        accessorKey: 'slug',
        header: 'Slug',
    },
    {
        accessorKey: 'parent',
        header: 'Categoría padre',
        cell: ({ row }) => {
            const parent = row.original.parent;
            return <span>{parent ? parent.name : 'Principal'}</span>;
        },
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
                    {/* Luego aquí metes tus modales o botones */}
                    {/* <EditCategoryModal category={category} /> */}
                    {/* <DeleteCategoryModal category={category} /> */}
                    <button className="text-blue-600 hover:underline">
                        Editar
                    </button>
                    <button className="text-red-600 hover:underline">
                        Eliminar
                    </button>
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
    return <DataTable columns={columns} data={data} />;
}
