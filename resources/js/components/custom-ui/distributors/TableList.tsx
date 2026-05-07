'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/helpers/formatDate';
import { Distributor } from '@/types/distributors/distributors';
import { Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { CalendarDays, Clock, Edit, MapPin, Trash } from 'lucide-react';
import * as React from 'react'; // Importante para que TS no falle
import { ConfirmDeleteAlert } from '../ConfirmDeleteAlert';
import { DataTable } from '../tables/DataTable';

interface TableListProps {
    data: Paginated<Distributor>;
    filters?: {
        search?: string;
    };
}

export default function TableList({ data, filters }: TableListProps) {
    // 1. Debug: Si no ves nada, descomenta esto para ver qué está llegando
    // console.log("Datos recibidos:", data);

    // 2. Definir columnas dentro para evitar problemas de contexto
    const columns = React.useMemo<ColumnDef<Distributor>[]>(
        () => [
            {
                accessorKey: 'name',
                header: 'Distribuidor',
                cell: ({ row }) => (
                    <div className="flex flex-col">
                        <span className="font-bold text-[#13a538]">
                            {row.original.name}
                        </span>
                    </div>
                ),
            },
            {
                accessorKey: 'region',
                header: 'Región',
                cell: ({ row }) => (
                    <Badge variant="outline">{row.original.region}</Badge>
                ),
            },
            {
                accessorKey: 'email',
                header: 'Contacto',
                cell: ({ row }) => (
                    <div className="flex flex-col text-sm">
                        <span>{row.original.email}</span>
                        <span className="text-xs text-muted-foreground">
                            {row.original.phone}
                        </span>
                    </div>
                ),
            },
            {
                accessorKey: 'created_at',
                header: 'Registro',
                cell: ({ row }) => (
                    <div className="flex items-center gap-2 text-xs">
                        <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                        <div className="flex flex-col">
                            <span className="font-medium text-slate-700">
                                {formatDate(row.original.created_at)}
                            </span>
                            <span className="text-[10px] text-slate-400">
                                Hace poco
                            </span>
                        </div>
                    </div>
                ),
            },

            // Columna de Última Actualización
            {
                accessorKey: 'updated_at',
                header: 'Últ. Movimiento',
                cell: ({ row }) => (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{formatDate(row.original.updated_at)}</span>
                    </div>
                ),
            },
            {
                id: 'actions',
                header: 'Acciones',
                cell: ({ row }) => {
                    const dist = row.original;
                    return (
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" asChild>
                                <Link href={`/distributors/${dist.id}`}>
                                    <MapPin className="h-4 w-4 text-blue-500" />
                                </Link>
                            </Button>
                            <Button variant="outline" size="icon" asChild>
                                <Link href={`/distributors/${dist.id}/edit`}>
                                    <Edit className="h-4 w-4" />
                                </Link>
                            </Button>
                            <ConfirmDeleteAlert
                                resourceId={dist.id}
                                resourceName={dist.name}
                                routes={{
                                    destroy: (id) => ({
                                        url: `/distributors/${id}`,
                                        method: 'delete',
                                    }),
                                }}
                                trigger={
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        className="bg-red-600!"
                                    >
                                        <Trash className="h-4 w-4" />
                                    </Button>
                                }
                            />
                        </div>
                    );
                },
            },
        ],
        [],
    );

    // 3. Verificación de data (Asegúrate de que el controlador use ->paginate())
    if (!data || !data.data) {
        return (
            <div className="rounded-md border p-4 text-center">
                No se encontraron datos de distribuidores o el formato es
                incorrecto.
            </div>
        );
    }

    const handleSearch = (value: string) => {
        router.get(
            window.location.pathname,
            { search: value },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    return (
        <div className="w-full">
            <DataTable
                columns={columns}
                data={data}
                onSearch={handleSearch}
                initialSearch={filters?.search}
                placeholder="Buscar por nombre, región o email..."
            />
        </div>
    );
}
