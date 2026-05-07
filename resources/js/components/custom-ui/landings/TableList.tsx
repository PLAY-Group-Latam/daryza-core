'use client';

import { ConfirmDeleteAlert } from '@/components/custom-ui/ConfirmDeleteAlert';
import { DataTable } from '@/components/custom-ui/tables/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/helpers/formatDate';
import { Landing } from '@/types/landings';
import { Link } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Edit, Trash, Users } from 'lucide-react';

interface Props {
    data: Paginated<Landing>;
}

const routes = {
    destroy: (id: number | string) => ({
        url: `/landings/items/${id}`,
        method: 'delete' as const,
    }),
};

export const columns: ColumnDef<Landing>[] = [
    {
        accessorKey: 'title',
        header: 'Título',
        cell: ({ row }) => {
            const landing = row.original;
            const frontendUrl = import.meta.env.VITE_FRONTEND_URL;
            const publicUrl = `${frontendUrl}/landing/producto/${landing.slug}`;

            return (
                <div className="flex flex-col">
                    <span className="font-medium text-foreground">
                        {landing.title}
                    </span>
                    <a
                        href={publicUrl}
                        className="w-fit text-sm text-blue-600 hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {publicUrl}
                    </a>
                </div>
            );
        },
    },
    {
        accessorKey: 'is_active',
        header: 'Estado',
        cell: ({ row }) =>
            row.original.is_active ? (
                <Badge>Activo</Badge>
            ) : (
                <Badge variant="outline">Inactivo</Badge>
            ),
    },
    {
        accessorKey: 'created_at',
        header: 'Creado',
        cell: ({ row }) => formatDate(row.original.created_at, true),
    },
    {
        accessorKey: 'updated_at',
        header: 'Actualizado',
        cell: ({ row }) => formatDate(row.original.updated_at, true),
    },
    {
        accessorKey: 'leads_count',
        header: 'Leads',
        cell: ({ row }) => row.original.leads_count ?? 0,
    },
    {
        id: 'actions',
        header: 'Acciones',
        cell: ({ row }) => {
            const landing = row.original;

            return (
                <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" asChild>
                        <Link
                            href={`/landings/items/${landing.id}/leads`}
                            title="Ver leads"
                        >
                            <Users className="mr-2 h-4 w-4" />
                            Ver leads
                        </Link>
                    </Button>

                    <Button type="button" variant="outline" size="icon" asChild>
                        <Link
                            href={`/landings/items/${landing.id}/edit`}
                            title="Editar landing"
                        >
                            <Edit />
                        </Link>
                    </Button>

                    <ConfirmDeleteAlert
                        resourceId={landing.id}
                        resourceName={landing.title}
                        routes={routes}
                        trigger={
                            <Button
                                variant="destructive"
                                size="icon"
                                title="Eliminar landing"
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

export default function TableList({ data }: Props) {
    return (
        <DataTable
            columns={columns}
            data={data}
            searchKeys={['title', 'slug']}
            placeholder="Buscar por título o slug..."
        />
    );
}
