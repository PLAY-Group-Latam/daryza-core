/* eslint-disable react-hooks/exhaustive-deps */

/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import { MultiSelect } from '@/components/custom-ui/MultiSelect';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import products from '@/routes/products';
import { Attribute } from '@/types/products/attributes';
import { BusinessLine } from '@/types/products/businessLines';
import { CategorySelect } from '@/types/products/categories';
import { ProductEdit } from '@/types/products/product';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import { useEffect } from 'react';
import { Controller, FormProvider, Resolver, useForm } from 'react-hook-form';
import { z } from 'zod';
import { SlugInput } from '../../../slug-text';
import { CategoryTreeSelect } from './CategoryArrayTreeSelect';
import { TechnicalSheetsForm } from './TechnicalSheetsForm';
import { VariantForm } from './VariantForm';

const VariantAttributeSchema = z.object({
    attribute_id: z.string(), // ULID
    attribute_value_id: z.string().nullable().optional(),
    value: z.union([z.string(), z.boolean(), z.number()]).optional(),
});
const SpecificationAttributeSchema = z.object({
    attribute_id: z.string(), // ULID
    value: z.union([z.string(), z.boolean(), z.number()]),
});
const VariantSchema = z.object({
    sku: z.string().min(1),
    price: z.coerce.number(),
    promo_price: z.coerce.number().optional(),
    is_on_promo: z.boolean(),
    promo_start_at: z
        .date({
            error: (issue) =>
                issue.input === undefined
                    ? 'La fecha es obligatorio'
                    : 'La Fecha es inválida',
        })
        .optional(),
    promo_end_at: z
        .date({
            error: (issue) =>
                issue.input === undefined
                    ? 'La fecha es obligatorio'
                    : 'La Fecha es inválida',
        })
        .optional(),
    stock: z.coerce.number(),
    attributes: z.array(VariantAttributeSchema),
    sku_supplier: z.string().optional(), // ✅ Nuevo campo opcional
    media: z.array(z.any()),
    is_active: z.boolean().default(true).optional(),
    is_main: z.boolean().default(false), // ✅ nuevo campo
    specifications: z.array(SpecificationAttributeSchema),
    specification_selector: z.string().optional(),
});

