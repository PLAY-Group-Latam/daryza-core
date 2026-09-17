'use client';

import { ConfirmDeleteAlert } from '@/components/custom-ui/ConfirmDeleteAlert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Edit, Power, Trash } from 'lucide-react';
import { DestinationEmail, DestinationEmailPageOption } from '../types';

export const columns = (
    pageOptions: DestinationEmailPageOption[],
): ColumnDef<DestinationEmail>[] => {
    const labels = Object.fromEntries(
        pageOptions.map((page) => [page.key, page.label]),
    );

    return [
        {
            accessorKey: 'name',
            header: 'Nombre',
            cell: ({ row }) => (
                <span className="font-medium">{row.original.name}</span>
            ),
        },
        {
            accessorKey: 'email',
            header: 'Correo',
            cell: ({ row }) => (
                <span className="text-muted-foreground">
                    {row.original.email}
                </span>
            ),
        },
        {
            accessorKey: 'pages',
            header: 'Páginas',
            cell: ({ row }) => (
                <div className=" flex-wrap gap-1">
                    {(row.original.page_keys ?? []).map((page) => (
                        <Badge key={page} variant="secondary">
                            {labels[page] ?? page}
                        </Badge>
                    ))}
                </div>
            ),
        },
        {
            accessorKey: 'is_active',
            header: 'Estado',
            cell: ({ row }) => {
                const active = row.getValue<boolean>('is_active');
                return (
                    <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            active
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}
                    >
                        {active ? 'Activo' : 'Inactivo'}
                    </span>
                );
            },
        },
        {
            id: 'actions',
            header: 'Acciones',
            cell: ({ row }) => {
                const destinationEmail = row.original;

                return (
                    <div
                        className="flex gap-2"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            asChild
                        >
                            <Link
                                href={`/destination-emails/${destinationEmail.id}/edit`}
                                title="Editar email de destino"
                            >
                                <Edit className="h-4 w-4" />
                            </Link>
                        </Button>

                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            title={
                                destinationEmail.is_active
                                    ? 'Desactivar'
                                    : 'Activar'
                            }
                            onClick={() =>
                                router.patch(
                                    `/destination-emails/${destinationEmail.id}/toggle`,
                                )
                            }
                        >
                            <Power className="h-4 w-4" />
                        </Button>

                        <ConfirmDeleteAlert
                            resourceId={destinationEmail.id}
                            resourceName={destinationEmail.name}
                            routes={{
                                destroy: (id: string) => ({
                                    url: `/destination-emails/${id}`,
                                    method: 'delete',
                                }),
                            }}
                            trigger={
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    title="Eliminar email de destino"
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
};
