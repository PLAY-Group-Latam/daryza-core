/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import { useCallback, useEffect } from 'react';
import {
    Controller,
    FormProvider,
    useFieldArray,
    useForm,
} from 'react-hook-form';
import { z } from 'zod';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { SelectableVariant } from '@/types/products/dynamicCategories';
import debounce from 'lodash/debounce';
import { Check, Plus, Search, Trash2 } from 'lucide-react';

// --- ESQUEMA ZOD ---
const itemSchema = z.object({
    product_id: z.string().min(1),
    variant_id: z.string().min(1),
    quantity: z.coerce.number().min(1, 'Mínimo 1'),
    name: z.string().optional(),
    sku: z.string().optional(),
    color: z.string().optional(),
});

const packSchema = z
    .object({
        name: z.string().min(1, 'El nombre es obligatorio'),
        price: z.coerce.number().min(0.01, 'El precio debe ser mayor a 0'),
        promo_price: z.coerce.number().nullable().optional(),
        is_on_promotion: z.boolean().default(false),
        show_on_home: z.boolean().default(false),
        is_active: z.boolean().default(true),
        promo_start_at: z.string().nullable().optional(),
        promo_end_at: z.string().nullable().optional(),
        brief_description: z.string().nullable().optional(),
        items: z.array(itemSchema).min(1, 'Selecciona al menos un producto'),
    })
    .refine(
        (data) => {
            if (
                data.is_on_promotion &&
                data.promo_price &&
                data.promo_price >= data.price
            )
                return false;
            return true;
        },
        {
            message: 'El precio de oferta debe ser menor al normal',
            path: ['promo_price'],
        },
    );

type PackFormValues = z.infer<typeof packSchema>;

