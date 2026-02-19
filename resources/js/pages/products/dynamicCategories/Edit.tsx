import CreateDynamicCategoryForm from '@/components/custom-ui/products/dynamicCategories/CreateDynamicCategoryForm';
import AppLayout from '@/layouts/app-layout';
import { DynamicCategory } from '@/types/products/dynamicCategories';
import { SearchResult } from '@/types/products/packs';
import { PageProps } from '@inertiajs/core';
import { Head, usePage } from '@inertiajs/react';

interface EditProps extends PageProps {
    category: DynamicCategory; // CAMBIO: Debe ser 'category' porque así lo nombras en el Controller
    searchResults?: SearchResult[];
    filters?: { q?: string };
}

export default function Edit() {
    const { category, searchResults, filters } = usePage<EditProps>().props;

    return (
        <AppLayout>
            <Head title={`Editar Categoría: ${category.name}`} />
            <div>
                <CreateDynamicCategoryForm
                    category={category} // Pasamos el objeto completo
                    searchResults={searchResults || []}
                    filters={filters}
                />
            </div>
        </AppLayout>
    );
}
