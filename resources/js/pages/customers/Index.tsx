import TableList from '@/components/custom-ui/customers/TableList';
import AppLayout from '@/layouts/app-layout';
import { PaginatedCustomers } from '@/types/customers';
import { Head, usePage } from '@inertiajs/react';
import { Download } from 'lucide-react';

export default function Index() {
    const { paginatedCustomers } = usePage<{
        paginatedCustomers: PaginatedCustomers;
    }>().props;
    return (
        <AppLayout>
            <Head title="Lista de Clientes" />
            <div className="flex flex-1 flex-col gap-6 rounded-xl">
                <div className="flex items-center justify-between">
                    <h1 className="text-lg font-bold lg:text-2xl">
                        Lista de Clientes
                    </h1>
                    <button
                        onClick={() => {
                            window.location.href = '/clientes/export';
                        }}
                        className="flex cursor-pointer items-center gap-2 rounded-sm bg-blue-600 px-2.5 py-1.5 text-sm text-white hover:bg-blue-700"
                    >
                        <Download className="mr-1 h-4 w-4" />
                        Exportar Clientes
                    </button>
                </div>
                <TableList data={paginatedCustomers} />
            </div>
        </AppLayout>
    );
}
