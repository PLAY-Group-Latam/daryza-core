import FormProduct from '@/components/custom-ui/products/items-table/create-form/FormProduct';
import AppLayout from '@/layouts/app-layout';
import { CategorySelect } from '@/types/products';
import { Attribute } from '@/types/products/attributes';
import { BusinessLine } from '@/types/products/businessLines';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Create() {
    const { categories, attributes, businessLines } = usePage<{
        categories: CategorySelect[];
        attributes: Attribute[];
        businessLines: BusinessLine[]; // <--- Agregado
    }>().props;
    // console.log('atributossss:', attributes);
    console.log('categories', categories);
    return (
        <AppLayout>
            <Head title="Crear Producto" />

            <div className="flex flex-1 flex-col gap-6 rounded-xl">
                <div className="flex items-center justify-between">
                    <h1 className="text-lg font-bold lg:text-2xl">
                        Crear Producto
                    </h1>

                    <Link
                        href="/productos/items"
                        className="text-sm text-muted-foreground hover:underline"
                    >
                        ← Volver a la lista
                    </Link>
                </div>
                <FormProduct categories={categories} attributes={attributes} businessLines={businessLines}/>
            </div>
        </AppLayout>
    );
}
