/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/incompatible-library */
'use client';

import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import products from '@/routes/products';
import { Attribute, CategorySelect } from '@/types/products';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import { Controller, FormProvider, Resolver, useForm } from 'react-hook-form';
import { z } from 'zod';
import { SlugInput } from '../../slug-text';
import { CategoryTreeSelect } from '../categories/CategoryTreeSelect';
import { SpecificationsAttributes } from './create-form/SpecificationsFormAttributes';
import { VariantForm } from './create-form/VariantForm';

const VariantAttributeSchema = z.object({
    attribute_id: z.number(),
    attribute_value_id: z.number().nullable().optional(), // para select
    value: z.union([z.string(), z.boolean(), z.number()]).optional(), // para text, boolean, number
});

const VariantSchema = z.object({
    sku: z.string().min(1),
    price: z.coerce.number(),
    promo_price: z.coerce.number().optional(),
    is_on_promo: z.boolean(),
    promo_start_at: z.string().nullable().optional(),
    promo_end_at: z.string().nullable().optional(),
    stock: z.coerce.number(),
    attributes: z.array(VariantAttributeSchema),
    media: z.array(z.any()),
    is_active: z.boolean().default(true).optional(),
});
const SpecificationAttributeSchema = z.object({
    attribute_id: z.number(),
    value: z
        .union([z.string(), z.boolean(), z.number()])
        .refine((val) => val !== undefined && val !== null && val !== '', {
            message: 'El valor de la especificación es obligatorio',
        }),
});

const ProductSchema = z.object({
    name: z.string().min(1, 'El nombre es obligatorio'),
    slug: z.string().min(1, 'El slug es obligatorio'),
    category_id: z.string().nullable(),
    brief_description: z.string().optional(),
    description: z.string().optional(),
    is_active: z.boolean(),

    metadata: z.object({
        meta_title: z.string().optional(),
        meta_description: z.string().optional(),
        canonical_url: z.string().optional(),
        og_title: z.string().optional(),
        og_description: z.string().optional(),
        noindex: z.boolean(),
        nofollow: z.boolean(),
    }),
    variant_attribute_ids: z.array(z.number()),
    variants: z.array(VariantSchema),
    media: z.array(z.any()),
    specifications: z.array(SpecificationAttributeSchema),
});

export type ProductFormValues = z.infer<typeof ProductSchema>;

