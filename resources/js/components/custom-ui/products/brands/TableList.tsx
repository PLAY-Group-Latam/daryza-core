'use client';

import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/helpers/formatDate';
import productsNamespace from '@/routes/products';
import { Brand, PaginatedBrands } from '@/types/products/brands';
import { Link } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Edit, Trash } from 'lucide-react';
import { ConfirmDeleteAlert } from '../../ConfirmDeleteAlert';
import { StatusBadge } from '../../StatusBadge';
import { DataTable } from '../../tables/DataTable';

interface TableListProps {
    data: PaginatedBrands;
}

const columns: ColumnDef<Brand>[] = [
    {
        accessorKey: 'name',
        header: 'Nombre',
        cell: ({ row }) => (
            <div className="flex flex-col">
                <span className="font-medium">{row.original.name}</span>
                <span className="text-xs text-gray-500">
                    {row.original.slug}
                </span>
            </div>
        ),
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
            const brand = row.original;

            // Asegúrate de tener estas rutas definidas en tu objeto de rutas
            // o cámbialas por route('brands.edit', line.id)
            return (
                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        title="Editar atributo"
                        asChild
                    >
                        <Link href={productsNamespace.brands.edit(brand.id)}>
                            <Edit />
                        </Link>
                    </Button>
                    <ConfirmDeleteAlert
                        resourceId={brand.id}
                        resourceName={brand.name}
                        // Asegúrate de pasar las rutas correctas para el delete
                        routes={productsNamespace.brands}
                        trigger={
                            <Button
                                variant="destructive"
                                size="icon"
                                title="Eliminar marca"
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
    if (!data || !data.data) {
        return (
            <div className="p-4 text-center text-gray-500">
                No hay marcas disponibles.
            </div>
        );
    }

    return (
        <DataTable
            columns={columns}
            data={data}
            searchKeys={['name', 'slug']}
            placeholder="Buscar por nombre o slug..."
        />
    );
}
