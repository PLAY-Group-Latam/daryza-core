import TableList from '@/components/custom-ui/customers/TableList';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { PaginatedCustomers } from '@/types/customers';
import { Head, usePage } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Lista de clientes',
        href: '/clientes',
    },
];

export default function Index() {
    const { paginatedCustomers } = usePage<{
        paginatedCustomers: PaginatedCustomers;
    }>().props;
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Lista de CLientes" />
            <div className="flex flex-1 flex-col gap-6 rounded-xl">
                <h1 className="text-lg font-bold lg:text-2xl">
                    Lista de CLientes
                </h1>
                <TableList data={paginatedCustomers} />
            </div>
        </AppLayout>
    );
}
