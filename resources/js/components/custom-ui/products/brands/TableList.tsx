'use client';

import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/helpers/formatDate';
import productsNamespace from '@/routes/products';
import { Brand, PaginatedBrands } from '@/types/products/brands';
import { Link, router, usePage } from '@inertiajs/react';
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
            return (
                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        title="Editar marca"
                        asChild
                    >
                        <Link href={productsNamespace.brands.edit(brand.id)}>
                            <Edit className="h-4 w-4" />
                        </Link>
                    </Button>
                    <ConfirmDeleteAlert
                        resourceId={brand.id}
                        resourceName={brand.name}
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
    const { filters } = usePage<{ filters: any }>().props;

    if (!data || !data.data) {
        return (
            <div className="p-4 text-center text-gray-500">
                No hay marcas disponibles.
            </div>
        );
    }

    const handleSearch = (value: string) => {
        const params: any = { per_page: data.per_page };
        
        if (value && value.trim() !== "") {
            params.search = value;
        }

        router.get(
            '/productos/marcas', 
            params,
            {
                preserveState: true,
                replace: true,
                only: ['paginatedBrands', 'filters'],
            }
        );
    };

    return (
        <DataTable
            columns={columns}
            data={data}
            onSearch={handleSearch}
            initialSearch={filters?.search || ''}
            placeholder="Buscar por nombre..."
        />
    );
}