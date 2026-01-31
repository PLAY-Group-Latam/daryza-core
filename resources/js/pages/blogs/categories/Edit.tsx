// import { ModalFormCategories } from '@/components/custom-ui/products/categories/ModalFormCategories';
// import TableList from '@/components/custom-ui/products/categories/TableList';
// import { Button } from '@/components/ui/button';
import CategoryForm from '@/components/custom-ui/blogs/categories/CategoryForm';
import AppLayout from '@/layouts/app-layout';
import { BlogCategory } from '@/types/blogs';
// import { CategorySelect, PaginatedProductCategories } from '@/types/products';
import { Head, usePage } from '@inertiajs/react';
// import { Plus } from 'lucide-react';

export default function Edit() {
    const { category } = usePage<{ category: BlogCategory }>().props;
    // console.log('category', category);
    return (
        <AppLayout>
            <Head title="Lista de CLientes" />
            <div className="flex flex-1 flex-col gap-6 rounded-xl">
                <div className="flex items-center justify-between">
                    <h1 className="text-lg font-bold lg:text-2xl">
                        Editar Categoría de Blog
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
                <CategoryForm category={category} />
            </div>
        </AppLayout>
    );
}
