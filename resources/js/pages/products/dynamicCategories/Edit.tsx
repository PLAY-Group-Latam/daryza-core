import DynamicCategoriesForm from '@/components/custom-ui/products/dynamicCategories/DynamicCategoriesForm';
import AppLayout from '@/layouts/app-layout';
import {
    DynamicCategory,
    SelectableVariant,
} from '@/types/products/dynamicCategories';
import { PageProps } from '@inertiajs/core';
import { Head, usePage } from '@inertiajs/react';

interface EditProps extends PageProps {
    dynamicCategory: DynamicCategory; // El modelo DynamicCategory desde Laravel
    selectedVariants: SelectableVariant[]; // Las variantes que ya están asociadas
    searchResults?: SelectableVariant[];
    filters?: { q?: string };
}

export default function Edit() {
    const { dynamicCategory, selectedVariants, searchResults, filters } =
        usePage<EditProps>().props;

    console.log('Selected Variants:', selectedVariants);
    return (
        <AppLayout>
            <Head title={`Editar Categoría: ${dynamicCategory.name}`} />
            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-slate-900">
                        Editar Dinámica de negocio
                    </h1>
                    <p className="text-sm text-slate-500">
                        Gestiona los productos y la vigencia de la categoría.
                    </p>
                </div>

                <DynamicCategoriesForm
                    dynamicCategory={dynamicCategory}
                    selectedVariants={selectedVariants || []}
                    searchResults={searchResults || []}
                    filters={filters}
                />
            </div>
        </AppLayout>
    );
}
