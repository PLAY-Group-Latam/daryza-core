import TableList from '@/components/custom-ui/products/categories/TableList';
import AppLayout from '@/layouts/app-layout';
import { PaginatedProductCategories } from '@/types/products/categories';
import { Head, Link, usePage } from '@inertiajs/react';
import { Plus } from 'lucide-react';

export default function Index() {
    const { paginatedCategories } = usePage<{
        paginatedCategories: PaginatedProductCategories;
    }>().props;

    return (
        <AppLayout>
            <Head title="Lista de CLientes" />
            <div className="flex flex-1 flex-col gap-6 rounded-xl">
                <div className="flex items-center justify-between">
                    <h1 className="text-lg font-bold lg:text-2xl">
                        Lista de Categorías
                    </h1>
                    {/* <ModalFormCategories
                        parentCategories={categoriesForSelect}
                        trigger={
                            <Button variant="default">
                                <Plus className="mr-1 h-4 w-4" /> Crear
                                Categoria
                            </Button>
                        }
                    /> */}
                    <Link
                        href="/productos/categorias/create"
                        className="flex items-center gap-2 rounded-sm bg-gray-900 px-2.5 py-1.5 text-sm text-white"
                    >
                        <Plus className="mr-1 h-4 w-4" />
                        Crear Categoría
                    </Link>
                </div>

                <TableList data={paginatedCategories} />
            </div>
        </AppLayout>
    );
}
