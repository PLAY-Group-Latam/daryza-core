/* eslint-disable @typescript-eslint/no-explicit-any */
import FormPack from '@/components/custom-ui/products/packs/FormPack';
import AppLayout from '@/layouts/app-layout';
import { PageProps } from '@inertiajs/core';
import { Head, usePage } from '@inertiajs/react';

interface EditProps extends PageProps {
    pack: any; // El modelo del Pack con sus datos básicos
    searchResults?: any[]; // Resultados de búsqueda formateados como items
    filters?: { q?: string };
}

export default function Edit() {
    const { pack, searchResults, filters } = usePage<EditProps>().props;

    // Nota: pack.items ya viene del controlador con la cantidad y datos de la variante
    return (
        <AppLayout>
            <Head title={`Editar Pack: ${pack.name}`} />
            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-slate-900">
                        Editar Pack de Productos
                    </h1>
                    <p className="text-sm text-slate-500">
                        Modifica los productos, cantidades y precios
                        promocionales del pack.
                    </p>
                </div>

                <FormPack
                    pack={pack}
                    searchResults={searchResults || []}
                    filters={filters}
                />
            </div>
        </AppLayout>
    );
}
