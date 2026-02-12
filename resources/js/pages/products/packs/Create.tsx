/* eslint-disable @typescript-eslint/no-explicit-any */
// import { ModalFormCategories } from '@/components/custom-ui/products/categories/ModalFormCategories';
// import TableList from '@/components/custom-ui/products/categories/TableList';
// import { Button } from '@/components/ui/button';
import FormPack from '@/components/custom-ui/products/packs/FormPack';
import AppLayout from '@/layouts/app-layout';
import { PageProps } from '@inertiajs/core';
// import { CategorySelect, PaginatedProductCategories } from '@/types/products';
import { Head, usePage } from '@inertiajs/react';
// import { Plus } from 'lucide-react';

interface CreateProps extends PageProps {
    searchResults?: any[];
    filters?: { q?: string };
}
export default function Create() {
    const { searchResults, filters } = usePage<CreateProps>().props;

    return (
        <AppLayout>
            <Head title="Crear Pack de Productos" />
            <div className="flex flex-1 flex-col gap-6 rounded-xl">
                <FormPack
                    products={[]}
                    filters={filters}
                    searchResults={searchResults || []}
                />
            </div>
        </AppLayout>
    );
}
