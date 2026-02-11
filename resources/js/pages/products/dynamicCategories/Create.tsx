/* eslint-disable @typescript-eslint/no-explicit-any */
import DynamicCategoriesForm from '@/components/custom-ui/products/dynamicCategories/DynamicCategoriesForm';
import AppLayout from '@/layouts/app-layout';
import { PageProps } from '@inertiajs/core';
import { Head, usePage } from '@inertiajs/react';

interface CreateProps extends PageProps {
    searchResults?: any[];
    filters?: { q?: string };
}

export default function Create() {
    const { searchResults, filters } = usePage<CreateProps>().props;

    return (
        <AppLayout>
            <Head title="Crear Línea de Negocio" />
            <div className="p-6">
                <h1 className="mb-6 text-2xl font-bold">
                    Nueva Categoría Especial
                </h1>

                <DynamicCategoriesForm
                    searchResults={searchResults || []}
                    filters={filters} // Cambiado para coincidir con la interfaz del hijo
                />
            </div>
        </AppLayout>
    );
}
