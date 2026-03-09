import { OrdersTableList } from '@/components/orders';
import { OrderRow } from '@/components/orders/types';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Ordenes', href: '/ordenes' }];

interface OrdersIndexProps {
    paginatedOrders: Paginated<OrderRow>;
}

export default function OrdersIndex() {
    const { paginatedOrders } = usePage().props as unknown as OrdersIndexProps;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Ordenes" />

            <div className="flex flex-1 flex-col gap-6 rounded-xl">
                <h1 className="text-lg font-bold lg:text-2xl">Lista de ordenes</h1>
                <OrdersTableList data={paginatedOrders} />
            </div>
        </AppLayout>
    );
}
