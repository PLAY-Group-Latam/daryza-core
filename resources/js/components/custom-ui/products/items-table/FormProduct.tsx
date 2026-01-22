/* eslint-disable react-hooks/incompatible-library */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { zodResolver } from '@hookform/resolvers/zod';
import { ClipboardList } from 'lucide-react';
import {
    Controller,
    FormProvider,
    useFieldArray,
    useForm,
} from 'react-hook-form';
import { z } from 'zod';
import { SlugInput } from '../../slug-text';
import { Upload } from '../../upload';
import { VariantAttributes } from './create-form/VariantAttributes';

const VariantAttributeSchema = z.object({
    attribute_id: z.number(),
    option_id: z.number(),
});

const VariantSchema = z.object({
    sku: z.string().min(1),
    price: z.number(),
    promo_price: z.number().optional(),
    is_on_promo: z.boolean(),
    promo_start_at: z.string().nullable().optional(),
    promo_end_at: z.string().nullable().optional(),
    stock: z.number(),
    attributes: z.array(VariantAttributeSchema),
    media: z.array(z.any()),
});

const ProductSchema = z.object({
    name: z.string().min(1, 'El nombre es obligatorio'),
    slug: z.string().min(1, 'El slug es obligatorio'),
    code: z.string().optional(),
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

    variants: z.array(VariantSchema),
    media: z.array(z.any()),
    specifications: z.array(z.any()),
});

type ProductFormValues = z.infer<typeof ProductSchema>;

