/* eslint-disable @typescript-eslint/no-explicit-any */
import { TableList } from '@/components/custom-ui/seos/table-list';
import AppLayout from '@/layouts/app-layout';
import { Seo } from '@/types/seo/Seo';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';


export default function SeoIndex({ paginatedSeo, filters }: { paginatedSeo: Paginated<Seo>; filters: any }) {
    return (
        <AppLayout>
            <Head title="SEO de Páginas" />
            <div className="p-4">
                <div className="text-lg font-bold lg:text-2xl mb-4">Lista de SEO</div>
                {/* Ahora pasamos la data paginada directamente */}
                <TableList data={paginatedSeo} filters={filters} />
            </div>
        </AppLayout>
    );
}