import FormCategory from '@/components/custom-ui/products/categories/FormCategory';
import AppLayout from '@/layouts/app-layout';
import { CategorySelect } from '@/types/products/categories';
import { Head, usePage } from '@inertiajs/react';

export default function Create() {
    // Obtenemos las categorías para el select de "Padre"
    // Recuerda que en el controlador enviamos 'categoriesForSelect'
    const { categoriesForSelect } = usePage<{
        categoriesForSelect: CategorySelect[];
    }>().props;

    return (
        <AppLayout>
            <Head title="Crear Categoría" />

            <div className="flex flex-1 flex-col gap-6 rounded-xl">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-bold lg:text-2xl">
                            Crear Nueva Categoría
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Define una categoría principal o una subcategoría.
                        </p>
                    </div>
                </div>

                {/* Pasamos las categorías al formulario para el select de Parent ID */}
                <FormCategory parentCategories={categoriesForSelect} />
            </div>
        </AppLayout>
    );
}
