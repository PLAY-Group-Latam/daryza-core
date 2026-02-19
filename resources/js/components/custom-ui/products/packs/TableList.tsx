'use client';

import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/helpers/formatDate';
import packs from '@/routes/products/packs';
import { ProductPack } from '@/types/products/packs';
import { Link } from '@inertiajs/react';
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
    },
    {
        accessorKey: 'price',
        header: 'Precio',
        cell: ({ row }) => (
            <span className="font-medium">
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
                            <Edit />
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
                No hay packs disponibles.
            </div>
        );
    }

    return <DataTable columns={columns} data={data} />;
}
