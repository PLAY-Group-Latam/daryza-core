import CreateDynamicCategoryForm from '@/components/custom-ui/products/dynamicCategories/CreateDynamicCategoryForm';
import AppLayout from '@/layouts/app-layout';
import { SearchResult } from '@/types/products/packs';
import { PageProps } from '@inertiajs/core';
import { Head, usePage } from '@inertiajs/react';

interface CreateProps extends PageProps {
    searchResults?: SearchResult[];
    filters?: { q?: string };
}

export default function Create() {
    const { searchResults, filters } = usePage<CreateProps>().props;

    return (
        <AppLayout>
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
