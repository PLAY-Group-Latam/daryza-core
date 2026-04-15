'use client';

import { ConfirmDeleteAlert } from '@/components/custom-ui/ConfirmDeleteAlert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import scripts from '@/routes/scripts';
import { Link } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Edit, Trash, Trash2 } from 'lucide-react';
import { Script } from './ScriptForm';

export const columns = (
    onDelete: (id: string) => void,
): ColumnDef<Script>[] => [
    {
        accessorKey: 'name',
        header: 'Nombre',
        cell: ({ row }) => (
            <span className="font-medium">{row.original.name}</span>
        ),
    },
    {
        accessorKey: 'placement',
        header: 'Ubicación',
        cell: ({ row }) => {
            const placement = row.getValue<'head' | 'body'>('placement');
            return (
                <Badge
                    variant={placement === 'head' ? 'default' : 'outline'}
                    className="capitalize"
                >
                    {placement}
                </Badge>
            );
        },
    },
    {
        accessorKey: 'active',
        header: 'Estado',
        cell: ({ row }) => {
            const active = row.getValue<boolean>('active');
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
        accessorKey: 'created_at',
        header: 'Creado el',
        cell: ({ row }) => {
            const createdAt = row.getValue<string>('created_at');
            return (
                <span className="text-muted-foreground">
                    {format(new Date(createdAt), 'dd/MM/yyyy')}
                </span>
            );
        },
    },
    {
        id: 'actions',
        header: 'Acciones',
        cell: ({ row }) => {
            const script = row.original;
            return (
                <div
                    className="flex gap-2"
                    onClick={(e) => e.stopPropagation()}
                >
                    <Button type="button" variant="outline" size="icon" asChild>
                        <Link
                            href={`/scripts/${script.id}/edit`}
                            title="Editar script"
                        >
                            <Edit className="h-4 w-4" />
                        </Link>
                    </Button>

                    <ConfirmDeleteAlert
                        resourceId={script.id}
                        resourceName={script.name}
                        onSuccess={() => onDelete(script.id)}
                        routes={{
                            destroy: (id: string) =>
                                scripts.destroy({ script: id }),
                        }}
                        trigger={
                            <Button
                                variant="destructive"
                                size="icon"
                                title="Eliminar script"
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
