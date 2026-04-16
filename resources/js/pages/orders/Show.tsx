import { BackButton } from '@/components/custom-ui/PageHeader';
import {
    OrderCustomerCard,
    OrderHistoryTable,
    OrderInfoCard,
    OrderItemsTable,
    OrderPaymentInfoCard,
    OrderShippingCard,
    OrderStateGuideDialog,
    OrderStatusManager,
    OrderTotalsCard,
} from '@/components/orders';
import { OrderDetail } from '@/components/orders/types';
import AppLayout from '@/layouts/app-layout';
import { Head, usePage } from '@inertiajs/react';

export default function OrdersShow() {
    const { order } = usePage<{ order: OrderDetail }>().props;

    console.log('ordenes', order);
    return (
        <AppLayout>
            <div className="mb-6 flex items-center gap-4">
                <BackButton />
            </div>
            <Head title={`Orden ${order.code}`} />

            <div className="flex flex-1 flex-col gap-5 rounded-xl text-sm">
                <div className="flex flex-col gap-3 rounded-lg border p-5 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                            Detalles del pedido
                        </p>
                        <h1 className="text-2xl font-bold">
                            Orden {order.code}
                        </h1>
                        <p className="text-xs text-muted-foreground">
                            ID: {order.id}
                        </p>
                    </div>

                    <OrderStateGuideDialog />
                </div>

                <OrderStatusManager order={order} />

                <div className="grid gap-4 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <OrderInfoCard order={order} />
                    </div>
                    <OrderTotalsCard order={order} />
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