export default function FormPack({
    products, // Se mantiene por prop, aunque no se use en tabla
    pack,
    searchResults = [],
    filters,
}: {
    products: any[];
    pack?: any;
    searchResults: SelectableVariant[];
    filters?: { q?: string };
}) {
    const methods = useForm<PackFormValues>({
        resolver: zodResolver(packSchema) as any,
        defaultValues: {
            name: '',
            price: 0,
            promo_price: null,
            is_on_promotion: false,
            show_on_home: false,
            is_active: true,
            promo_start_at: '',
            promo_end_at: '',
            brief_description: '',
            items: [],
        },
    });

    const {
        control,
        handleSubmit,
        watch,
        reset,
        formState: { errors, isSubmitting },
    } = methods;
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'items',
    });

    const watchItems = watch('items') || [];
    const isOnPromotion = watch('is_on_promotion');

    useEffect(() => {
        if (pack) {
            reset({
                ...pack,
                promo_price: pack.promo_price ?? null,
                brief_description: pack.brief_description ?? '',
                promo_start_at: pack.promo_start_at ?? '',
                promo_end_at: pack.promo_end_at ?? '',
            });
        }
    }, [pack, reset]);

    const addVariantFromSearch = (variant: SelectableVariant) => {
        const alreadyExists = watchItems.some(
            (i) => i.variant_id === variant.id,
        );
        if (!alreadyExists) {
            append({
                product_id: variant.product_id || '',
                variant_id: variant.id,
                quantity: 1,
                name: variant.product_name,
                sku: variant.sku,
                color: variant.variant_name,
            });
        }
    };

    const handleSearch = useCallback(
        debounce((value: string) => {
            router.get(
                window.location.pathname,
                { q: value },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                    only: ['searchResults', 'filters'],
                },
            );
        }, 300),
        [],
    );

    const onSubmit = (data: PackFormValues) => {
        const url = pack ? `/packs/${pack.id}` : '/packs';
        router.post(
            url,
            { ...data, ...(pack && { _method: 'put' }) },
            {
                forceFormData: true,
                preserveScroll: true,
            },
        );
    };

    return (
        <FormProvider {...methods}>
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-10 pb-20"
            >
                <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_400px]">
                    <div className="space-y-10">
                        {/* SECCIÓN 1: INFORMACIÓN GENERAL */}
                        <div className="space-y-6">
                            <p className="text-xs font-bold tracking-widest text-gray-700 uppercase">
                                ● Información del Pack
                            </p>
                            <Controller
                                name="name"
                                control={control}
                                render={({ field }) => (
                                    <div className="space-y-2">
                                        <Label>Nombre del Pack *</Label>
                                        <Input
                                            {...field}
                                            placeholder="Ej: Combo Limpieza Total"
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
                                name="brief_description"
                                control={control}
                                render={({ field }) => (
                                    <div className="space-y-2">
                                        <Label>Descripción Breve</Label>
                                        <Textarea
                                            {...field}
                                            value={field.value ?? ''}
                                            className="h-28"
                                            placeholder="Resumen para el catálogo..."
                                        />
                                    </div>
                                )}
                            />
                        </div>

                        {/* SECCIÓN 2: BUSCADOR (ÚNICA VÍA DE SELECCIÓN) */}
                        <div className="space-y-4 rounded-3xl border bg-slate-50/50 p-6">
                            <div className="flex flex-col gap-1.5">
                                <Label className="text-xs font-bold tracking-wider text-slate-500 uppercase">
                                    Añadir productos por SKU
                                </Label>
                                <div className="relative">
                                    <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <Input
                                        placeholder="Busca el SKU daryza (mín. 3 letras)..."
                                        className="h-12 bg-white pl-11"
                                        defaultValue={filters?.q}
                                        onChange={(e) =>
                                            handleSearch(e.target.value)
                                        }
                                    />
                                </div>
                            </div>

                            {filters?.q && (
                                <div className="mt-4 grid max-h-80 grid-cols-1 gap-3 overflow-y-auto pr-2 md:grid-cols-2">
                                    {searchResults.length > 0 ? (
                                        searchResults.map((variant) => {
                                            const isAlreadyIn = watchItems.some(
                                                (i) =>
                                                    i.variant_id === variant.id,
                                            );
                                            return (
                                                <div
                                                    key={variant.id}
                                                    className="flex items-center justify-between rounded-xl border bg-white p-3 shadow-sm"
                                                >
                                                    <div className="min-w-0">
                                                        <p className="truncate text-[10px] font-bold text-blue-600 uppercase">
                                                            {
                                                                variant.product_name
                                                            }
                                                        </p>
                                                        <p className="truncate text-xs">
                                                            {
                                                                variant.variant_name
                                                            }
                                                        </p>
                                                        <p className="font-mono text-[10px] text-slate-400">
                                                            {variant.sku}
                                                        </p>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        size="icon"
                                                        variant={
                                                            isAlreadyIn
                                                                ? 'ghost'
                                                                : 'outline'
                                                        }
                                                        className="h-8 w-8 shrink-0"
                                                        onClick={() =>
                                                            addVariantFromSearch(
                                                                variant,
                                                            )
                                                        }
                                                        disabled={isAlreadyIn}
                                                    >
                                                        {isAlreadyIn ? (
                                                            <Check className="h-4 w-4 text-emerald-500" />
                                                        ) : (
                                                            <Plus className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <p className="col-span-full py-4 text-center text-xs text-slate-400">
                                            Sin resultados.
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* SECCIÓN 3: PROMOCIÓN (CAMPOS RESTAURADOS) */}
                        <div
                            className={`space-y-6 rounded-3xl border p-6 transition-colors ${isOnPromotion ? 'border-orange-200 bg-orange-50/30' : 'bg-gray-50/50'}`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Controller
                                        name="is_on_promotion"
                                        control={control}
                                        render={({ field }) => (
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        )}
                                    />
                                    <Label className="text-sm font-bold tracking-wider uppercase">
                                        Activar Oferta
                                    </Label>
                                </div>
                            </div>

                            {isOnPromotion && (
                                <div className="grid grid-cols-1 gap-4 border-t pt-4 md:grid-cols-3">
                                    <Controller
                                        name="promo_price"
                                        control={control}
                                        render={({ field }) => (
                                            <div className="space-y-2">
                                                <Label className="text-xs">
                                                    Precio Oferta
                                                </Label>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    {...field}
                                                    value={field.value ?? ''}
                                                    className="bg-white"
                                                />
                                                {errors.promo_price && (
                                                    <p className="text-[10px] text-red-500">
                                                        {
                                                            errors.promo_price
                                                                .message
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    />
                                    <Controller
                                        name="promo_start_at"
                                        control={control}
                                        render={({ field }) => (
                                            <div className="space-y-2">
                                                <Label className="text-xs">
                                                    Fecha Inicio
                                                </Label>
                                                <Input
                                                    type="datetime-local"
                                                    {...field}
                                                    value={field.value ?? ''}
                                                    className="bg-white"
                                                />
                                            </div>
                                        )}
                                    />
                                    <Controller
                                        name="promo_end_at"
                                        control={control}
                                        render={({ field }) => (
                                            <div className="space-y-2">
                                                <Label className="text-xs">
                                                    Fecha Fin
                                                </Label>
                                                <Input
                                                    type="datetime-local"
                                                    {...field}
                                                    value={field.value ?? ''}
                                                    className="bg-white"
                                                />
                                            </div>
                                        )}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* BARRA LATERAL: ESTADOS, PRECIO Y RESUMEN */}
                    <aside className="space-y-6">
                        <div className="space-y-6 rounded-3xl border bg-white p-6 shadow-sm">
                            <p className="text-xs font-bold tracking-widest text-gray-700 uppercase">
                                ● Publicación
                            </p>

                            <Controller
                                name="is_active"
                                control={control}
                                render={({ field }) => (
                                    <div className="flex items-center justify-between">
                                        <Label>Visible en Web</Label>
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
                                    <div className="flex items-center justify-between">
                                        <Label>Destacar en Inicio</Label>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </div>
                                )}
                            />

                            <Controller
                                name="price"
                                control={control}
                                render={({ field }) => (
                                    <div className="space-y-2 border-t pt-4">
                                        <Label className="font-bold">
                                            Precio Regular *
                                        </Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            {...field}
                                            className="bg-slate-50 text-lg font-bold"
                                        />
                                        {errors.price && (
                                            <p className="text-xs text-red-500">
                                                {errors.price.message}
                                            </p>
                                        )}
                                    </div>
                                )}
                            />
                        </div>

                        {/* RESUMEN DE ITEMS SELECCIONADOS */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-2">
                                <p className="text-xs font-bold text-slate-500 uppercase">
                                    Items en Pack
                                </p>
                                <Badge variant="secondary">
                                    {fields.length}
                                </Badge>
                            </div>

                            <div className="space-y-3">
                                {fields.map((item, index) => (
                                    <div
                                        key={item.id}
                                        className="group relative flex flex-col gap-2 rounded-2xl border bg-white p-4 shadow-sm"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="min-w-0">
                                                <p className="truncate text-xs font-bold uppercase">
                                                    {item.name}
                                                </p>
                                                <p className="font-mono text-[10px] text-slate-400">
                                                    SKU: {item.sku}
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => remove(index)}
                                                className="text-slate-300 hover:text-red-500"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                        <div className="mt-1 flex items-center gap-2">
                                            <span className="text-[10px] text-slate-500">
                                                CANT:
                                            </span>
                                            <Controller
                                                name={`items.${index}.quantity`}
                                                control={control}
                                                render={({ field }) => (
                                                    <Input
                                                        type="number"
                                                        {...field}
                                                        className="h-8 w-20 text-center text-xs"
                                                    />
                                                )}
                                            />
                                        </div>
                                    </div>
                                ))}
                                {errors.items && (
                                    <p className="px-2 text-center text-xs text-red-500">
                                        {errors.items.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="h-12 w-full rounded-2xl bg-gray-900 font-bold text-white hover:bg-gray-800"
                        >
                            {isSubmitting
                                ? 'Guardando...'
                                : 'Confirmar y Guardar'}
                        </Button>
                    </aside>
                </div>
            </form>
        </FormProvider>
    );
}
