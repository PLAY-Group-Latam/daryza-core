/* eslint-disable react-hooks/incompatible-library */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import {
    Controller,
    FormProvider,
    useFieldArray,
    useForm,
} from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import products from '@/routes/products';
import { SearchResult } from '@/types/products/packs';
import { Layers, Trash2 } from 'lucide-react';
import { DatePicker } from '../../DatePicker';
import { SlugInput } from '../../slug-text';
import { PackProductSearch } from '../packs/SearchProduct'; // Reutilizamos el buscador de packs

// Esquema alineado al controlador DynamicCategoryController
const dynamicCategorySchema = z
    .object({
        name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
        slug: z.string().min(3, 'El slug es obligatorio'),
        is_active: z.boolean().default(true),
        starts_at: z.date().optional(),
        ends_at: z.date().optional(),
        items: z
            .array(
                z.object({
                    variant_id: z.string(),
                    product_id: z.string(),
                    sku: z.string(),
                    product_name: z.string(),
                }),
            )
            .min(1, 'Selecciona al menos un producto para la categoría'),
    })
    .refine(
        (data) => {
            if (!data.starts_at || !data.ends_at) return true;
            return data.ends_at >= data.starts_at;
        },
        {
            message: 'La fecha de fin no puede ser anterior al inicio',
            path: ['ends_at'],
        },
    );

type FormValues = z.infer<typeof dynamicCategorySchema>;

interface Props {
    category?: any; // Para el modo edición
    searchResults?: SearchResult[];
    filters?: { q?: string };
}

