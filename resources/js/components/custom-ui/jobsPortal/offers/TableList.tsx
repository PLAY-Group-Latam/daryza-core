'use client';

import { StatusBadge } from '@/components/custom-ui/StatusBadge';
import { ConfirmDeleteAlert } from '@/components/custom-ui/ConfirmDeleteAlert';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/helpers/formatDate';
import { Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Edit, Trash } from 'lucide-react';
import { DataTable } from '../../tables/DataTable';

type Offer = {
    id: string;
    title: string;
    modality: string;
    vacancies: number;
    is_active: boolean;
    created_at?: string;
    area?: { id: string; name: string };
    place?: { id: string; name: string; city: string };
};

interface TableListProps {
    data: Paginated<Offer>;
    filters?: { search?: string };
}

const modalityLabels: Record<string, string> = {
    on_site: 'Presencial',
    remote: 'Remoto',
    hybrid: 'Híbrido',
};

export const columns: ColumnDef<Offer>[] = [
    { accessorKey: 'title', header: 'Título' },
    {
        id: 'area',
        header: 'Área',
        cell: ({ row }) => row.original.area?.name ?? '-',
    },
    {
        id: 'place',
        header: 'Sede',
        cell: ({ row }) => row.original.place?.name ?? '-',
    },
    {
        accessorKey: 'modality',
        header: 'Modalidad',
        cell: ({ row }) => modalityLabels[row.original.modality] ?? row.original.modality,
    },
    { accessorKey: 'vacancies', header: 'Vacantes' },
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
            const offer = row.original;

            return (
                <div className="flex gap-2">
                    <Button type="button" variant="outline" size="icon" asChild>
                        <Link href={`/admin/jobs/offers/${offer.id}/edit`} title="Editar oferta">
                            <Edit />
                        </Link>
                    </Button>
                    <ConfirmDeleteAlert
                        resourceId={offer.id}
                        resourceName={offer.title}
                        routes={{
                            destroy: (id: string) => ({
                                url: `/admin/jobs/offers/${id}`,
                                method: 'delete' as const,
                            }),
                        }}
                        trigger={
                            <Button
                                variant="destructive"
                                size="icon"
                                title="Eliminar oferta"
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
                    '/admin/jobs/offers',
                    { search: value },
                    { preserveState: true, preserveScroll: true },
                )
            }
        />
    );
}