export default function FormProduct({
    categories,
    attributes,
}: {
    categories: CategorySelect[];
    attributes: Attribute[];
}) {
    const methods = useForm<ProductFormValues>({
        resolver: zodResolver(ProductSchema) as Resolver<ProductFormValues>,
        defaultValues: {
            name: '',
            slug: '',
            category_id: null,
            brief_description: '',
            description: '',
            is_active: true,
            metadata: {
                meta_title: '',
                meta_description: '',
                canonical_url: '',
                og_title: '',
                og_description: '',
                noindex: false,
                nofollow: false,
            },
            variant_attribute_ids: [],
            variants: [],
            media: [],
            specifications: [],
        },
    });

    const { handleSubmit, watch, control, formState } = methods;

    const { errors, isSubmitting } = formState;

    const onSubmit = (data: ProductFormValues) => {
        const action = products.items.store().url;
        router.post(action, data, {
            preserveScroll: true,
        });

        console.log(JSON.stringify(data, null, 2));
    };
    const onError = (errors: any) => {
        console.log('ERRORES:', errors);
    };
    const nameValue = watch('name');

    const variantAttributes = attributes.filter((attr) => attr.is_variant);

    // console.log('asdsadsad', variantAttributes);

    const specificationAttributes = attributes.filter(
        (attr) => !attr.is_variant,
    );

    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit, onError)} className="pb-10">
                {/* GRID PRINCIPAL */}
                <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_0.5fr]">
                    <div className="space-y-10">
                        {/* GENERAL INFORMATION */}
                        <div className="space-y-3">
                            <p className="mb-4 text-xs font-bold tracking-widest text-gray-700 uppercase">
                                ● Información General
                            </p>
                            <div className="space-y-6 rounded-3xl">
                                <Controller
                                    name="name"
                                    control={control}
                                    render={({ field }) => (
                                        <div className="flex flex-col gap-2">
                                            <Label>Nombre de Producto *</Label>
                                            <Input
                                                {...field}
                                                placeholder="Premium Wireless Headphones"
                                            />
                                            {errors.name && (
                                                <p className="text-sm text-red-500">
                                                    {errors.name.message}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                />

                                <Controller
                                    name="slug"
                                    control={control}
                                    render={({ field }) => (
                                        <SlugInput
                                            id="slug"
                                            label="URL Slug *"
                                            source={nameValue}
                                            value={field.value}
                                            onChange={field.onChange}
                                            error={errors.slug?.message}
                                        />
                                    )}
                                />

                                <Controller
                                    name="brief_description"
                                    control={control}
                                    render={({ field }) => (
                                        <div className="flex flex-col gap-2">
                                            <Label>Breve Descripcion</Label>
                                            <Input
                                                {...field}
                                                placeholder="Descripcion corta para la lista del catálogo..."
                                            />
                                        </div>
                                    )}
                                />

                                <Controller
                                    name="description"
                                    control={control}
                                    render={({ field }) => (
                                        <div className="flex flex-col gap-2">
                                            <Label>Descripcion Completa</Label>
                                            <textarea
                                                {...field}
                                                className="min-h-[180px] w-full rounded-xl border p-4 text-sm"
                                                placeholder="Describe la experiencia del producto en detalle..."
                                            />
                                        </div>
                                    )}
                                />
                            </div>
                        </div>

                        <VariantForm variantAttributes={variantAttributes} />

                        <SpecificationsAttributes
                            availableAttributes={specificationAttributes}
                        />
                        {/* PLACEHOLDERS PARA MEDIA / VARIANTS / SPECS */}
                        <div className="space-y-3">
                            <p className="text-xs font-bold tracking-widest text-gray-700 uppercase">
                                ● Media & Gallery
                            </p>
                            <Card className="rounded-3xl border-2 border-dashed p-16 text-center text-slate-400">
                                ADD ASSETS
                            </Card>
                        </div>
                    </div>

                    {/* ================= RIGHT ================= */}
                    <aside className="sticky top-24 space-y-8">
                        {/* VISIBILITY STATUS */}
                        <Controller
                            name="is_active"
                            control={control}
                            render={({ field }) => (
                                <div className="space-y-3">
                                    <p className="text-xs font-bold tracking-widest text-gray-700 uppercase">
                                        ● Público
                                    </p>
                                    <div className="flex items-center justify-between rounded-2xl border bg-background p-4">
                                        <div className="space-y-0.5">
                                            <h3 className="text-sm font-medium">
                                                Visibilidad
                                            </h3>
                                            <p className="text-xs text-muted-foreground">
                                                Producto visible para los
                                                clientes
                                            </p>
                                        </div>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </div>
                                </div>
                            )}
                        />

                        {/* CATEGORY */}
                        <Controller
                            name="category_id"
                            control={control}
                            render={({ field }) => (
                                <div className="w-full space-y-2">
                                    <p className="text-xs font-bold tracking-widest text-gray-700 uppercase">
                                        ● Categoría
                                    </p>

                                    <CategoryTreeSelect
                                        categories={categories || []}
                                        value={field.value ?? undefined}
                                        onChange={field.onChange}
                                    />
                                </div>
                            )}
                        />

                        <div className="space-y-2">
                            <p className="text-xs font-bold tracking-widest text-gray-700 uppercase">
                                ● SEO & Metadatos
                            </p>
                            {/* SEO ENGINE */}
                            <Controller
                                name="metadata.meta_title"
                                control={control}
                                render={({ field }) => (
                                    <div>
                                        <Label>Meta título</Label>
                                        <Input {...field} />
                                    </div>
                                )}
                            />
                            <Controller
                                name="metadata.meta_description"
                                control={control}
                                render={({ field }) => (
                                    <div>
                                        <Label>Meta Descripción</Label>
                                        <textarea
                                            {...field}
                                            className="h-24 w-full rounded-xl border p-3"
                                        />
                                    </div>
                                )}
                            />
                            <Controller
                                name="metadata.canonical_url"
                                control={control}
                                render={({ field }) => (
                                    <div>
                                        <Label>Canonical URL</Label>
                                        <Input {...field} />
                                    </div>
                                )}
                            />
                            <div className="flex items-center gap-2">
                                <Controller
                                    name="metadata.noindex"
                                    control={control}
                                    render={({ field }) => (
                                        <label className="flex items-center gap-2 text-sm">
                                            <input
                                                type="checkbox"
                                                checked={field.value}
                                                onChange={(e) =>
                                                    field.onChange(
                                                        e.target.checked,
                                                    )
                                                }
                                            />
                                            No-Index
                                        </label>
                                    )}
                                />
                                <Controller
                                    name="metadata.nofollow"
                                    control={control}
                                    render={({ field }) => (
                                        <label className="flex items-center gap-2 text-sm">
                                            <input
                                                type="checkbox"
                                                checked={field.value}
                                                onChange={(e) =>
                                                    field.onChange(
                                                        e.target.checked,
                                                    )
                                                }
                                            />
                                            No-Follow
                                        </label>
                                    )}
                                />
                            </div>
                        </div>

                        {/* BOTÓN SUBMIT */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gray-800 px-6 text-white hover:bg-gray-700"
                        >
                            Guardar producto
                        </button>
                    </aside>
                </div>
            </form>
        </FormProvider>
    );
}
