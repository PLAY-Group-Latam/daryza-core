'use client';

import { ConfirmDeleteAlert } from '@/components/custom-ui/ConfirmDeleteAlert';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/helpers/formatDate';
import { Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Eye, Trash } from 'lucide-react';
import { DataTable } from '../../tables/DataTable';

type Application = {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    created_at?: string;
    job?: { id: string; title: string; slug: string };
};

interface TableListProps {
    data: Paginated<Application>;
    filters?: { email?: string };
}

export const columns: ColumnDef<Application>[] = [
    {
        id: 'candidate',
        header: 'Candidato',
        cell: ({ row }) =>
            `${row.original.first_name} ${row.original.last_name}`,
    },
    { accessorKey: 'email', header: 'Correo' },
    { accessorKey: 'phone', header: 'Teléfono' },
    {
        id: 'job',
        header: 'Oferta',
        cell: ({ row }) => row.original.job?.title ?? '-',
    },
    {
        accessorKey: 'created_at',
        header: 'Postuló el',
        cell: ({ row }) =>
            row.original.created_at
                ? formatDate(row.original.created_at, true)
                : '-',
    },
    {
        id: 'actions',
        header: 'Acciones',
        cell: ({ row }) => {
            const application = row.original;

            return (
                <div className="flex gap-2">
                    <Button type="button" variant="outline" size="icon" asChild>
                        <Link
                            href={`/admin/jobs/applications/${application.id}`}
                            title="Ver postulación"
                        >
                            <Eye />
                        </Link>
                    </Button>
                    <ConfirmDeleteAlert
                        resourceId={application.id}
                        resourceName={`${application.first_name} ${application.last_name}`}
                        routes={{
                            destroy: (id: string) => ({
                                url: `/admin/jobs/applications/${id}`,
                                method: 'delete' as const,
                            }),
                        }}
                        trigger={
                            <Button
                                variant="destructive"
                                size="icon"
                                title="Eliminar postulación"
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
            initialSearch={filters?.email ?? ''}
            onSearch={(value) =>
                router.get(
                    '/admin/jobs/applications',
                    { email: value },
                    { preserveState: true, preserveScroll: true },
                )
            }
            placeholder="Buscar por nombre, correo o teléfono..."
        />
    );
}
