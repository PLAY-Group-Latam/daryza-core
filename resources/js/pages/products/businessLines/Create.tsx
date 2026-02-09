import BusinessLineForm from '@/components/custom-ui/products/businessLines/BusinessLineForm';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

export default function Create() {
    return (
        <AppLayout>
            <Head title="Crear Línea de Negocio" />
            <div className="p-6">
                <h1 className="mb-6 text-2xl font-bold">
                    Nueva Línea de Negocio
                </h1>
                <BusinessLineForm />
            </div>
        </AppLayout>
    );
}
