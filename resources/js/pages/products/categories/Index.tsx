import TableList from '@/components/custom-ui/products/categories/TableList';
import AppLayout from '@/layouts/app-layout';
import { PaginatedProductCategories } from '@/types/products';
import { Head, usePage } from '@inertiajs/react';

export default function Index() {
    const { paginatedCategories } = usePage<{
        paginatedCategories: PaginatedProductCategories;
    }>().props;
    return (
        <AppLayout>
            <Head title="Lista de CLientes" />
            <div className="flex flex-1 flex-col gap-6 rounded-xl">
                <h1 className="text-lg font-bold lg:text-2xl">
                    Lista de Categorías
                </h1>
                <TableList data={paginatedCategories} />
            </div>
        </AppLayout>
    );
}
