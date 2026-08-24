import TableList from '@/components/custom-ui/products/brands/TableList';
import AppLayout from '@/layouts/app-layout';
import { PaginatedBrands } from '@/types/products/brands';
import { Head, Link, usePage } from '@inertiajs/react';
import { Plus } from 'lucide-react';

export default function Index() {
    // Solo recibimos marcas paginadas, ya que no hay jerarquía
    const { paginatedBrands } = usePage<{
        paginatedBrands: PaginatedBrands;
    }>().props;

    return (
        <AppLayout>
            <Head title="Lista de Marcas" />
            <div className="flex flex-1 flex-col gap-6 rounded-xl">
                <div className="flex items-center justify-between">
                    <h1 className="text-lg font-bold lg:text-2xl">
                        Lista de Marcas
                    </h1>
                    <Link
                        href="/productos/marcas/create"
                        className="flex items-center gap-2 rounded-sm bg-gray-900 px-2.5 py-1.5 text-sm text-white"
                    >
                        <Plus className="mr-1 h-4 w-4" />
                        Crear Marca
                    </Link>
                </div>

                <TableList data={paginatedBrands} />
            </div>
        </AppLayout>
    );
}
