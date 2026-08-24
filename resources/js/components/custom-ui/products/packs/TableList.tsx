'use client';

import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/helpers/formatDate';
import packs from '@/routes/products/packs';
import { ProductPack } from '@/types/products/packs';
import { Link, router, usePage } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Edit, Trash } from 'lucide-react';
import { ConfirmDeleteAlert } from '../../ConfirmDeleteAlert';
import { StatusBadge } from '../../StatusBadge';
import { DataTable } from '../../tables/DataTable';

interface TableListProps {
    data: Paginated<ProductPack>;
}

const columns: ColumnDef<ProductPack>[] = [
    {
        accessorKey: 'name',
        header: 'Nombre del Pack',
        cell: ({ row }) => (
            <span className="font-medium">{row.original.name}</span>
        ),
    },
    {
        accessorKey: 'price',
        header: 'Precio',
        cell: ({ row }) => (
            <span className="font-medium text-green-700">
                S/ {Number(row.original.price).toFixed(2)}
            </span>
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
            <span className="text-sm text-gray-500">
                {formatDate(row.original.created_at, true)}
            </span>
        ),
    },
    {
        accessorKey: 'updated_at',
        header: 'Actualizado el',
        cell: ({ row }) => (
            <span className="text-sm text-gray-500">
                {formatDate(row.original.updated_at, true)}
            </span>
        ),
    },
    {
        id: 'actions',
        header: 'Acciones',
        cell: ({ row }) => {
            const pack = row.original;

            return (
                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        title="Editar pack"
                        asChild
                    >
                        <Link href={packs.edit(pack.id)}>
                            <Edit className="h-4 w-4" />
                        </Link>
                    </Button>

                    <ConfirmDeleteAlert
                        resourceId={pack.id}
                        resourceName={pack.name}
                        routes={packs}
                        trigger={
                            <Button
                                variant="destructive"
                                size="icon"
                                title="Eliminar pack"
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
                No hay packs disponibles.
            </div>
        );
    }

    const handleSearch = (value: string) => {
        const params: any = { per_page: data.per_page };
        
        if (value && value.trim() !== "") {
            params.search = value;
        }

        router.get(
            '/productos/packs', 
            params,
            {
                preserveState: true,
                replace: true,
                only: ['paginatedPacks', 'filters'],
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