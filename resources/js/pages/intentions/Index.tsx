import { Paginate } from '@/interfaces/paginate';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { TableList } from '@/components/custom-ui/intention/TableList';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Intenciones de Compra',
        href: '/intencion-de-compra',
    },
];


export default function PurchaseIntentList({ paginatedIntents }: { paginatedIntents: any }) {
    
   

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Intenciones de Compra" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex justify-between">
                    <div className="text-lg font-bold lg:text-2xl">Intenciones de Compra</div>
                </div>

                {/* 2. Pasamos la data y el meta que vienen dentro de 'paginatedIntents'
                    Usamos el encadenamiento opcional (?.) para evitar errores si viene null
                */}
                <TableList 
                    data={paginatedIntents?.data ?? []} 
                    meta={paginatedIntents?.meta} 
                />
            </div>
        </AppLayout>
    );
}