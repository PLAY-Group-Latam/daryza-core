'use client';

import { Link } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Edit2, Trash2 } from 'lucide-react';

import { ConfirmDeleteAlert } from '@/components/custom-ui/ConfirmDeleteAlert';
import { Button } from '@/components/ui/button';
import { PaymentMethod } from '@/types/paymentmethods';

/**
 * Exportamos como función para recibir el callback onDelete 
 * y actualizar el estado de la tabla en tiempo real.
 */
export const columns = (
    onDelete: (id: string) => void
): ColumnDef<PaymentMethod>[] => [
    {
        accessorKey: 'id',
        header: '#',
    },
    {
        accessorKey: 'company_type',
        header: 'Marca',
        cell: ({ getValue }) => (
            <span className="capitalize">{getValue<string>()}</span>
        ),
    },
    {
        accessorKey: 'name', 
        header: 'Banco',
        cell: ({ row }) => {
            const name = row.original.name;
            return <span className="font-medium uppercase">{name}</span>;
        },
    },
    {
        accessorKey: 'account_number',
        header: 'Cuenta',
        cell: ({ getValue }) => {
            const accountNumber = getValue<string>();
            return <span className="font-mono text-sm">{accountNumber}</span>;
        },
    },
    {
        accessorKey: 'is_active',
        header: 'Estado',
        cell: ({ getValue }) => {
            const isActive = getValue<boolean>();
            return (
                <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        isActive
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}
                >
                    {isActive ? 'Activo' : 'Inactivo'}
                </span>
            );
        },
    },
    {
        accessorKey: 'created_at',
        header: 'Creado el',
        cell: ({ row }) => {
            const date = row.getValue('created_at') as string;
            return new Date(date).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
            });
        },
    },
    {
        id: 'actions',
        header: 'Acciones',
        cell: ({ row }) => {
            const method = row.original;

            return (
                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    {/* Botón Editar */}
                    <Button
                        variant="outline"
                        size="icon"
                        asChild
                        title="Editar"
                    >
                        <Link href={`/metodos-de-pago/${method.id}/editar`}>
                            <Edit2 className="h-4 w-4" />
                        </Link>
                    </Button>

                    {/* Alerta de Eliminación */}
                    <ConfirmDeleteAlert
                        resourceId={method.id.toString()}
                        resourceName={`${method.name} (${method.company_type})`}
                        confirmWord="ELIMINAR"
                        // SUCCESS: Esto actualiza el estado local en TableList.tsx
                        onSuccess={() => onDelete(method.id.toString())}
                        routes={{
                            destroy: (id) => ({
                                url: `/metodos-de-pago/${id}`,
                                method: 'delete',
                            }),
                        }}
                        trigger={
                            <Button
                                variant="destructive"
                                size="icon"
                                title="Eliminar"
                                className="bg-red-700!"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        }
                    />
                </div>
            );
        },
    },
];