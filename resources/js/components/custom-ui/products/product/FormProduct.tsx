'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import { useEffect } from 'react';
import { FieldErrors, FormProvider, useForm } from 'react-hook-form';

import products from '@/routes/products';
import { Attribute } from '@/types/products/attributes';
import { BusinessLine } from '@/types/products/businessLines';
import { CategorySelect } from '@/types/products/categories';

import { mapProductToForm } from './mappers';
import { defaultValues, ProductFormValues, ProductSchema } from './schema';

import { ProductEdit } from '@/types/products/productEdit';
import type { Resolver } from 'react-hook-form';
import { GeneralSection } from './sections/GeneralSections';
import { SidebarSection } from './sections/SidebarSections';
import { TechnicalSheetsForm } from './Technicalsheetsform';
import { buildFormData } from './variants/utils/buildFormData';
import { VariantForm } from './variants/VariantForm';

interface Props {
    categories: CategorySelect[];
    attributes: Attribute[];
    businessLines: BusinessLine[];
    product?: ProductEdit; // undefined = crear, definido = editar
}

export default function FormProduct({
    categories,
    attributes,
    businessLines,
    product,
}: Props) {
    const isEdit = Boolean(product);

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
        console.log('ERRORES:', errors);
    };

    return (
        <FormProvider {...methods}>
            <form
                onSubmit={methods.handleSubmit(onSubmit, onError)}
                className="pb-10"
            >
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
                        isSubmitting={methods.formState.isSubmitting}
                        isEdit={isEdit}
                    />
                </div>
            </form>
        </FormProvider>
    );
}
