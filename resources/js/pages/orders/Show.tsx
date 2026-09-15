import { BackButton } from '@/components/custom-ui/PageHeader';
import {
    OrderCustomerCard,
    OrderHistoryTable,
    OrderInfoCard,
    OrderItemsTable,
    OrderPaymentInfoCard,
    OrderShippingCard,
    OrderStatusManager,
    OrderTotalsCard,
} from '@/components/custom-ui/orders';
import OrderStateDialog from '@/components/custom-ui/orders/OrderStateDialog';

import { OrderDetail } from '@/components/custom-ui/orders/types';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head, usePage } from '@inertiajs/react';
import { RotateCw } from 'lucide-react';

export default function OrdersShow() {
    const { order } = usePage<{ order: OrderDetail }>().props;

    return (
        <AppLayout>
            <div className="mb-6 flex items-center gap-4">
                <BackButton fallbackUrl="/ordenes" />
            </div>
            <Head title={`Orden ${order.code}`} />

            <div className="flex flex-1 flex-col gap-5 rounded-xl text-sm">
                <div className="flex flex-col gap-3 rounded-lg border p-6 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                            Detalles del pedido
                        </p>

                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold">
                                Orden {order.code}
                            </h1>
                            <OrderStatusManager order={order} />
                        </div>
                    </div>

                    <OrderStateDialog
                        order={order}
                        trigger={
                            <Button type="button" size="sm" className="gap-2">
                                <RotateCw className="h-4 w-4" />
                                Actualizar estado
                            </Button>
                        }
                    />
                </div>

                <div className="grid items-stretch gap-4 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <OrderInfoCard order={order} />
                    </div>
                    <div>
                        <OrderTotalsCard order={order} />
                    </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                    <OrderCustomerCard order={order} />
                    <OrderShippingCard order={order} />
                </div>

                <div className="rounded-lg border p-5">
                    <p className="mb-4 text-sm font-semibold">Productos</p>
                    <OrderItemsTable items={order.items} />
                </div>

                <OrderPaymentInfoCard order={order} />

                <div className="rounded-lg border p-5">
                    <p className="mb-4 text-sm font-semibold">Trazabilidad</p>
                    <OrderHistoryTable history={order.status_history} />
                </div>
            </div>
        </AppLayout>
    );
}