export default function FormProduct({ categories }: { categories: any[] }) {
    const methods = useForm<ProductFormValues>({
        resolver: zodResolver(ProductSchema),
        defaultValues: {
            name: '',
            slug: '',
            code: '',
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
            variants: [],
            media: [],
            specifications: [],
        },
    });

    const { handleSubmit, watch, control, formState } = methods;
    const {
        fields: variantFields,
        append,
        remove,
    } = useFieldArray({
        control,
        name: 'variants',
    });

    const {
        fields: specificationFields,
        append: appendSpecification,
        remove: removeSpecification,
    } = useFieldArray({
        control,
        name: 'specifications',
    });

    const { errors, isSubmitting } = formState;

    const onSubmit = (data: ProductFormValues) => {
        console.log(data);
    };

    const nameValue = watch('name');

    const productAttributes = [
        {
            id: 1,
            name: 'Color',
            options: [
                { id: 10, value: 'Rojo' },
                { id: 11, value: 'Azul' },
                { id: 12, value: 'Verde' },
            ],
        },
        {
            id: 2,
            name: 'Aroma',
            options: [
                { id: 20, value: 'Fresa' },
                { id: 21, value: 'Vainilla' },
            ],
        },
    ];

    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="pb-10">
                {/* GRID PRINCIPAL */}
                <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_0.5fr]">
                    <div className="space-y-10">
                        {/* GENERAL INFORMATION */}
                        <div className="space-y-3">
                            <p className="text-xs font-bold tracking-widest text-gray-700 uppercase">
                                ● Información General
                            </p>
                            <Card className="space-y-6 rounded-3xl p-8">
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <Controller
                                        name="code"
                                        control={control}
                                        render={({ field }) => (
                                            <div className="flex flex-col gap-2">
                                                <Label>
                                                    Código de Producto
                                                </Label>
                                                <Input
                                                    {...field}
                                                    placeholder="PROD-001"
                                                />
                                            </div>
                                        )}
                                    />

                                    <Controller
                                        name="name"
                                        control={control}
                                        render={({ field }) => (
                                            <div className="flex flex-col gap-2">
                                                <Label>
                                                    Nombre de Producto *
                                                </Label>
                                                <Input
                                                    {...field}
                                                    placeholder="Premium Wireless Headphones"
                                                />
                                                {errors.name && (
                                                    <p className="text-xs text-red-500">
                                                        {errors.name.message}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    />
                                </div>

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
                                                className="min-h-[180px] w-full rounded-xl border p-4"
                                                placeholder="Describe la experiencia del producto en detalle..."
                                            />
                                        </div>
                                    )}
                                />
                            </Card>
                        </div>

                        {/* PLACEHOLDERS PARA MEDIA / VARIANTS / SPECS */}
                        <div className="space-y-3">
                            <p className="text-xs font-bold tracking-widest text-gray-700 uppercase">
                                ● Media & Gallery
                            </p>
                            <Card className="rounded-3xl border-2 border-dashed p-16 text-center text-slate-400">
                                ADD ASSETS
                            </Card>
                        </div>

                        <div className="space-y-3">
                            <p className="text-xs font-bold tracking-widest text-gray-700 uppercase">
                                ● Variant Matrix
                            </p>

                            <div className="space-y-4">
                                {variantFields.length === 0 ? (
                                    /* EMPTY STATE */
                                    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 py-12 text-center">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                                            📦
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-600">
                                                No hay variantes configuradas
                                            </p>
                                            <p className="text-xs text-slate-400">
                                                Agrega variantes para manejar
                                                distintos precios, stock o
                                                presentaciones.
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                append({
                                                    sku: '',
                                                    price: 0,
                                                    promo_price: undefined,
                                                    is_on_promo: false,
                                                    stock: 0,
                                                    attributes: [],
                                                    media: [],
                                                })
                                            }
                                            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
                                        >
                                            + Crear primera variante
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        {variantFields.map((variant, index) => (
                                            <Card
                                                key={variant.id ?? index}
                                                className="space-y-4 rounded-2xl border border-slate-200 p-5 shadow-sm"
                                            >
                                                {/* Header */}
                                                <div className="flex items-center justify-between">
                                                    <h4 className="text-sm font-semibold text-slate-700">
                                                        Variante {index + 1}
                                                    </h4>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            remove(index)
                                                        }
                                                        className="text-xs text-red-500 hover:text-red-600"
                                                    >
                                                        Eliminar
                                                    </button>
                                                </div>

                                                {/* FILA: Imagen + Inputs */}
                                                <div className="flex items-center gap-4">
                                                    {/* Imagen */}
                                                    <Controller
                                                        name={`variants.${index}.media`}
                                                        control={control}
                                                        render={({ field }) => {
                                                            const mainImage =
                                                                field
                                                                    .value?.[0];

                                                            return (
                                                                <Upload
                                                                    value={
                                                                        mainImage?.file ??
                                                                        mainImage?.file_path ??
                                                                        null
                                                                    }
                                                                    onFileChange={(
                                                                        file,
                                                                    ) => {
                                                                        if (
                                                                            !file
                                                                        ) {
                                                                            field.onChange(
                                                                                [],
                                                                            );
                                                                            return;
                                                                        }

                                                                        field.onChange(
                                                                            [
                                                                                {
                                                                                    type: 'image',
                                                                                    file_path:
                                                                                        '',
                                                                                    is_main: true,
                                                                                    order: 0,
                                                                                    file,
                                                                                },
                                                                            ],
                                                                        );
                                                                    }}
                                                                    previewClassName="h-24 w-24 shrink-0"
                                                                />
                                                            );
                                                        }}
                                                    />

                                                    {/* Inputs */}
                                                    <div className="grid flex-1 grid-cols-1 gap-3 md:grid-cols-3">
                                                        <div className="flex flex-col gap-1">
                                                            <Label className="text-xs text-slate-500">
                                                                SKU
                                                            </Label>
                                                            <Controller
                                                                name={`variants.${index}.sku`}
                                                                control={
                                                                    control
                                                                }
                                                                render={({
                                                                    field,
                                                                }) => (
                                                                    <Input
                                                                        {...field}
                                                                        placeholder="SKU"
                                                                    />
                                                                )}
                                                            />
                                                        </div>

                                                        <div className="flex flex-col gap-1">
                                                            <Label className="text-xs text-slate-500">
                                                                Precio
                                                            </Label>
                                                            <Controller
                                                                name={`variants.${index}.price`}
                                                                control={
                                                                    control
                                                                }
                                                                render={({
                                                                    field,
                                                                }) => (
                                                                    <Input
                                                                        {...field}
                                                                        type="number"
                                                                        placeholder="Precio"
                                                                    />
                                                                )}
                                                            />
                                                        </div>

                                                        <div className="flex flex-col gap-1">
                                                            <Label className="text-xs text-slate-500">
                                                                Stock
                                                            </Label>
                                                            <Controller
                                                                name={`variants.${index}.stock`}
                                                                control={
                                                                    control
                                                                }
                                                                render={({
                                                                    field,
                                                                }) => (
                                                                    <Input
                                                                        {...field}
                                                                        type="number"
                                                                        placeholder="Stock"
                                                                    />
                                                                )}
                                                            />
                                                        </div>

                                                        {/* Promoción */}
                                                        <div className="flex flex-col gap-2">
                                                            <Label className="text-xs text-slate-500">
                                                                Promoción
                                                            </Label>
                                                            <Controller
                                                                name={`variants.${index}.is_on_promo`}
                                                                control={
                                                                    control
                                                                }
                                                                render={({
                                                                    field: promoField,
                                                                }) => (
                                                                    <div className="flex items-center gap-2">
                                                                        <Switch
                                                                            checked={
                                                                                promoField.value
                                                                            }
                                                                            onCheckedChange={
                                                                                promoField.onChange
                                                                            }
                                                                        />
                                                                        <span className="text-xs text-slate-600">
                                                                            {promoField.value
                                                                                ? 'En promoción'
                                                                                : 'Sin promoción'}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Campos de promoción (mostrados condicionalmente) */}
                                                <Controller
                                                    name={`variants.${index}.is_on_promo`}
                                                    control={control}
                                                    render={({
                                                        field: promoField,
                                                    }) =>
                                                        promoField.value ? (
                                                            <div className="space-y-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
                                                                <h5 className="text-sm font-medium text-amber-800">
                                                                    Configuración
                                                                    de Promoción
                                                                </h5>
                                                                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                                                                    {/* Precio promocional */}
                                                                    <div className="flex flex-col gap-1">
                                                                        <Label className="text-xs text-slate-500">
                                                                            Precio
                                                                            Promocional
                                                                        </Label>
                                                                        <Controller
                                                                            name={`variants.${index}.promo_price`}
                                                                            control={
                                                                                control
                                                                            }
                                                                            render={({
                                                                                field,
                                                                            }) => (
                                                                                <Input
                                                                                    {...field}
                                                                                    type="number"
                                                                                    step="0.01"
                                                                                    placeholder="Precio con descuento"
                                                                                    className="border-amber-400"
                                                                                />
                                                                            )}
                                                                        />
                                                                    </div>

                                                                    {/* Fecha inicio */}
                                                                    <div className="flex flex-col gap-1">
                                                                        <Label className="text-xs text-slate-500">
                                                                            Inicio
                                                                            promoción
                                                                        </Label>
                                                                        <Controller
                                                                            name={`variants.${index}.promo_start_at`}
                                                                            control={
                                                                                control
                                                                            }
                                                                            render={({
                                                                                field,
                                                                            }) => (
                                                                                <Input
                                                                                    {...field}
                                                                                    type="datetime-local"
                                                                                    value={
                                                                                        field.value ||
                                                                                        ''
                                                                                    }
                                                                                />
                                                                            )}
                                                                        />
                                                                    </div>

                                                                    {/* Fecha fin */}
                                                                    <div className="flex flex-col gap-1">
                                                                        <Label className="text-xs text-slate-500">
                                                                            Fin
                                                                            promoción
                                                                        </Label>
                                                                        <Controller
                                                                            name={`variants.${index}.promo_end_at`}
                                                                            control={
                                                                                control
                                                                            }
                                                                            render={({
                                                                                field,
                                                                            }) => (
                                                                                <Input
                                                                                    {...field}
                                                                                    type="datetime-local"
                                                                                    value={
                                                                                        field.value ||
                                                                                        ''
                                                                                    }
                                                                                />
                                                                            )}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <></>
                                                        )
                                                    }
                                                />

                                                {/* ATRIBUTOS DE LA VARIANTE */}
                                                <VariantAttributes
                                                    control={control}
                                                    variantIndex={index}
                                                    attributes={
                                                        productAttributes
                                                    }
                                                />
                                            </Card>
                                        ))}

                                        {/* BOTÓN AGREGAR VARIANTE */}
                                        <button
                                            type="button"
                                            onClick={() =>
                                                append({
                                                    sku: '',
                                                    price: 0,
                                                    promo_price: undefined,
                                                    is_on_promo: false,
                                                    stock: 0,
                                                    attributes: [],
                                                    media: [],
                                                })
                                            }
                                            className="mx-auto w-fit rounded-xl border-2 border-dashed border-slate-300 px-4 py-2.5 text-sm text-slate-500 hover:bg-slate-50"
                                        >
                                            + Agregar Variante
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <p className="text-xs font-bold tracking-widest text-gray-700 uppercase">
                                ● Specifications
                            </p>

                            <div className="space-y-4 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-6">
                                {specificationFields.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center gap-4 text-center">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                                            <ClipboardList />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-600">
                                                No hay especificaciones técnicas
                                            </p>
                                            <p className="text-xs text-slate-400">
                                                Agrega datos como peso,
                                                material, dimensiones, etc.
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                appendSpecification({
                                                    name: '',
                                                    value: '',
                                                })
                                            }
                                            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
                                        >
                                            + Agregar primera especificación
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        {specificationFields.map(
                                            (spec, index) => (
                                                <div
                                                    key={spec.id ?? index}
                                                    className="grid grid-cols-1 items-end gap-3 md:grid-cols-[1fr_1fr_auto]"
                                                >
                                                    {/* Nombre */}
                                                    <div className="flex flex-col gap-1">
                                                        <Label className="text-xs text-slate-500">
                                                            Nombre
                                                        </Label>
                                                        <Controller
                                                            name={`specifications.${index}.name`}
                                                            control={control}
                                                            render={({
                                                                field,
                                                            }) => (
                                                                <Input
                                                                    {...field}
                                                                    placeholder="Ej: Material"
                                                                />
                                                            )}
                                                        />
                                                    </div>

                                                    {/* Valor */}
                                                    <div className="flex flex-col gap-1">
                                                        <Label className="text-xs text-slate-500">
                                                            Valor
                                                        </Label>
                                                        <Controller
                                                            name={`specifications.${index}.value`}
                                                            control={control}
                                                            render={({
                                                                field,
                                                            }) => (
                                                                <Input
                                                                    {...field}
                                                                    placeholder="Ej: Plástico ABS"
                                                                />
                                                            )}
                                                        />
                                                    </div>

                                                    {/* Eliminar */}
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeSpecification(
                                                                index,
                                                            )
                                                        }
                                                        className="h-10 rounded-lg border border-red-200 px-3 text-xs text-red-500 hover:bg-red-50"
                                                    >
                                                        Eliminar
                                                    </button>
                                                </div>
                                            ),
                                        )}

                                        {/* Botón agregar */}
                                        <button
                                            type="button"
                                            onClick={() =>
                                                appendSpecification({
                                                    name: '',
                                                    value: '',
                                                })
                                            }
                                            className="mx-auto mt-4 w-fit rounded-xl border-2 border-dashed border-slate-300 px-4 py-2.5 text-sm text-slate-500 hover:bg-slate-50"
                                        >
                                            + Agregar especificación
                                        </button>
                                    </>
                                )}
                            </div>
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
                                <div className="space-y-2">
                                    <p className="text-xs font-bold tracking-widest text-gray-700 uppercase">
                                        ● Category
                                    </p>
                                    <select
                                        className="h-11 w-full rounded-xl border px-4"
                                        value={field.value ?? ''}
                                        onChange={(e) =>
                                            field.onChange(
                                                e.target.value === ''
                                                    ? null
                                                    : e.target.value,
                                            )
                                        }
                                        onBlur={field.onBlur}
                                        name={field.name}
                                        ref={field.ref}
                                    >
                                        <option value="">
                                            Select category
                                        </option>
                                        {categories.map((cat) => (
                                            <option
                                                key={cat.id}
                                                value={cat.id}
                                                className="text-black"
                                            >
                                                {cat.name}
                                            </option>
                                        ))}
                                    </select>
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
                            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 text-white hover:bg-indigo-700"
                        >
                            Guardar producto
                        </button>
                    </aside>
                </div>
            </form>
        </FormProvider>
    );
}
