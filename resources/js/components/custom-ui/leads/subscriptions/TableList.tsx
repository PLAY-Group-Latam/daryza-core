'use client';

import { useMemo, useState, useCallback } from 'react';
import { router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Copy, Check, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/helpers/formatDate';
import { Subscription } from '@/types/leads/newsletter';
import { DataTable } from '../../tables/DataTable';

interface SubscriptionTableListProps {
    data: Paginated<Subscription>;
    filters?: {
        search?: string;
    };
}

export default function TableList({ data, filters }: SubscriptionTableListProps) {
    const [copiedId, setCopiedId] = useState<string | null>(null);

    // Búsqueda con Inertia
    const handleSearch = useCallback((value: string) => {
        router.get(
            window.location.pathname,
            { ...filters, search: value },
            { preserveState: true, replace: true }
        );
    }, [filters]);

    // Copiar correo al portapapeles
    const handleCopyEmail = useCallback((email: string, id: string) => {
        navigator.clipboard.writeText(email);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    }, []);

    // Acción de eliminar
    const handleDelete = useCallback((id: string) => {
        if (confirm('¿Estás seguro de eliminar esta suscripción?')) {
            router.delete(`/subscriptions/items/${id}`);
        }
    }, []);

    // Definición de columnas para TanStack Table
    const columns = useMemo<ColumnDef<Subscription>[]>(
        () => [
            {
                accessorKey: 'email',
                header: 'Correo',
                cell: ({ row }) => {
                    const item = row.original;
                    const isCopied = copiedId === item.id;

                    return (
                        <div className="flex items-center gap-2 pl-2">
                            <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                {item.email}
                            </span>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                onClick={() => handleCopyEmail(item.email, item.id)}
                                title="Copiar correo"
                            >
                                {isCopied ? (
                                    <Check size={14} className="text-emerald-600" />
                                ) : (
                                    <Copy size={14} />
                                )}
                            </Button>
                        </div>
                    );
                },
            },
            {
                accessorKey: 'created_at',
                header: 'Fecha de Suscripción',
                cell: ({ row }) => (
                    <span className="text-xs text-slate-600 dark:text-slate-400">
                        {formatDate(row.original.created_at)}
                    </span>
                ),
            },
            {
                accessorKey: 'updated_at',
                header: 'Actualizado el',
                cell: ({ row }) => (
                    <span className="text-xs text-slate-600 dark:text-slate-400">
                        {formatDate(row.original.updated_at)}
                    </span>
                ),
            },
            {
                id: 'actions',
                header: () => <div className="text-right pr-6">Acciones</div>,
                cell: ({ row }) => (
                    <div className="flex justify-end items-center pr-8">
                        <Button
                            type="button"
                            size="icon"
                            className="h-8 w-8 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                            onClick={() => handleDelete(row.original.id)}
                            title="Eliminar suscripción"
                        >
                            <Trash2 size={16} />
                        </Button>
                    </div>
                ),
            },
        ],
        [copiedId, handleCopyEmail, handleDelete]
    );

    if (!data?.data) return null;

    return (
        <div className="w-full">
            <DataTable
                columns={columns}
                data={data}
                onSearch={handleSearch}
                initialSearch={filters?.search ?? ''}
                placeholder="Buscar por correo..."
            />
        </div>
    );
}