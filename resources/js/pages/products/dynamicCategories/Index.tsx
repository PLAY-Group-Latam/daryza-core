import TableList from '@/components/custom-ui/products/dynamicCategories/TableList';
import AppLayout from '@/layouts/app-layout';
import { PaginatedDynamicCategories } from '@/types/products/dynamicCategories';
import { Head, Link, usePage } from '@inertiajs/react';
import { Plus } from 'lucide-react';

export default function Index() {
    const { paginatedCategories } = usePage<{
        paginatedCategories: PaginatedDynamicCategories;
    }>().props;

    return (
        <AppLayout>
            <Head title="Líneas de Negocio" />
            <div className="flex flex-1 flex-col gap-6 rounded-xl">
                <div className="flex items-center justify-between">
                    <h1 className="text-lg font-bold lg:text-2xl">
                        Dinámicas de Negocio
                    </h1>
                    <Link
                        href="/productos/categorias-dinamicas/create"
                        className="flex items-center gap-2 rounded-sm bg-gray-900 px-2.5 py-1.5 text-sm text-white"
                    >
                        <Plus className="mr-1 h-4 w-4" />
                        Crear Dinámica de Negocio
                    </Link>
                </div>

                <TableList data={paginatedCategories} />
            </div>
        </AppLayout>
    );
}
