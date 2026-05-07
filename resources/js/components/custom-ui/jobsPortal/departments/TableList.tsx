'use client';

import { ConfirmDeleteAlert } from '@/components/custom-ui/ConfirmDeleteAlert';
import { StatusBadge } from '@/components/custom-ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/helpers/formatDate';
import { Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Edit, Trash } from 'lucide-react';
import { DataTable } from '../../tables/DataTable';

type Department = {
    id: string;
    name: string;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
};

interface TableListProps {
    data: Paginated<Department>;
    filters?: { search?: string };
}

export const columns: ColumnDef<Department>[] = [
    { accessorKey: 'name', header: 'Nombre' },
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
        accessorKey: 'updated_at',
        header: 'Actualizado el',
        cell: ({ row }) =>
            row.original.updated_at
                ? formatDate(row.original.updated_at, true)
                : '-',
    },
    {
        id: 'actions',
        header: 'Acciones',
        cell: ({ row }) => {
            const department = row.original;

            return (
                <div className="flex gap-2">
                    <Button type="button" variant="outline" size="icon" asChild>
                        <Link
                            href={`/admin/jobs/departments/${department.id}/edit`}
                            title="Editar área"
                        >
                            <Edit />
                        </Link>
                    </Button>
                    <ConfirmDeleteAlert
                        resourceId={department.id}
                        resourceName={department.name}
                        routes={{
                            destroy: (id: string) => ({
                                url: `/admin/jobs/departments/${id}`,
                                method: 'delete' as const,
                            }),
                        }}
                        trigger={
                            <Button
                                variant="destructive"
                                size="icon"
                                title="Eliminar área"
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
                    '/admin/jobs/departments',
                    { search: value },
                    { preserveState: true, preserveScroll: true },
                )
            }
            placeholder="Buscar por nombre..."
        />
    );
}
