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
import { Textarea } from '@/components/ui/textarea';
import products from '@/routes/products';
import { SearchResult } from '@/types/products/packs';
import { PackagePlus, Trash2 } from 'lucide-react';
import { DatePicker } from '../../DatePicker';
import { SlugInput } from '../../slug-text';
import { PackProductSearch } from './SearchProduct';

const packSchema = z
    .object({
        name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
        slug: z.string().min(3, 'El slug es obligatorio'),
        price: z.coerce.number().min(0.01, 'El precio debe ser mayor a 0'),
        promo_price: z.coerce.number().nullable().optional(),
        is_on_promotion: z.boolean().default(false),
        show_on_home: z.boolean().default(false),
        is_active: z.boolean().default(true),
        promo_start_at: z.date().optional(),
        promo_end_at: z.date().optional(),
        brief_description: z.string().nullable().optional(),
        stock: z.coerce.number().min(0, 'El stock no puede ser negativo'),
        description: z.string().nullable().optional(),
        items: z
            .array(
                z.object({
                    variant_id: z.string(),
                    product_id: z.string(),
                    sku: z.string(),
                    product_name: z.string(),
                    quantity: z.coerce.number().min(1, 'Mínimo 1'),
                }),
            )
            .min(1, 'El pack debe tener al menos un producto'),
    })
    .refine(
        (data) => {
            if (data.is_on_promotion) {
                return !!data.promo_start_at && !!data.promo_end_at;
            }
            return true;
        },
        {
            message: 'Fechas obligatorias en promoción',
            path: ['promo_start_at'],
        },
    )
    .refine(
        (data) => {
            if (data.is_on_promotion && data.promo_price && data.price) {
                return data.promo_price < data.price;
            }
            return true;
        },
        {
            message: 'El precio de oferta debe ser menor al precio regular',
            path: ['promo_price'],
        },
    );

type PackFormValues = z.infer<typeof packSchema>;
interface Props {
    searchResults?: SearchResult[];
    filters?: { q?: string };
}

