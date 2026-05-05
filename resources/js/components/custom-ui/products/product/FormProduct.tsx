'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import products from '@/routes/products';
import { Attribute } from '@/types/products/attributes';
import { BusinessLine } from '@/types/products/businessLines';
import { CategorySelect } from '@/types/products/categories';

import { mapProductToForm } from './mappers';
import { defaultValues, ProductFormValues, ProductSchema } from './schema';

import {
    ProductEdit,
    ProductRecommendable,
} from '@/types/products/productEdit';
import type { FieldErrors, Resolver } from 'react-hook-form';
import { GeneralSection } from './sections/GeneralSections';
import { SidebarSection } from './sections/SidebarSections';
import { TechnicalSheetsForm } from './Technicalsheetsform';
import { buildFormData } from './variants/utils/buildFormData';
import { VariantForm } from './variants/VariantForm';

interface Props {
    categories: CategorySelect[];
    attributes: Attribute[];
    businessLines: BusinessLine[];
    brands?: { id: string; name: string }[];
    recommendableSearchResults: ProductRecommendable[];
    product?: ProductEdit; // undefined = crear, definido = editar
}

export default function FormProduct({
    categories,
    attributes,
    businessLines,
    brands = [],
    recommendableSearchResults,
    product,
}: Props) {
    const isEdit = Boolean(product);
    const [showSubmitHelp, setShowSubmitHelp] = useState(false);

    const methods = useForm<ProductFormValues>({
        resolver: zodResolver(ProductSchema) as Resolver<ProductFormValues>,
        defaultValues,
        mode: 'onBlur',
        reValidateMode: 'onChange',
        criteriaMode: 'all',
        shouldFocusError: true,
    });
    const { reset } = methods;

    // Solo corre en modo edición — mapea el producto del backend al shape del form
    useEffect(() => {
        if (product) reset(mapProductToForm(product));
    }, [product, reset]);

    const onSubmit = (data: ProductFormValues) => {
        setShowSubmitHelp(false);
        const url = isEdit
            ? products.items.update(product!.id).url
            : products.items.store().url;
        const formData = buildFormData(data, isEdit);
        router.post(url, formData, {
            preserveScroll: true,
            forceFormData: true,
        });
    };

    const variantAttributes = attributes.filter((a) => a.is_variant);
    const specificationAttributes = attributes.filter((a) => !a.is_variant);

    const onError = (errors: FieldErrors<ProductFormValues>) => {
        console.error('Errores de validacion del formulario de producto:', errors);
        setShowSubmitHelp(true);
    };
    return (
        <FormProvider {...methods}>
            <form
                onSubmit={methods.handleSubmit(onSubmit, onError)}
                className="pb-10"
            >
                {showSubmitHelp && (
                    <p className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                        No se pudo guardar. Revisa los campos marcados en rojo
                        (variantes, categorías y SEO).
                    </p>
                )}
                <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_0.5fr]">
                    {/* Columna principal */}
                    <div className="space-y-10">
                        <GeneralSection />

                        <VariantForm
                            variantAttributes={variantAttributes}
                            specificationAttributes={specificationAttributes}
                        />

                        <TechnicalSheetsForm />
                    </div>

                    {/* Sidebar */}
                    <SidebarSection
                        categories={categories}
                        businessLines={businessLines}
                        brands={brands}
                        initialRecommendedProducts={
                            product?.recommended_products ?? []
                        }
                        recommendableSearchResults={recommendableSearchResults}
                        recommendedSearchUrl={
                            isEdit
                                ? products.items.edit(product!.id).url
                                : products.items.create.url()
                        }
                        isSubmitting={methods.formState.isSubmitting}
                        isEdit={isEdit}
                    />
                </div>
            </form>
        </FormProvider>
    );
}
