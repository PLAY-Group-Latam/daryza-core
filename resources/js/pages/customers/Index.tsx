import TableList from '@/components/custom-ui/customers/TableList';
import AppLayout from '@/layouts/app-layout';
import { PaginatedCustomers } from '@/types/customers';
import { Head, usePage } from '@inertiajs/react';

export default function Index() {
    const { paginatedCustomers } = usePage<{
        paginatedCustomers: PaginatedCustomers;
    }>().props;
    return (
        <AppLayout>
            <Head title="Lista de Clientes" />
            <div className="flex flex-1 flex-col gap-6 rounded-xl">
                <h1 className="text-lg font-bold lg:text-2xl">
                    Lista de Clientes
                </h1>
                <TableList data={paginatedCustomers} />
            </div>
        </AppLayout>
    );
}