export default function CreateDynamicCategoryForm({
    category,
    searchResults = [],
}: Props) {
    const isEditing = !!category;

    console.log(category);

    const methods = useForm<FormValues>({
        resolver: zodResolver(dynamicCategorySchema) as any,
        defaultValues: {
            name: category?.name || '',
            slug: category?.slug || '',
            is_active: category?.is_active ?? true,
            starts_at: category?.starts_at
                ? new Date(category.starts_at)
                : undefined,
            ends_at: category?.ends_at ? new Date(category.ends_at) : undefined,
            items: category?.items || [],
        },
    });

    const {
        control,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
    } = methods;

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'items',
    });

    const categoryName = watch('name');

    const addProduct = (variant: SearchResult) => {
        if (
            fields.some(
                (f) => String(f.variant_id) === String(variant.variant_id),
            )
        )
            return;

        append({
            variant_id: String(variant.variant_id),
            product_id: String(variant.product_id),
            sku: variant.sku,
            product_name: `${variant.product_name} (${variant.variant_name})`,
        });
    };

    const onSubmit = (values: FormValues) => {
        if (isEditing) {
            router.put(products.dynamicCategories.update(category.id), values, {
                preserveScroll: true,
            });
        } else {
            router.post(products.dynamicCategories.store.url(), values, {
                preserveScroll: true,
            });
        }
    };

    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 pb-20">
                {/* HEADER */}
                <div className="flex flex-col gap-2">
                    <h1 className="flex items-center gap-3 text-2xl font-black text-slate-900">
                        <Layers className="size-7" />
                        {isEditing
                            ? 'Editar Categoría Dinámica'
                            : 'Nueva Categoría Dinámica'}
                    </h1>
                    <p className="text-sm text-slate-500">
                        Las categorías dinámicas agrupan productos por SKU para
                        campañas temporales.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_350px]">
                    {/* COLUMNA PRINCIPAL */}
                    <div className="space-y-8">
                        {/* IDENTIDAD */}
                        <div className="space-y-6">
                            <Controller
                                name="name"
                                control={control}
                                render={({ field }) => (
                                    <div className="flex flex-col gap-3">
                                        <Label>
                                            Nombre Público de la Categoría *
                                        </Label>
                                        <Input
                                            {...field}
                                            placeholder="Ej: Ofertas Relámpago"
                                        />
                                        {errors.name && (
                                            <p className="text-xs text-red-500">
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
                                        label="Slug *"
                                        source={categoryName}
                                        value={field.value}
                                        onChange={field.onChange}
                                    />
                                )}
                            />
                        </div>

                        {/* SECCIÓN DE PRODUCTOS */}
                        <div className="space-y-4">
                            <div className="flex flex-col gap-3">
                                <Label>Productos Vinculados</Label>
                                <PackProductSearch
                                    searchResults={searchResults}
                                    searchUrl={window.location.pathname}
                                    onSelect={(variant) => addProduct(variant)}
                                />
                            </div>

                            <div className="overflow-hidden rounded-lg border">
                                <Table>
                                    <TableHeader className="bg-slate-50">
                                        <TableRow>
                                            <TableHead className="text-xs font-bold uppercase">
                                                Producto / Variante
                                            </TableHead>
                                            <TableHead className="w-10"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {fields.length === 0 && (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={2}
                                                    className="h-24 text-center text-sm text-slate-400"
                                                >
                                                    No hay productos
                                                    seleccionados.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                        {fields.map((field, index) => {
                                            const hexMatch =
                                                field.product_name.match(
                                                    /#([0-9A-F]{3,6})/i,
                                                );
                                            const hexColor = hexMatch
                                                ? hexMatch[0]
                                                : null;

                                            // 2. Limpiamos el nombre: quitamos el HEX y lo que esté entre paréntesis
                                            // Ejemplo: "Cesto ropa (#000000 - G)" -> "Cesto ropa"
                                            const cleanName =
                                                field.product_name.split(
                                                    ' (',
                                                )[0];

                                            const variantLabel = hexColor
                                                ? field.product_name
                                                      .split('(')[1]
                                                      ?.replace(hexColor, '')
                                                      .replace('-', '')
                                                      .replace(')', '')
                                                      .trim()
                                                : field.product_name
                                                      .split('(')[1]
                                                      ?.replace(')', '')
                                                      .trim();

                                            return (
                                                <TableRow
                                                    key={field.id}
                                                    className="hover:bg-slate-50/50"
                                                >
                                                    <TableCell>
                                                        <div className="flex flex-col gap-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm font-bold text-slate-900">
                                                                    {cleanName}
                                                                </span>
                                                                {hexColor && (
                                                                    <>
                                                                        <div
                                                                            className="h-3.5 w-3.5 rounded-full"
                                                                            style={{
                                                                                backgroundColor:
                                                                                    hexColor,
                                                                            }}
                                                                        />{' '}
                                                                        <span>
                                                                            -
                                                                        </span>
                                                                    </>
                                                                )}
                                                                {variantLabel && (
                                                                    <span className="text-xs">
                                                                        (
                                                                        {
                                                                            variantLabel
                                                                        }
                                                                        )
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="font-mono text-xs tracking-tighter">
                                                                Sku daryza:{' '}
                                                                {field.sku}
                                                            </p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            type="button"
                                                            onClick={() =>
                                                                remove(index)
                                                            }
                                                            className="text-slate-400 hover:text-red-500"
                                                        >
                                                            <Trash2 className="size-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                            {errors.items && (
                                <p className="text-xs font-medium text-red-500">
                                    {errors.items.message}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* SIDEBAR */}
                    <aside className="space-y-6">
                        <div className="sticky top-6 space-y-6.5">
                            {/* VIGENCIA */}
                            <Controller
                                name="starts_at"
                                control={control}
                                render={({ field }) => (
                                    <div className="flex flex-col justify-between gap-3">
                                        <Label>Fecha Inicio</Label>
                                        <DatePicker
                                            value={field.value}
                                            onChange={field.onChange}
                                        />
                                        {errors.starts_at && (
                                            <p className="text-xs text-red-500">
                                                {errors.starts_at.message}
                                            </p>
                                        )}
                                    </div>
                                )}
                            />

                            <Controller
                                name="ends_at"
                                control={control}
                                render={({ field }) => (
                                    <div className="flex flex-col justify-between gap-3">
                                        <Label>Fecha Fin</Label>
                                        <DatePicker
                                            value={field.value}
                                            onChange={field.onChange}
                                        />
                                        {errors.ends_at && (
                                            <p className="text-xs text-red-500">
                                                {errors.ends_at.message}
                                            </p>
                                        )}
                                    </div>
                                )}
                            />

                            {/* ESTADO */}
                            <div className="rounded-xl border bg-white p-5">
                                <Controller
                                    name="is_active"
                                    control={control}
                                    render={({ field }) => (
                                        <div className="flex items-center justify-between">
                                            <Label className="cursor-pointer text-sm">
                                                Estado Activo
                                            </Label>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </div>
                                    )}
                                />
                            </div>

                            {/* RESUMEN Y ACCIÓN */}
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="h-12 w-full font-bold"
                            >
                                {isSubmitting
                                    ? 'Procesando...'
                                    : isEditing
                                      ? 'Actualizar Categoría'
                                      : 'Guardar Categoría'}
                            </Button>

                            {/* <Button
                                type="button"
                                variant="ghost"
                                className="w-full text-slate-400"
                                onClick={() => window.history.back()}
                            >
                                Cancelar y volver
                            </Button> */}
                        </div>
                    </aside>
                </div>
            </form>
        </FormProvider>
    );
}
