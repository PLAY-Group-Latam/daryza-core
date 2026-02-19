import CreatePackForm from '@/components/custom-ui/products/packs/CreatePackForm';
import AppLayout from '@/layouts/app-layout';
import { SearchResult } from '@/types/products/packs';
import { Head, usePage } from '@inertiajs/react';

import { PageProps } from '@inertiajs/core';

interface CreateProps extends PageProps {
    searchResults?: SearchResult[];
    filters?: { q?: string };
}
export default function Create() {
    const { searchResults, filters } = usePage<CreateProps>().props;
    return (
        <AppLayout>
            <Head title="Crear Pack de Productos" />
            <div className="flex flex-1 flex-col gap-6 rounded-xl">
                <CreatePackForm
                    searchResults={searchResults || []}
                    filters={filters}
                />
            </div>
        </AppLayout>
    );
}
