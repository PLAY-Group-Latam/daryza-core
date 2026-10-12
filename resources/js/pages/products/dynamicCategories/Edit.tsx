import CreateDynamicCategoryForm from '@/components/custom-ui/products/dynamicCategories/CreateDynamicCategoryForm';
import AppLayout from '@/layouts/app-layout';
import { DynamicCategory } from '@/types/products/dynamicCategories';
import { VariantSearchResult } from '@/types/products/search';
import { PageProps } from '@inertiajs/core';
import { Head, usePage } from '@inertiajs/react';
import { BackButton } from '@/components/custom-ui/PageHeader';

interface EditProps extends PageProps {
    category: DynamicCategory; // CAMBIO: Debe ser 'category' porque así lo nombras en el Controller
    searchResults?: VariantSearchResult[];
    filters?: { q?: string };
    removedItemsCount?: number;
}

export default function Edit() {
    const { category, searchResults, filters, removedItemsCount = 0 } =
        usePage<EditProps>().props;

    return (
        <AppLayout>
             <div className="mb-6 flex items-end gap-4">
                <BackButton></BackButton>
            </div>
            <Head title={`Editar Categoría: ${category.name}`} />
            {removedItemsCount > 0 && (
                <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    {removedItemsCount === 1
                        ? 'Un producto de esta categoría fue eliminado y ya no aparece. Revisa los items y guarda la categoría.'
                        : `${removedItemsCount} productos de esta categoría fueron eliminados y ya no aparecen. Revisa los items y guarda la categoría.`}
                </div>
            )}
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