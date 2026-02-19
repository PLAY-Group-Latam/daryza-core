import FormProduct from '@/components/custom-ui/products/items-table/create-form/FormProduct';
import AppLayout from '@/layouts/app-layout';
import { Attribute } from '@/types/products/attributes';
import { BusinessLine } from '@/types/products/businessLines';
import { CategorySelect } from '@/types/products/categories';
import { ProductEdit } from '@/types/products/product';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Edit() {
    const { categories, attributes, product, businessLines } = usePage<{
        product: ProductEdit;
        categories: CategorySelect[];
        attributes: Attribute[];
        businessLines: BusinessLine[];
    }>().props;
    console.log('producto individual:', product);
    return (
        <AppLayout>
            <Head title="Editar Producto" />

            <div className="flex flex-1 flex-col gap-6 rounded-xl">
                <div className="flex items-center justify-between">
                    <h1 className="text-lg font-bold lg:text-2xl">
                        Editar Producto
                    </h1>

                    <Link
                        href="/productos/items"
                        className="text-sm text-muted-foreground hover:underline"
                    >
                        ← Volver a la lista
                    </Link>
                </div>
                <FormProduct
                    categories={categories}
                    attributes={attributes}
                    product={product}
                    businessLines={businessLines}
                />
            </div>
        </AppLayout>
    );
}
