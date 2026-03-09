'use client';

import { StatusBadge } from '@/components/custom-ui/StatusBadge';
import { ConfirmDeleteAlert } from '@/components/custom-ui/ConfirmDeleteAlert';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/helpers/formatDate';
import { Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Edit, Trash } from 'lucide-react';
import { DataTable } from '../../tables/DataTable';

type Place = {
    id: string;
    name: string;
    address: string;
    city: string;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
};

interface TableListProps {
    data: Paginated<Place>;
    filters?: { search?: string };
}

export const columns: ColumnDef<Place>[] = [
    { accessorKey: 'name', header: 'Nombre' },
    { accessorKey: 'address', header: 'Dirección' },
    { accessorKey: 'city', header: 'Ciudad' },
    {
        accessorKey: 'is_active',
        header: 'Estado',
        cell: ({ row }) => <StatusBadge status={row.original.is_active} />,
    },
    {
        accessorKey: 'created_at',
        header: 'Creado el',
        cell: ({ row }) =>
            row.original.created_at
                ? formatDate(row.original.created_at, true)
                : '-',
    },
    {
        id: 'actions',
        header: 'Acciones',
        cell: ({ row }) => {
            const place = row.original;

            return (
                <div className="flex gap-2">
                    <Button type="button" variant="outline" size="icon" asChild>
                        <Link href={`/admin/jobs/places/${place.id}/edit`} title="Editar sede">
                            <Edit />
                        </Link>
                    </Button>
                    <ConfirmDeleteAlert
                        resourceId={place.id}
                        resourceName={place.name}
                        routes={{
                            destroy: (id: string) => ({
                                url: `/admin/jobs/places/${id}`,
                                method: 'delete' as const,
                            }),
                        }}
                        trigger={
                            <Button
                                variant="destructive"
                                size="icon"
                                title="Eliminar sede"
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

export default function TableList({ data, filters }: TableListProps) {
    if (!data) return null;

    return (
        <DataTable
            columns={columns}
            data={data}
            perPageOptions={[10]}
            initialSearch={filters?.search ?? ''}
            onSearch={(value) =>
                router.get(
                    '/admin/jobs/places',
                    { search: value },
                    { preserveState: true, preserveScroll: true },
                )
            }
        />
    );
}
