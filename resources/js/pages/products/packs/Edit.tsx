/* eslint-disable @typescript-eslint/no-explicit-any */
import EditPackForm from '@/components/custom-ui/products/packs/EditPackForm';
import AppLayout from '@/layouts/app-layout';
import { SearchResult } from '@/types/products/packs';
import { PageProps } from '@inertiajs/core';
import { Head, usePage } from '@inertiajs/react';

interface EditProps extends PageProps {
    pack: any; // El modelo del Pack con sus datos básicos
    searchResults?: SearchResult[]; // Resultados de búsqueda formateados como items
    filters?: { q?: string };
}

export default function Edit() {
    const { pack, searchResults, filters } = usePage<EditProps>().props;

    // console.log(searchResults);
    return (
        <AppLayout>
            <Head title={`Editar Pack: ${pack.name}`} />
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
