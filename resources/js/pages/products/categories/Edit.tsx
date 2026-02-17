import FormCategory from '@/components/custom-ui/products/categories/FormCategory';
import AppLayout from '@/layouts/app-layout';
import { Category, CategorySelect } from '@/types/products/categories'; // Asegúrate de importar Category
import { Head, usePage } from '@inertiajs/react';

export default function Edit() {
    // Extraemos tanto la categoría a editar como el árbol para el select
    const { category, categoriesForSelect } = usePage<{
        category: Category;
        categoriesForSelect: CategorySelect[];
    }>().props;
    console.log(category);
    return (
        <AppLayout>
            <Head title={`Editar Categoría: ${category.name}`} />

            <div className="flex flex-1 flex-col gap-6 rounded-xl">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-bold lg:text-2xl">
                            Editar Categoría
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Modificando:{' '}
                            <span className="font-medium text-foreground">
                                {category.name}
                            </span>
                        </p>
                    </div>
                </div>

                {/* Pasamos la categoría existente para activar el modo edición en el formulario */}
                <FormCategory
                    category={category}
                    parentCategories={categoriesForSelect}
                />
            </div>
        </AppLayout>
    );
}
