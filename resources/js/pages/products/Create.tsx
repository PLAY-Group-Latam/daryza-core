import { BackButton } from '@/components/custom-ui/PageHeader';
import FormProduct from '@/components/custom-ui/products/product/FormProduct';
import AppLayout from '@/layouts/app-layout';
import { Attribute } from '@/types/products/attributes';
import { BusinessLine } from '@/types/products/businessLines';
import { CategorySelect } from '@/types/products/categories';
import { ProductRecommendable } from '@/types/products/productEdit';
import { Head, usePage } from '@inertiajs/react';

export default function Create() {
    const {
        categories,
        attributes,
        businessLines,
        recommendableSearchResults,
    } = usePage<{
        categories: CategorySelect[];
        attributes: Attribute[];
        businessLines: BusinessLine[]; // <--- Agregado
        recommendableSearchResults: ProductRecommendable[];
    }>().props;
    return (
        <AppLayout>
            <Head title="Crear Producto" />

            <div className="flex flex-1 flex-col gap-6 rounded-xl">
                <div className="flex items-center justify-between">
                    <h1 className="text-lg font-bold lg:text-2xl">
                        Crear Producto
                    </h1>
                    <div className=" flex items-center gap-4">
                        <BackButton></BackButton>
                    </div>
                </div>
                <FormProduct
                    categories={categories}
                    attributes={attributes}
                    businessLines={businessLines}
                    recommendableSearchResults={recommendableSearchResults}
                />
            </div>
        </AppLayout>
    );
}
