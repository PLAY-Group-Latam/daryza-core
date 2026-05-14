'use client';

import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/helpers/formatDate';
import categories from '@/routes/blogs/categories';
import { BlogCategory } from '@/types/blogs';
import { Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Edit, Trash } from 'lucide-react';
import { ConfirmDeleteAlert } from '../../ConfirmDeleteAlert';
import { DataTable } from '../../tables/DataTable';

interface TableCategoryProps {
    data: Paginated<BlogCategory>;
    filters?: {
        search?: string;
    };
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
        accessorKey: 'updated_at',
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
                        routes={categories}
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

export default function TableList({ data, filters }: TableCategoryProps) {
    const handleSearch = (value: string) => {
        router.get(
            window.location.pathname,
            { search: value },
            {
                preserveState: true,
                replace: true,
                only: ['paginatedCategories', 'filters'],
            }
        );
    };

    if (!data) return null;

    return (
        <DataTable
            columns={columns}
            data={data}
            onSearch={handleSearch}
            initialSearch={filters?.search ?? ''}
            placeholder="Buscar por nombre..."
        />
    );
}