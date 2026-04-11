'use client';

import { DataTable } from '@/components/custom-ui/tables/DataTable';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDate } from '@/lib/helpers/formatDate';
import { Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { ChevronDown, Eye } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';

import OrderStateGuideDialog from './OrderStateGuideDialog';
import {
    ADMIN_ACTION_OPTIONS,
    AdminOrderAction,
    getAdminActionLabel,
    getUnifiedOrderStatus,
    isAdminActionAvailable,
    UnifiedStatusBadge,
} from './status';
import { OrderRow } from './types';

interface OrdersTableListProps {
    data: Paginated<OrderRow>;
}

function RowActions({ order }: { order: OrderRow }) {
    return (
        <div className="flex items-center gap-2">
            <Button
                type="button"
                variant="outline"
                size="icon"
                asChild
                title="Ver detalle"
            >
                <Link href={`/ordenes/${order.id}`}>
                    <Eye className="h-4 w-4" />
                </Link>
            </Button>
        </div>
    );
}

export default function OrdersTableList({ data }: OrdersTableListProps) {
    const pageIds = useMemo(
    () => data.data.map((order) => order.id),
    [data.data]
);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isApplying, setIsApplying] = useState(false);
    const [bulkMessage, setBulkMessage] = useState<string | null>(null);

    const allSelected =
        pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id));

    const toggleOne = useCallback((id: string, checked: boolean) => {
        setSelectedIds((prev) =>
            checked
                ? [...new Set([...prev, id])]
                : prev.filter((item) => item !== id),
        );
    }, []);
    const toggleAll = useCallback(
        (checked: boolean) => {
            setSelectedIds((prev) => {
                if (checked) return [...new Set([...prev, ...pageIds])];
                return prev.filter((id) => !pageIds.includes(id));
            });
        },
        [pageIds],
    );

    const applyBulkAction = async (action: AdminOrderAction) => {
        if (selectedIds.length === 0 || isApplying) return;
        const selectedOrders = data.data.filter((order) =>
            selectedIds.includes(order.id),
        );
        const allowedOrders = selectedOrders.filter((order) =>
            isAdminActionAvailable(order, action),
        );
        const blockedOrders = selectedOrders.filter(
            (order) => !isAdminActionAvailable(order, action),
        );
        if (allowedOrders.length === 0) {
            setBulkMessage(
                'La accion seleccionada no aplica para las ordenes seleccionadas.',
            );
            toast.error(
                'La accion seleccionada no aplica para las ordenes seleccionadas.',
            );
            return;
        }

        setBulkMessage(null);
        setIsApplying(true);
        router.patch(
            '/ordenes/admin-action/bulk',
            {
                order_ids: allowedOrders.map((order) => order.id),
                action,
                note: null,
            },
            {
                preserveScroll: true,
                preserveState: true,
                onFinish: () => setIsApplying(false),
                onError: () => {
                    setBulkMessage('No se pudo aplicar la accion masiva.');
                    toast.error('No se pudo aplicar la accion masiva.');
                },
                onSuccess: (page) => {
                    setSelectedIds([]);
                    const flash = (
                        page.props as {
                            flash?: {
                                bulk_result?: {
                                    failed?: Array<{ reason?: string }>;
                                };
                            };
                        }
                    ).flash;
                    const failedReasons = flash?.bulk_result?.failed ?? [];
                    if (blockedOrders.length > 0) {
                        setBulkMessage(
                            `Se enviaron ${allowedOrders.length} orden(es) al cambio. ${blockedOrders.length} quedaron fuera por no aplicar.`,
                        );
                        toast.success(
                            `Actualizacion parcial: ${allowedOrders.length} actualizadas, ${blockedOrders.length} sin cambios.`,
                        );
                    } else {
                        setBulkMessage(
                            `Se enviaron ${allowedOrders.length} orden(es) al cambio.`,
                        );
                        toast.success(
                            `Se actualizaron ${allowedOrders.length} orden(es).`,
                        );
                    }
                    if (failedReasons.length > 0) {
                        toast.error(
                            failedReasons[0]?.reason ??
                                'Algunas ordenes no pudieron actualizarse.',
                        );
                    }
                    router.reload({ only: ['paginatedOrders'] });
                },
            },
        );
    };

   const columns = useMemo<ColumnDef<OrderRow>[]>(
        () => [
            {
                id: 'select',
                header: () => (
                    <Checkbox
                        checked={allSelected}
                        onCheckedChange={(value) => toggleAll(value === true)}
                        aria-label="Seleccionar todas las ordenes de la pagina"
                    />
                ),
                cell: ({ row }) => (
                    <Checkbox
                        checked={selectedIds.includes(row.original.id)}
                        onCheckedChange={(value) =>
                            toggleOne(row.original.id, value === true)
                        }
                        aria-label={`Seleccionar orden ${row.original.code}`}
                    />
                ),
            },
            {
                accessorKey: 'code',
                header: 'Numero de orden',
                cell: ({ row }) => (
                    <span className="font-medium">{row.original.code}</span>
                ),
            },
            {
                accessorKey: 'customer_email',
                header: 'Cliente',
                cell: ({ row }) => (
                    <div className="flex flex-col">
                        <span>{row.original.customer_email}</span>
                        <span className="text-xs text-muted-foreground">
                            Doc: {row.original.customer_document_number}
                        </span>
                    </div>
                ),
            },
            {
                accessorKey: 'created_at',
                header: 'Fecha',
                cell: ({ row }) => (
                    <span>{formatDate(row.original.created_at, true)}</span>
                ),
            },
            {
                id: 'unified_status',
                header: 'Estado',
                cell: ({ row }) => (
                    <UnifiedStatusBadge
                        status={getUnifiedOrderStatus(row.original)}
                    />
                ),
            },
            {
                accessorKey: 'payment_method_type',
                header: 'Metodo de pago',
                cell: ({ row }) => (
                    <span>
                        {row.original.payment_method_type === 'bank_transfer'
                            ? 'Transferencia bancaria'
                            : row.original.payment_method_type === 'niubiz'
                              ? 'Niubiz'
                              : '-'}
                    </span>
                ),
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
        ],
        [allSelected, selectedIds, toggleAll, toggleOne],
    );

    const selectedOrders = data.data.filter((order) =>
        selectedIds.includes(order.id),
    );
    const availableBulkActions = ADMIN_ACTION_OPTIONS.filter((action) =>
        selectedOrders.some((order) =>
            isAdminActionAvailable(order, action.value),
        ),
    );

    const toolbarRight = (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        type="button"
                        variant="outline"
                        disabled={selectedIds.length === 0 || isApplying}
                    >
                        {isApplying ? 'Aplicando...' : 'Actualizar estado'}{' '}
                        <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    {availableBulkActions.map((item) => {
                        const selectedOrderForLabel =
                            selectedOrders.length === 1
                                ? selectedOrders[0]
                                : null;
                        const label = selectedOrderForLabel
                            ? getAdminActionLabel(
                                  selectedOrderForLabel,
                                  item.value,
                              )
                            : item.label;

                        return (
                            <DropdownMenuItem
                                key={item.value}
                                onClick={() => applyBulkAction(item.value)}
                            >
                                {label}
                            </DropdownMenuItem>
                        );
                    })}
                </DropdownMenuContent>
            </DropdownMenu>
            <OrderStateGuideDialog />
        </>
    );

    return (
        <div className="space-y-3">
            {bulkMessage ? (
                <p className="text-sm text-muted-foreground">{bulkMessage}</p>
            ) : null}
            <DataTable
                columns={columns}
                data={data}
                toolbarRight={toolbarRight}
            />
        </div>
    );
}
