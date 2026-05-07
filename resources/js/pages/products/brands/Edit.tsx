import BrandForm from '@/components/custom-ui/products/brands/BrandForm';
import AppLayout from '@/layouts/app-layout';
import { Brand } from '@/types/products/brands';
import { Head, usePage } from '@inertiajs/react';
// import BrandForm from './Partials/BrandForm';
// import { Brand } from '@/types/products';
import { BackButton } from '@/components/custom-ui/PageHeader';

export default function Edit() {
    const { brand } = usePage<{
        brand: Brand;
    }>().props;
    return (
        <AppLayout>
            <Head title="Editar Marca" />
             <div className="mb-6 flex items-end gap-4">
                <BackButton></BackButton>
            </div>
            <div className="p-6">
                <h1 className="mb-6 text-2xl font-bold">
                    Editar Marca
                </h1>
                <BrandForm brand={brand} />
            </div>
        </AppLayout>
    );
}
