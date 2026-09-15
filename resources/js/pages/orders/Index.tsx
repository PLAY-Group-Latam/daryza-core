import { OrdersTableList } from '@/components/custom-ui/orders';
import { OrderRow } from '@/components/custom-ui/orders/types';
import AppLayout from '@/layouts/app-layout';
import { Head, usePage } from '@inertiajs/react';

interface OrdersIndexProps {
    paginatedOrders: Paginated<OrderRow>;
    filters?: {
        state?: string;
        search?: string;
    };
}

export default function OrdersIndex() {
    const { paginatedOrders, filters } = usePage()
        .props as unknown as OrdersIndexProps;

    return (
        <AppLayout>
            <Head title="Ordenes" />

            <div className="flex flex-1 flex-col gap-6 rounded-xl">
                <div className="flex items-center justify-between">
                    <h1 className="text-lg font-bold lg:text-2xl">
                        Lista de Ordenes
                    </h1>
                </div>
                <OrdersTableList data={paginatedOrders} filters={filters} />
            </div>
        </AppLayout>
    );
}
