/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

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
    });

    // Solo corre en modo edición — mapea el producto del backend al shape del form
    useEffect(() => {
        if (product) methods.reset(mapProductToForm(product));
    }, [product]);

    const onSubmit = (data: ProductFormValues) => {
        const url = isEdit
            ? products.items.update(product!.id).url
            : products.items.store().url;
        const formData = buildFormData(data, isEdit);
        // Debug — verificar que el FormData tiene los archivos
        data.variants.forEach((v, i) => {
            console.log(
                `variant[${i}] media:`,
                v.media.length,
                v.media.map((m) =>
                    m instanceof File
                        ? `FILE:${(m as File).name}`
                        : `MEDIA:${(m as any).file_path}`,
                ),
            );
        });
        router.post(url, formData, {
            preserveScroll: true,
            forceFormData: true,
        });
        console.log('productoenviado', data);
    };

    const variantAttributes = attributes.filter((a) => a.is_variant);
    const specificationAttributes = attributes.filter((a) => !a.is_variant);
    const onError = (errors: any) => {
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