const TechnicalSheetSchema = z.object({
    file: z.instanceof(File).optional(), // archivo cargado
    file_path: z.string().optional(), // archivo existente en backend
});
const ProductSchema = z.object({
    name: z.string().min(1, 'El nombre es obligatorio'),
    slug: z.string().min(1, 'El slug es obligatorio'),
    categories: z
        .array(z.string())
        .min(1, 'Debes seleccionar al menos una categoría'),
    business_lines: z.array(z.string()).optional(), // <--- Agregar esto
    brief_description: z.string().optional(),
    description: z.string().optional(),
    is_active: z.boolean(),
    is_home: z.boolean(), // ✅ Agregado aquí
    variant_attribute_ids: z.array(z.string()), // ULID
    variants: z.array(VariantSchema),
    technicalSheets: z.array(TechnicalSheetSchema), // ✅ fichas técnicas del producto

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
    businessLines,
}: {
    categories: CategorySelect[];
    attributes: Attribute[];
    product?: ProductEdit;
    businessLines: BusinessLine[];
}) {
    const methods = useForm<ProductFormValues>({
        resolver: zodResolver(ProductSchema) as Resolver<ProductFormValues>,
        defaultValues: {
            name: '',
            slug: '',
            categories: [],
            business_lines: [], // <--- Agregar esto
            brief_description: '',
            description: '',
            is_active: true,
            is_home: false, // ✅ Inicializar en false
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
            // specifications: [],
        },
    });

    const mapMediaToEdit = (media: any[] = []) => {
        return media.map((m) => m.file_path); // 🔥 SOLO URL
    };

    useEffect(() => {
        if (product) {
            methods.reset({
                name: product.name,
                slug: product.slug,
                categories: product.categories || [],
                business_lines: product.business_lines || [], // <--- Agregar esto
                brief_description: product.brief_description,
                description: product.description,
                is_active: product.is_active,
                is_home: product.is_home ?? false, // ✅ Mapear desde el backend

                metadata: {
                    meta_title: product.metadata?.meta_title ?? '',
                    meta_description: product.metadata?.meta_description ?? '',
                    canonical_url: product.metadata?.canonical_url ?? '',
                    og_title: product.metadata?.og_title ?? '',
                    og_description: product.metadata?.og_description ?? '',
                    noindex: product.metadata?.noindex ?? false,
                    nofollow: product.metadata?.nofollow ?? false,
                },

                variant_attribute_ids: product.variant_attribute_ids,

                variants: product.variants.map((v) => ({
                    sku: v.sku,
                    price: v.price,
                    promo_price: v.promo_price ?? undefined, // 🔥 FIX
                    is_on_promo: v.is_on_promo,
                    promo_start_at: v.promo_start_at
                        ? new Date(v.promo_start_at)
                        : undefined,
                    promo_end_at: v.promo_end_at
                        ? new Date(v.promo_end_at)
                        : undefined,
                    stock: v.stock,
                    is_active: v.is_active,
                    is_main: v.is_main,
                    media: mapMediaToEdit(v.media),
                    attributes: v.attributes ?? [],
                    specifications: v.specifications ?? [],
                    sku_supplier: v.sku_supplier ?? '', // ✅ Mapeo del valor del backend
                })),

                technicalSheets:
                    product.technicalSheets?.map((ts) => ({
                        file_path: ts.file_path,
                    })) ?? [],
            });
        }
    }, [product]);

    const { handleSubmit, watch, control, formState } = methods;
    const { errors, isSubmitting } = formState;

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
        // console.log('data enviada', data);
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

                        <VariantForm
                            variantAttributes={variantAttributes}
                            specificationAttributes={specificationAttributes}
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
                                        ● Producto Público
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
                        <Controller
                            name="is_home"
                            control={control}
                            render={({ field }) => (
                                <div className="space-y-3">
                                    <p className="text-xs font-bold tracking-widest text-gray-700 uppercase">
                                        ● Destacado Home
                                    </p>
                                    <div className="flex items-center justify-between rounded-2xl border bg-background p-4">
                                        <div className="space-y-0.5">
                                            <h3 className="text-sm font-medium">
                                                Visibilidad
                                            </h3>
                                            <p className="text-xs text-muted-foreground">
                                                Mostrar en la página principal
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
                        <Controller
                            name="business_lines"
                            control={control}
                            render={({ field }) => (
                                <div className="w-full space-y-2">
                                    <p className="text-xs font-bold tracking-widest text-gray-700 uppercase">
                                        ● Líneas de Negocio
                                    </p>

                                    <MultiSelect
                                        options={businessLines.map((line) => ({
                                            label: line.name,
                                            value: line.id,
                                        }))}
                                        value={field.value || []}
                                        onChange={field.onChange}
                                        placeholder="Seleccionar líneas..."
                                        searchPlaceholder="Buscar línea de negocio..."
                                    />
                                    {errors.business_lines && (
                                        <p className="text-sm text-red-500">
                                            {errors.business_lines.message}
                                        </p>
                                    )}
                                </div>
                            )}
                        />

                        {/* CATEGORY */}
                        <Controller
                            name="categories" // Cambio de category_id a categories                            control={control}
                            render={({ field }) => (
                                <div className="w-full space-y-2">
                                    <p className="text-xs font-bold tracking-widest text-gray-700 uppercase">
                                        ● Categoría
                                    </p>

                                    <CategoryTreeSelect
                                        categories={categories || []}
                                        value={field.value}
                                        onChange={field.onChange}
                                    />
                                    {errors.categories && (
                                        <p className="text-sm text-red-500">
                                            {errors.categories.message}
                                        </p>
                                    )}
                                </div>
                            )}
                        />

                        <div className="space-y-4">
                            <p className="text-xs font-bold tracking-widest uppercase">
                                ● SEO & Metadatos
                            </p>

                            <Controller
                                name="metadata.meta_title"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        placeholder="Meta title"
                                    />
                                )}
                            />

                            <Controller
                                name="metadata.meta_description"
                                control={control}
                                render={({ field }) => (
                                    <Textarea
                                        {...field}
                                        className="h-24 w-full rounded-xl border p-3 text-sm"
                                        placeholder="Meta description"
                                    />
                                )}
                            />

                            <Controller
                                name="metadata.canonical_url"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        placeholder="Canonical URL"
                                    />
                                )}
                            />

                            <div className="flex gap-4">
                                <Controller
                                    name="metadata.noindex"
                                    control={control}
                                    render={({ field }) => (
                                        <label className="flex items-center gap-2 text-sm">
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                            No index
                                        </label>
                                    )}
                                />

                                <Controller
                                    name="metadata.nofollow"
                                    control={control}
                                    render={({ field }) => (
                                        <label className="flex items-center gap-2 text-sm">
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                            No follow
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
