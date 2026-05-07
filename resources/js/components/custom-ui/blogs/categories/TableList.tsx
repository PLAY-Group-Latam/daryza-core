'use client';

import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/helpers/formatDate';
import categories from '@/routes/blogs/categories';
import { BlogCategory } from '@/types/blogs'; // ajusta la ruta según tu proyecto
import { Link } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Edit, Trash } from 'lucide-react';
import { ConfirmDeleteAlert } from '../../ConfirmDeleteAlert';
import { DataTable } from '../../tables/DataTable';

interface TableCategoryProps {
    data: Paginated<BlogCategory>;
}

export const columns: ColumnDef<BlogCategory>[] = [
    {
        accessorKey: 'name',
        header: 'Nombre',
        cell: ({ row }) => row.original.name,
    },
    {
        accessorKey: 'created_at',
        header: 'Fecha creación',
        cell: ({ row }) => formatDate(row.original.created_at),
    },
    {
        accessorKey: 'updated_at', // 🔹 nueva columna
        header: 'Última actualización',
        cell: ({ row }) => formatDate(row.original.updated_at),
    },
    {
        id: 'actions',
        header: 'Acciones',
        cell: ({ row }) => {
            const category = row.original;

            return (
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        title="Editar Categoría"
                        asChild
                    >
                        <Link
                            href={`/blogs/categorias/${row.original.id}/edit`}
                        >
                            <Edit />
                        </Link>
                    </Button>

                    <ConfirmDeleteAlert
                        resourceId={category.id}
                        resourceName={category.name}
                        routes={categories} // aquí pasamos el helper de rutas de categorías
                        trigger={
                            <Button
                                variant="destructive"
                                size="icon"
                                title="Eliminar categoría"
                                className="bg-red-700!"
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

export default function TableList({ data }: TableCategoryProps) {
    if (!data) return null;

    return (
        <DataTable
            columns={columns}
            data={data}
            searchKeys={['name']}
            placeholder="Buscar por nombre..."
        />
    );
}
