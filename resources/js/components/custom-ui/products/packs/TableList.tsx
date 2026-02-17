'use client';

import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/helpers/formatDate';
import packs from '@/routes/products/packs';
import { Pack } from '@/types/products/packs';
import { Link } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Edit, Trash } from 'lucide-react';
import { ConfirmDeleteAlert } from '../../ConfirmDeleteAlert';
import { DataTable } from '../../tables/DataTable';

interface TableListProps {
    data: Paginated<Pack>;
}

const columns: ColumnDef<Pack>[] = [
    {
        accessorKey: 'name',
        header: 'Nombre',
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
        id: 'products',
        header: 'Productos',
        cell: ({ row }) => {
            const products = row.original.products ?? [];

            if (products.length === 0) {
                return (
                    <span className="text-xs text-gray-400 italic">
                        Sin productos
                    </span>
                );
            }

            return (
                <span className="text-sm text-gray-700">
                    {products.length} producto{products.length > 1 && 's'}
                </span>
            );
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
