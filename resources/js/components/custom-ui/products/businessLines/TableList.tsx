'use client';

import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/helpers/formatDate';
import productsNamespace from '@/routes/products';
import {
    BusinessLine,
    PaginatedBusinessLines,
} from '@/types/products/businessLines';
import { Link, router, usePage } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Edit, Trash } from 'lucide-react';
import { ConfirmDeleteAlert } from '../../ConfirmDeleteAlert';
import { StatusBadge } from '../../StatusBadge';
import { DataTable } from '../../tables/DataTable';

interface TableListProps {
    data: PaginatedBusinessLines;
}

const columns: ColumnDef<BusinessLine>[] = [
    {
        accessorKey: 'name',
        header: 'Nombre',
        cell: ({ row }) => (
            <div className="flex flex-col">
                <span className="font-medium">{row.original.name}</span>
                <span className="text-xs text-gray-500">
                    {row.original.slug}
                </span>
            </div>
        ),
    },
    {
        accessorKey: 'is_active',
        header: 'Estado',
        cell: ({ row }) => <StatusBadge status={row.original.is_active} />,
    },
    {
        accessorKey: 'created_at',
        header: 'Creado el',
        cell: ({ row }) => (
            <span>{formatDate(row.original.created_at, true)}</span>
        ),
    },
    {
        accessorKey: 'updated_at',
        header: 'Actualizado el',
        cell: ({ row }) => (
            <span>{formatDate(row.original.updated_at, true)}</span>
        ),
    },
    {
        id: 'actions',
        header: 'Acciones',
        cell: ({ row }) => {
            const line = row.original;
            return (
                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        title="Editar línea"
                        asChild
                    >
                        <Link
                            href={productsNamespace.businessLines.edit(line.id)}
                        >
                            <Edit className="h-4 w-4" />
                        </Link>
                    </Button>
                    <ConfirmDeleteAlert
                        resourceId={line.id}
                        resourceName={line.name}
                        routes={productsNamespace.businessLines}
                        trigger={
                            <Button
                                variant="destructive"
                                size="icon"
                                title="Eliminar línea"
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

export default function TableList({ data }: TableListProps) {
    const { filters } = usePage<{ filters: any }>().props;

    if (!data || !data.data) {
        return (
            <div className="p-4 text-center text-gray-500">
                No hay líneas de negocio disponibles.
            </div>
        );
    }

    const handleSearch = (value: string) => {
        const params: any = { per_page: data.per_page };
        
        if (value && value.trim() !== "") {
            params.search = value;
        }

        router.get(
            '/productos/lineas-de-negocio', // <-- Asegúrate que esta sea tu URL real
            params,
            {
                preserveState: true,
                replace: true,
                only: ['paginatedBusinessLines', 'filters'],
            }
        );
    };

    return (
        <DataTable
            columns={columns}
            data={data}
            onSearch={handleSearch}
            initialSearch={filters?.search || ''}
            placeholder="Buscar por nombre o slug..."
        />
    );
}