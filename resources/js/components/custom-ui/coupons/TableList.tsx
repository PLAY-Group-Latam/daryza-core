'use client';

import { CopyButton } from '@/components/CopyButton';
import { DataTable } from '@/components/custom-ui/tables/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/helpers/formatDate';
import { CouponModel } from '@/types/coupons/coupon';
import { router, usePage } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Pencil, Trash } from 'lucide-react';
import { ConfirmDeleteAlert } from '../ConfirmDeleteAlert';

interface TableListProps {
    data: Paginated<CouponModel>;
}

export const columns: ColumnDef<CouponModel>[] = [
    {
        accessorKey: 'code',
        header: 'Código de Cupón',
        cell: ({ row }) => (
            <span className="flex items-center gap-2">
                <span className="font-mono font-medium">
                    {row.original.code}
                </span>
                <CopyButton
                    textToCopy={row.original.code}
                    ariaLabel={`Copiar código ${row.original.code}`}
                />
            </span>
        ),
    },
    {
        accessorKey: 'scope',
        header: 'Alcance',
        cell: ({ row }) => {
            const scopeLabels: Record<string, string> = {
                global: 'Global',
                product: 'Producto',
                category: 'Categoría',
                pack: 'Pack',
                business_dynamic: 'Dinámica de negocio',
                customer: 'Cliente',
            };
            return (
                <span>
                    {scopeLabels[row.original.scope] ?? row.original.scope}
                </span>
            );
        },
    },
    {
        accessorKey: 'is_active',
        header: 'Estado',
        cell: ({ row }) => (
            <Badge variant={row.original.is_active ? 'default' : 'destructive'}>
                {row.original.is_active ? 'Activo' : 'Inactivo'}
            </Badge>
        ),
    },
    {
        accessorKey: 'is_public',
        header: 'Público',
        cell: ({ row }) => (
            <Badge variant={row.original.is_public ? 'default' : 'secondary'}>
                {row.original.is_public ? 'Sí' : 'No'}
            </Badge>
        ),
    },
    {
        accessorKey: 'valid_from',
        header: 'Válido desde',
        cell: ({ row }) => (
            <span>
                {row.original.valid_from
                    ? formatDate(row.original.valid_from, true)
                    : '-'}
            </span>
        ),
    },
    {
        accessorKey: 'valid_until',
        header: 'Válido hasta',
        cell: ({ row }) => (
            <span>
                {row.original.valid_until
                    ? formatDate(row.original.valid_until, true)
                    : '-'}
            </span>
        ),
    },
    {
        accessorKey: 'usage_limit',
        header: 'Límite usos',
        cell: ({ row }) => <span>{row.original.usage_limit ?? '∞'}</span>,
    },
    {
        id: 'total_uses',
        header: 'Usos',
        cell: ({ row }) => (
            <span>
                {row.original.usage_count ??
                    row.original.redemptions?.length ??
                    0}
            </span>
        ),
    },
    {
        id: 'actions',
        header: 'Acciones',
        cell: ({ row }) => {
            const coupon = row.original;

            return (
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        title="Editar cupón"
                        onClick={() =>
                            router.visit(`/coupon/${coupon.id}/editar`)
                        }
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>

                    <ConfirmDeleteAlert
                        resourceId={coupon.id!}
                        resourceName={coupon.code}
                        routes={{
                            destroy: (id) => ({
                                url: `/coupon/${id}`,
                                method: 'delete',
                            }),
                        }}
                        trigger={
                            <Button variant="destructive" size="icon" title="Eliminar cupón">
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

    if (!data || !data.data) return null;

    const handleSearch = (value: string) => {
        const params: any = { per_page: data.per_page };
        
        if (value && value.trim() !== "") {
            params.search = value;
        }

        router.get(
            '/coupon', // Asegúrate que esta sea la URL de tu index de cupones
            params,
            {
                preserveState: true,
                replace: true,
                only: ['coupons', 'filters'],
            }
        );
    };

    return (
        <DataTable
            columns={columns}
            data={data}
            onSearch={handleSearch}
            initialSearch={filters?.search || ''}
            placeholder="Buscar por código o alcance..."
        />
    );
}