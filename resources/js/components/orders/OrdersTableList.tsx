'use client';

import { DataTable } from '@/components/custom-ui/tables/DataTable';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/helpers/formatDate';
import { Link } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Eye, PencilLine } from 'lucide-react';

import { StatusBadge } from './status';
import { OrderRow } from './types';
import OrderStateDialog from './OrderStateDialog';

interface OrdersTableListProps {
    data: Paginated<OrderRow>;
}

function RowActions({ order }: { order: OrderRow }) {
    return (
        <div className="flex items-center gap-2">
            <OrderStateDialog
                order={order}
                trigger={
                    <Button type="button" variant="outline" size="icon" title="Actualizar estado">
                        <PencilLine className="h-4 w-4" />
                    </Button>
                }
            />
            <Button type="button" variant="outline" size="icon" asChild title="Ver detalle">
                <Link href={`/ordenes/${order.id}`}>
                    <Eye className="h-4 w-4" />
                </Link>
            </Button>
        </div>
    );
}

const columns: ColumnDef<OrderRow>[] = [
    {
        accessorKey: 'code',
        header: 'Numero de orden',
        cell: ({ row }) => <span className="font-medium">{row.original.code}</span>,
    },
    {
        accessorKey: 'customer_email',
        header: 'Cliente',
        cell: ({ row }) => (
            <div className="flex flex-col">
                <span>{row.original.customer_email}</span>
                <span className="text-xs text-muted-foreground">Doc: {row.original.customer_document_number}</span>
            </div>
        ),
    },
    {
        accessorKey: 'created_at',
        header: 'Fecha',
        cell: ({ row }) => <span>{formatDate(row.original.created_at, true)}</span>,
    },
    {
        accessorKey: 'status',
        header: 'Estado de orden',
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
        accessorKey: 'payment_status',
        header: 'Estado de pago',
        cell: ({ row }) => <StatusBadge status={row.original.payment_status} />,
    },
    {
        accessorKey: 'shipping_status',
        header: 'Estado de envio',
        cell: ({ row }) => <StatusBadge status={row.original.shipping_status} />,
    },
    {
        accessorKey: 'total',
        header: 'Total',
        cell: ({ row }) => <span>S/ {row.original.total}</span>,
    },
    {
        id: 'actions',
        header: 'Acciones',
        cell: ({ row }) => <RowActions order={row.original} />,
    },
];

export default function OrdersTableList({ data }: OrdersTableListProps) {
    if (!data) return null;

    return <DataTable columns={columns} data={data} />;
}
