/* eslint-disable @typescript-eslint/no-explicit-any */
import EditPackForm from '@/components/custom-ui/products/packs/EditPackForm';
import AppLayout from '@/layouts/app-layout';
import { VariantSearchResult } from '@/types/products/search';
import { PageProps } from '@inertiajs/core';
import { Head, usePage } from '@inertiajs/react';
import { BackButton } from '@/components/custom-ui/PageHeader';
interface EditProps extends PageProps {
    pack: any; // El modelo del Pack con sus datos básicos
    searchResults?: VariantSearchResult[]; // Resultados de búsqueda formateados como items
    filters?: { q?: string };
    removedItemsCount?: number;
}

export default function Edit() {
    const { pack, searchResults, filters, removedItemsCount = 0 } =
        usePage<EditProps>().props;

    // console.log(searchResults);
    return (
        <AppLayout>
            <Head title={`Editar Pack: ${pack.name}`} />
             <div className="mb-6 flex items-end gap-4">
                <BackButton></BackButton>
            </div>
            {removedItemsCount > 0 && (
                <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    {removedItemsCount === 1
                        ? 'Un producto de este pack fue eliminado y ya no aparece. Revisa los items y guarda el pack.'
                        : `${removedItemsCount} productos de este pack fueron eliminados y ya no aparecen. Revisa los items y guarda el pack.`}
                </div>
            )}
            <div>
                <EditPackForm
                    pack={pack}
                    searchResults={searchResults || []}
                    filters={filters}
                />
            </div>
        </AppLayout>
    );
}