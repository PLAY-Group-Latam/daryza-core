/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import products from '@/routes/products';
import { CategorySelect } from '@/types/products';
import { Attribute } from '@/types/products/attributes';
import { Product } from '@/types/products/product';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import { useEffect } from 'react';
import { Controller, FormProvider, Resolver, useForm } from 'react-hook-form';
import { z } from 'zod';
import { SlugInput } from '../../../slug-text';
import { CategoryTreeSelect } from '../../categories/CategoryTreeSelect';
import { SpecificationsAttributes } from './SpecificationsFormAttributes';
import { TechnicalSheetsForm } from './TechnicalSheetsForm';
import { VariantForm } from './VariantForm';

const VariantAttributeSchema = z.object({
    attribute_id: z.string(), // ULID
    attribute_value_id: z.string().nullable().optional(),
    value: z.union([z.string(), z.boolean(), z.number()]).optional(),
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
    is_main: z.boolean().default(false), // ✅ nuevo campo
});

const SpecificationAttributeSchema = z.object({
    attribute_id: z.string(), // ULID
    value: z.union([z.string(), z.boolean(), z.number()]),
});
const TechnicalSheetSchema = z.object({
    file: z.instanceof(File).optional(), // archivo cargado
    file_path: z.string().optional(), // archivo existente en backend
});
const ProductSchema = z.object({
    name: z.string().min(1, 'El nombre es obligatorio'),
    slug: z.string().min(1, 'El slug es obligatorio'),
    category_id: z.string().min(1, 'Debes seleccionar una categoría'),
    brief_description: z.string().optional(),
    description: z.string().optional(),
    is_active: z.boolean(),

    variant_attribute_ids: z.array(z.string()), // ULID
    variants: z.array(VariantSchema),
    technicalSheets: z.array(TechnicalSheetSchema), // ✅ fichas técnicas del producto
    specifications: z.array(SpecificationAttributeSchema),
    specification_selector: z.string().optional(),
    metadata: z.object({
        meta_title: z.string().optional(),
        meta_description: z.string().optional(),
        canonical_url: z.string().optional(),
        og_title: z.string().optional(),
        og_description: z.string().optional(),
        noindex: z.boolean(),
        nofollow: z.boolean(),
    }),
});

export type ProductFormValues = z.infer<typeof ProductSchema>;

export default function FormProduct({
    categories,
    attributes,
    product,
}: {
    categories: CategorySelect[];
    attributes: Attribute[];
    product?: Product; // 👈 opcional
}) {
    const methods = useForm<ProductFormValues>({
        resolver: zodResolver(ProductSchema) as Resolver<ProductFormValues>,
        defaultValues: {
            name: '',
            slug: '',
            category_id: '',
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
            technicalSheets: [],
            specifications: [],
            specification_selector: '',
        },
    });

    useEffect(() => {
        if (!product) return;

        methods.reset({
            name: product.name,
            slug: product.slug,
            category_id: product.category_id ?? '',
            brief_description: product.brief_description ?? '',
            description: product.description ?? '',
            is_active: product.is_active,

            metadata: {
                meta_title: product.metadata?.meta_title ?? '',
                meta_description: product.metadata?.meta_description ?? '',
                canonical_url: product.metadata?.canonical_url ?? '',
                og_title: product.metadata?.og_title ?? '',
                og_description: product.metadata?.og_description ?? '',
                noindex: Boolean(product.metadata?.noindex),
                nofollow: Boolean(product.metadata?.nofollow),
            },

            variants: product.variants.map((variant) => ({
                id: variant.id, // 🔑 CLAVE para update
                sku: variant.sku,
                price: Number(variant.price),
                promo_price: Number(variant.promo_price ?? 0),
                stock: Number(variant.stock),
                is_active: variant.is_active,
                is_on_promo: variant.is_on_promo,
                promo_start_at: variant.promo_start_at,
                promo_end_at: variant.promo_end_at,
                is_main: variant.is_main,

                attributes: variant.attributes.map((attr) => ({
                    attribute_id: attr.attribute_id,
                    attribute_value_id: attr.attribute_value_id,
                    value: attr.value,
                })),

                media: variant.media.map((m) => ({
                    file_path: m.file_path, // 👈 archivos EXISTENTES
                })),
            })),

            technicalSheets: product.technicalSheets.map((sheet) => ({
                file_path: sheet.file_path,
            })),

            specifications: product.specifications.map((spec) => ({
                attribute_id: spec.attribute_id,
                value: spec.value,
            })),
        });
    }, [product]);

    const { handleSubmit, watch, control, formState } = methods;

    const { errors, isSubmitting } = formState;

    // const onSubmit = (data: ProductFormValues) => {
    //     const action = products.items.store().url;
    //     const formData = new FormData();

    //     type FormValue =
    //         | string
    //         | number
    //         | boolean
    //         | File
    //         | null
    //         | FormValue[]
    //         | { [key: string]: FormValue };

    //     const appendFormData = (
    //         fd: FormData,
    //         value: FormValue,
    //         key?: string,
    //     ) => {
    //         if (value === null || value === undefined) {
    //             if (key) fd.append(key, '');
    //             return;
    //         }

    //         if (value instanceof File) {
    //             if (!key) throw new Error('File must have a key');
    //             fd.append(key, value);
    //         } else if (Array.isArray(value)) {
    //             value.forEach((item, index) => {
    //                 const arrayKey = key ? `${key}[${index}]` : `${index}`;
    //                 appendFormData(fd, item, arrayKey);
    //             });
    //         } else if (typeof value === 'object') {
    //             Object.entries(value).forEach(([k, v]) => {
    //                 const objectKey = key ? `${key}[${k}]` : k;
    //                 appendFormData(fd, v, objectKey);
    //             });
    //         } else if (typeof value === 'boolean') {
    //             if (!key) throw new Error('Boolean must have a key');
    //             fd.append(key, value ? '1' : '0');
    //         } else {
    //             if (!key) throw new Error('Primitive must have a key');
    //             fd.append(key, String(value));
    //         }
    //     };

    //     appendFormData(formData, data);

    //     router.post(action, formData, {
    //         preserveScroll: true,
    //         // Inertia detecta automáticamente FormData
    //     });

    //     console.log('FormData enviado:', formData);
    // };
    const isEdit = Boolean(product);

    const onSubmit = (data: ProductFormValues) => {
        const action = isEdit
            ? products.items.update(product!.id).url
            : products.items.store().url;

        router.post(
            action,
            {
                ...data,
                ...(isEdit && { _method: 'put' }),
            },
            {
                preserveScroll: true,
                forceFormData: true,
            },
        );
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
                        <Controller
                            name="technicalSheets"
                            control={control}
                            render={({ field }) => (
                                <TechnicalSheetsForm field={field} />
                            )}
                        />
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
                                        value={field.value}
                                        onChange={field.onChange}
                                        showPrincipal={false}
                                    />
                                    {errors.category_id && (
                                        <p className="text-sm text-red-500">
                                            {errors.category_id.message}
                                        </p>
                                    )}
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
