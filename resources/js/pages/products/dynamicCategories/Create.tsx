import { BackButton } from '@/components/custom-ui/PageHeader';
import CreateDynamicCategoryForm from '@/components/custom-ui/products/dynamicCategories/CreateDynamicCategoryForm';
import AppLayout from '@/layouts/app-layout';
import { VariantSearchResult } from '@/types/products/search';
import { PageProps } from '@inertiajs/core';
import { Head, usePage } from '@inertiajs/react';
interface CreateProps extends PageProps {
    searchResults?: VariantSearchResult[];
    filters?: { q?: string };
}

export default function Create() {
    const { searchResults, filters } = usePage<CreateProps>().props;

    return (
        <AppLayout>
            <div className="mb-6 flex items-end gap-4">
                <BackButton></BackButton>
            </div>
            <Head title="Crear Categoría Dinámica" />
            <div>
                <CreateDynamicCategoryForm
                    searchResults={searchResults || []}
                    filters={filters} // Cambiado para coincidir con la interfaz del hijo
                />
            </div>
        </AppLayout>
    );
}
