import FormProduct from '@/components/custom-ui/products/product/FormProduct';
import AppLayout from '@/layouts/app-layout';
import { Attribute } from '@/types/products/attributes';
import { BusinessLine } from '@/types/products/businessLines';
import { CategorySelect } from '@/types/products/categories';
import { ProductEdit, ProductRecommendable } from '@/types/products/productEdit';
import { Head, Link, usePage } from '@inertiajs/react';
import { BackButton } from '@/components/custom-ui/PageHeader';

export default function Edit() {
    const { categories, attributes, product, businessLines, recommendableSearchResults } =
        usePage<{
        product: ProductEdit;
        categories: CategorySelect[];
        attributes: Attribute[];
        businessLines: BusinessLine[];
        recommendableSearchResults: ProductRecommendable[];
    }>().props;
    return (
        <AppLayout>
            <Head title="Editar Producto" />

            <div className="flex flex-1 flex-col gap-6 rounded-xl">
                <div className="flex items-center justify-between">
                    <h1 className="text-lg font-bold lg:text-2xl">
                        Editar Producto
                    </h1>

                    <div className=" flex items-center gap-4">
                <BackButton></BackButton>
            </div>
                </div>
                <FormProduct
                    categories={categories}
                    attributes={attributes}
                    product={product}
                    businessLines={businessLines}
                    recommendableSearchResults={recommendableSearchResults}
                />
            </div>
        </AppLayout>
    );
}
