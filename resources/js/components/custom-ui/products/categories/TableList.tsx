'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/helpers/formatDate';
import { cn } from '@/lib/utils';
import products from '@/routes/products';
import categories from '@/routes/products/categories';
import { Category, PaginatedProductCategories } from '@/types/products/categories';
import { Link, router, usePage } from '@inertiajs/react';
import { ChevronRight, Edit, Trash } from 'lucide-react';
import { ConfirmDeleteAlert } from '../../ConfirmDeleteAlert';
import { StatusBadge } from '../../StatusBadge';
import { DataTableExpandable } from '../../tables/table-dnd-expanded/DataTableExpandable';

interface TableListProps {
    data: PaginatedProductCategories;
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
                        e.stopPropagation();
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
        cell: ({ row }) => <StatusBadge status={row.original.is_active} />,
    },
    {
        accessorKey: 'created_at',
        header: 'Creado el',
        cell: ({ row }) => (
            <span>{formatDate(row.original.created_at, true)}</span>
        ),
    },
    {
        id: 'actions',
        header: 'Acciones',
        cell: ({ row }) => {
            const category = row.original;
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
                            <Edit className="h-4 w-4" />
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
                                <Trash className="h-4 w-4" />
                            </Button>
                        }
                    />
                </div>
            );
        },
    },
];

export default function TableList({ data }: TableListProps) {
    // Obtenemos los filtros actuales que vienen desde el controlador de Laravel
    const { filters } = usePage<{ filters: any }>().props;

    if (!data) {
        return (
            <div className="p-4 text-center text-gray-500">
                No hay categorías disponibles.
            </div>
        );
    }

    /**
     * handleSearch
     * Envía la petición al servidor con el término de búsqueda.
     */
   const handleSearch = (value: string) => {
    // Definimos los parámetros base
    const params: any = { 
        per_page: data.per_page 
    };

    // SOLO agregamos search si tiene contenido
    if (value && value.trim() !== "") {
        params.search = value;
    }

    router.get(
        '/productos/categorias', 
        params,
        {
            preserveState: true,
            replace: true,
            // Quitamos el 'only' un momento para probar que refresque todo el estado
            // o asegúrate que el nombre coincida exactamente con la prop de tu controlador
            only: ['paginatedCategories', 'filters'], 
        }
    );
};
    return (
        <DataTableExpandable
            columns={columns}
            data={data}
            onSearch={handleSearch}
            initialSearch={filters?.search || ''}
            placeholder="Buscar por nombre o slug..."
        />
    );
}