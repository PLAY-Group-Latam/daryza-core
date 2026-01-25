// import { ModalFormCategories } from '@/components/custom-ui/products/categories/ModalFormCategories';
// import TableList from '@/components/custom-ui/products/categories/TableList';
// import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
// import { CategorySelect, PaginatedProductCategories } from '@/types/products';
import { Head } from '@inertiajs/react';
// import { Plus } from 'lucide-react';

export default function Create() {
    // const { types } = usePage<{
    //     types: AttributeTypeOption[];
    // }>().props;
    return (
        <AppLayout>
            <Head title="Lista de CLientes" />
            <div className="flex flex-1 flex-col gap-6 rounded-xl">
                <div className="flex items-center justify-between">
                    <h1 className="text-lg font-bold lg:text-2xl">
                        Crear Blog
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
                </div>

                {/* <FormCreate types={types} /> */}
            </div>
        </AppLayout>
    );
}
