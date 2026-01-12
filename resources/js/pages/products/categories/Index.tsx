import { ModalFormCategories } from '@/components/custom-ui/products/categories/ModalFormCategories';
import TableList from '@/components/custom-ui/products/categories/TableList';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { PaginatedProductCategories } from '@/types/products';
import { Head, usePage } from '@inertiajs/react';
import { Plus } from 'lucide-react';

export default function Index() {
    const { paginatedProductCategories } = usePage<{
        paginatedProductCategories: PaginatedProductCategories;
    }>().props;

    console.log(paginatedProductCategories.data);
    return (
        <AppLayout>
            <Head title="Lista de CLientes" />
            <div className="flex flex-1 flex-col gap-6 rounded-xl">
                <div className="flex items-center justify-between">
                    <h1 className="text-lg font-bold lg:text-2xl">
                        Lista de Categorías
                    </h1>
                    <ModalFormCategories
                        parentCategories={paginatedProductCategories.data} // <--- aquí
                        trigger={
                            <Button variant="default">
                                <Plus className="mr-1 h-4 w-4" /> Crear
                                Categoria
                            </Button>
                        }
                    />
                </div>

                <TableList data={paginatedProductCategories} />
            </div>
        </AppLayout>
    );
}