export default function CreatePackForm({ searchResults = [] }: Props) {
    const methods = useForm<PackFormValues>({
        resolver: zodResolver(packSchema) as any,
        defaultValues: {
            name: '',
            slug: '',
            price: 0,
            stock: 0,
            promo_price: null,
            is_on_promotion: false,
            show_on_home: false,
            is_active: true,
            promo_start_at: undefined,
            promo_end_at: undefined,
            brief_description: '',
            description: '',
            items: [],
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
    const isOnPromotion = watch('is_on_promotion');
    const packName = watch('name');

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
            quantity: 1,
        });
    };

    const onSubmit = (values: PackFormValues) => {
        router.post(products.packs.store.url(), values, {
            preserveScroll: true,
        });
    };

    const onError = (errors: any) => {
        console.log('ERRORES:', errors);
    };

    return (
        <FormProvider {...methods}>
            <form
                onSubmit={handleSubmit(onSubmit, onError)}
                className="space-y-8 pb-20"
            >
                <div className="flex flex-col gap-2">
                    <h1 className="flex items-center gap-3 text-2xl font-black text-slate-900">
                        <PackagePlus className="size-7" />
                        Nuevo Pack
                    </h1>
                    <p className="text-sm">
                        Configura los datos básicos e identidad del pack
                        comercial.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_350px]">
                    <div className="space-y-8">
                        {/* SECCIÓN: IDENTIDAD */}
                        <div className="space-y-6">
                            <Controller
                                name="name"
                                control={control}
                                render={({ field }) => (
                                    <div className="flex flex-col gap-3">
                                        <Label>Nombre del Pack *</Label>
                                        <Input
                                            {...field}
                                            placeholder="Ej: Combo Verano 2024"
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
                                        source={packName}
                                        value={field.value}
                                        onChange={field.onChange}
                                    />
                                )}
                            />

                            <div className="grid grid-cols-1 gap-6">
                                <Controller
                                    name="brief_description"
                                    control={control}
                                    render={({ field }) => (
                                        <div className="flex flex-col gap-3">
                                            <Label>Descripción Breve</Label>
                                            <Textarea
                                                {...field}
                                                value={field.value ?? ''}
                                                className="min-h-[80px] resize-none"
                                            />
                                        </div>
                                    )}
                                />
                                <Controller
                                    name="description"
                                    control={control}
                                    render={({ field }) => (
                                        <div className="flex flex-col gap-3">
                                            <Label>Descripción Completa</Label>
                                            <Textarea
                                                {...field}
                                                value={field.value ?? ''}
                                                className="min-h-[180px]"
                                            />
                                        </div>
                                    )}
                                />
                            </div>
                        </div>

                        {/* PRODUCTOS */}
                        <div className="space-y-4">
                            <div className="flex flex-col gap-3">
                                <Label>Productos incluidos en el Pack</Label>

                                <PackProductSearch
                                    searchResults={searchResults}
                                    searchUrl={products.packs.create.url()} // O edit.url(pack.id) en el otro form
                                    onSelect={(variant) => addProduct(variant)}
                                />
                            </div>

                            <div className="rounded-md border bg-slate-50/30">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>
                                                Producto Variante
                                            </TableHead>
                                            <TableHead className="w-24 text-center">
                                                Cant.
                                            </TableHead>
                                            <TableHead className="w-10"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {fields.map((field, index) => {
                                            // 1. Extraemos el HEX (si existe)
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

                                            // 3. Extraemos el texto de la variante (ej: "G")
                                            // Quitamos el hex y el guion del contenido de los paréntesis
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
                                                    className="bg-white"
                                                >
                                                    <TableCell>
                                                        <div className="flex flex-col gap-1.5">
                                                            <div className="flex items-center gap-2">
                                                                {/* Nombre del Producto */}
                                                                <span className="text-sm leading-none font-bold text-slate-900">
                                                                    {cleanName}
                                                                </span>
                                                                {/* El Guion y el Color (Solo si hay Hex) */}
                                                                {/* El texto extra (G, M, etc) */}
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
                                                                    <span className="text-sm">
                                                                        (
                                                                        {
                                                                            variantLabel
                                                                        }
                                                                        )
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {/* SKU abajo siempre limpio */}
                                                            <p className="font-mono text-xs">
                                                                Sku daryza:
                                                                {field.sku}
                                                            </p>
                                                        </div>
                                                    </TableCell>

                                                    <TableCell>
                                                        <Input
                                                            type="number"
                                                            min="1"
                                                            {...methods.register(
                                                                `items.${index}.quantity`,
                                                            )}
                                                            className="mx-auto h-8 w-20 text-center font-bold"
                                                        />
                                                    </TableCell>

                                                    <TableCell className="text-right">
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
                        <div className="sticky top-6 space-y-4">
                            <Controller
                                name="stock"
                                control={control}
                                render={({ field }) => (
                                    <div className="flex flex-col gap-3">
                                        <Label>Stock Inicial</Label>
                                        <Input type="number" {...field} />
                                        {errors.stock && (
                                            <p className="text-xs text-red-500">
                                                {errors.stock.message}
                                            </p>
                                        )}
                                    </div>
                                )}
                            />
                            <Controller
                                name="price"
                                control={control}
                                render={({ field }) => (
                                    <div className="flex flex-col gap-3">
                                        <Label>Precio Regular *</Label>
                                        <div className="relative">
                                            <span className="absolute top-1/2 left-4 -translate-y-1/2 text-sm">
                                                S/
                                            </span>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                {...field}
                                                className="pl-10"
                                            />
                                        </div>
                                        {errors.price && (
                                            <p className="text-xs text-red-500">
                                                {errors.price.message}
                                            </p>
                                        )}
                                    </div>
                                )}
                            />
                            <Controller
                                name="is_on_promotion"
                                control={control}
                                render={({ field }) => (
                                    <div className="flex items-center justify-between rounded-lg border p-4">
                                        <Label className="cursor-pointer">
                                            ¿Está en promoción?
                                        </Label>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </div>
                                )}
                            />

                            {isOnPromotion && (
                                <div className="flex flex-col gap-4 rounded-xl border px-4 py-5">
                                    <Controller
                                        name="promo_price"
                                        control={control}
                                        render={({ field }) => (
                                            <div className="flex flex-col gap-3">
                                                <Label>Precio Promo</Label>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="0"
                                                    {...field}
                                                    value={field.value ?? ''}
                                                />
                                                {errors.promo_price && (
                                                    <p className="text-xs text-red-500">
                                                        {String(
                                                            errors.promo_price
                                                                .message,
                                                        )}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    />
                                    <Controller
                                        name="promo_start_at"
                                        control={control}
                                        render={({ field }) => (
                                            <div className="flex flex-col gap-3">
                                                <Label>Inicia</Label>
                                                <DatePicker
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                />
                                                {errors.promo_start_at && (
                                                    <p className="text-xs text-red-500">
                                                        {String(
                                                            errors
                                                                .promo_start_at
                                                                .message,
                                                        )}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    />
                                    <Controller
                                        name="promo_end_at"
                                        control={control}
                                        render={({ field }) => (
                                            <div className="flex flex-col gap-3">
                                                <Label>Finaliza</Label>
                                                <DatePicker
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                />
                                            </div>
                                        )}
                                    />
                                </div>
                            )}

                            <div className="space-y-4">
                                <Controller
                                    name="is_active"
                                    control={control}
                                    render={({ field }) => (
                                        <div className="flex items-center justify-between rounded-lg border p-4">
                                            <Label className="text-sm">
                                                ¿Estado Activo?
                                            </Label>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </div>
                                    )}
                                />
                                <Controller
                                    name="show_on_home"
                                    control={control}
                                    render={({ field }) => (
                                        <div className="flex items-center justify-between rounded-lg border p-4">
                                            <Label className="text-sm">
                                                ¿Mostrar en Inicio?
                                            </Label>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </div>
                                    )}
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="h-12 w-full font-bold"
                            >
                                {isSubmitting ? 'Guardando...' : 'Crear Pack'}
                            </Button>
                        </div>
                    </aside>
                </div>
            </form>
        </FormProvider>
    );
}
