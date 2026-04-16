import { OrdersTableList } from '@/components/custom-ui/orders';
import { OrderRow } from '@/components/custom-ui/orders/types';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Download } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Ordenes', href: '/ordenes' }];

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
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Ordenes" />

            <div className="flex flex-1 flex-col gap-6 rounded-xl">
                <div className="flex items-center justify-between">
                    <h1 className="text-lg font-bold lg:text-2xl">
                        Lista de ordenes
                    </h1>
                    <button
                        onClick={() => {
                            window.location.href = `/ordenes/export${window.location.search}`;
                        }}
                        className="flex cursor-pointer items-center gap-2 rounded-sm bg-blue-600 px-2.5 py-1.5 text-sm text-white hover:bg-blue-700"
                    >
                        <Download className="mr-1 h-4 w-4" />
                        Exportar Ordenes
                    </button>
                </div>
                <OrdersTableList data={paginatedOrders} filters={filters} />
            </div>
        </AppLayout>
    );
}
