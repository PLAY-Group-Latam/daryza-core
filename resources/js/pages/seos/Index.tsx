/* eslint-disable @typescript-eslint/no-explicit-any */
import { TableList } from '@/components/custom-ui/seos/table-list';
import AppLayout from '@/layouts/app-layout';
import { Seo } from '@/types/seo/Seo';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';


export default function SeoIndex({ seoItems, meta }: { seoItems: Seo[]; meta: any }) {
    return (
        <AppLayout >
            <Head title="SEO de Páginas" />
            <div className="p-4">
                <div className="text-lg font-bold lg:text-2xl mb-4">Configuración de SEO</div>
                <TableList data={seoItems} meta={meta} />
            </div>
        </AppLayout>
    );
}