// import { ModalFormCategories } from '@/components/custom-ui/products/categories/ModalFormCategories';
// import TableList from '@/components/custom-ui/products/categories/TableList';
// import { Button } from '@/components/ui/button';
import TableList from '@/components/custom-ui/products/packs/TableList';
import AppLayout from '@/layouts/app-layout';
import { PaginatedPacks } from '@/types/products/packs';
// import { CategorySelect, PaginatedProductCategories } from '@/types/products';
import { Head, Link, usePage } from '@inertiajs/react';
import { Plus } from 'lucide-react';
// import { Plus } from 'lucide-react';

export default function Index() {
    const { paginatedPacks } = usePage<{
        paginatedPacks: PaginatedPacks;
    }>().props;

    // console.log(paginatedPacks);
    return (
        <AppLayout>
            <Head title="Lista de Packs" />
            <div className="flex flex-1 flex-col gap-6 rounded-xl">
                <div className="flex items-center justify-between">
                    <h1 className="text-lg font-bold lg:text-2xl">
                        Lista de Packs
                    </h1>
                    <Link
                        href="/productos/packs/create"
                        className="flex items-center gap-2 rounded-sm bg-gray-900 px-2.5 py-1.5 text-sm text-white"
                    >
                        <Plus className="mr-1 h-4 w-4" />
                        Crear Pack
                    </Link>
                </div>

                <TableList data={paginatedPacks} />
            </div>
        </AppLayout>
    );
}
