import BusinessLineForm from '@/components/custom-ui/products/businessLines/BusinessLineForm';
import AppLayout from '@/layouts/app-layout';
import { BusinessLine } from '@/types/products/businessLines';
import { Head, usePage } from '@inertiajs/react';
// import BusinessLineForm from './Partials/BusinessLineForm';
// import { BusinessLine } from '@/types/products';

export default function Edit() {
    const { businessLine } = usePage<{
        businessLine: BusinessLine;
    }>().props;
    return (
        <AppLayout>
            <Head title="Editar Línea de Negocio" />
            <div className="p-6">
                <h1 className="mb-6 text-2xl font-bold">
                    Editar Línea de Negocio
                </h1>
                <BusinessLineForm businessLine={businessLine} />
            </div>
        </AppLayout>
    );
}
