/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { router, useForm } from '@inertiajs/react';
import debounce from 'lodash/debounce';
import React, { useCallback, useState } from 'react';

// Shadcn UI
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Check, PackageSearch, Plus, Search, Tag, Trash2 } from 'lucide-react';

// Tu componente de Slug
import { SlugInput } from '../../slug-text';

interface DynamicCategoriesFormProps {
    dynamicCategory?: any;
    selectedVariants?: any[];
    searchResults: any[]; // Ahora es un array plano de variantes
    filters?: { q?: string };
}

export default function DynamicCategoriesForm({
    dynamicCategory,
    selectedVariants = [],
    searchResults = [],
    filters,
}: DynamicCategoriesFormProps) {
    const [assignedVariants, setAssignedVariants] =
        useState<any[]>(selectedVariants);

    const { data, setData, post, put, processing, errors } = useForm({
        name: dynamicCategory?.name || '',
        slug: dynamicCategory?.slug || '',
        is_active: dynamicCategory?.is_active ?? true,
        starts_at: dynamicCategory?.starts_at || '',
        ends_at: dynamicCategory?.ends_at || '',
        variant_ids:
            dynamicCategory?.variant_ids ||
            selectedVariants.map((v) => v.id) ||
            [],
    });

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

    const addVariant = (variant: any) => {
        if (data.variant_ids.includes(variant.id)) return;
        const newIds = [...data.variant_ids, variant.id];
        setData('variant_ids', newIds);
        setAssignedVariants((prev) => [variant, ...prev]);
    };

    const removeVariant = (id: string) => {
        // Cambiado a string por ULID
        const newIds = data.variant_ids.filter((vId) => vId !== id);
        setData('variant_ids', newIds);
        setAssignedVariants((prev) => prev.filter((v) => v.id !== id));
    };

    const formatPrice = (price: number | string) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
        }).format(Number(price));
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        // post o put...
    };

    return (
        <form onSubmit={submit} className="mx-auto max-w-4xl space-y-8 pb-32">
            {/* SECCIÓN IDENTIDAD Y FECHAS (Sin cambios) */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                    <Label className="text-sm font-semibold">
                        Nombre Público
                    </Label>
                    <Input
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder="Ej. Ofertas de Verano"
                        className="h-11"
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <SlugInput
                        label="Slug / URL"
                        source={data.name}
                        value={data.slug}
                        onChange={(val) => setData('slug', val)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <div className="flex flex-col gap-2">
                    <Label className="text-sm font-semibold">Inicio</Label>
                    <Input
                        type="datetime-local"
                        className="h-11"
                        value={data.starts_at}
                        onChange={(e) => setData('starts_at', e.target.value)}
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <Label className="text-sm font-semibold">Fin</Label>
                    <Input
                        type="datetime-local"
                        className="h-11"
                        value={data.ends_at}
                        onChange={(e) => setData('ends_at', e.target.value)}
                    />
                </div>
                <div className="flex items-end">
                    <div className="flex h-11 w-full items-center justify-between rounded-xl border bg-slate-50/50 px-4">
                        <Label className="text-sm font-bold text-slate-600">
                            Activo
                        </Label>
                        <Switch
                            checked={data.is_active}
                            onCheckedChange={(v) => setData('is_active', v)}
                        />
                    </div>
                </div>
            </div>

            <hr className="border-slate-100" />

            {/* BUSCADOR DE PRODUCTOS (SIMPLIFICADO PARA LISTA PLANA) */}
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label className="text-sm font-bold text-slate-800">
                        Añadir productos por SKU
                    </Label>
                    <div className="relative">
                        <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                            placeholder="Ingrese SKU (mínimo 3 caracteres)..."
                            className="h-12 rounded-xl border-blue-200 pl-11 shadow-sm focus:ring-blue-500"
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                    </div>
                </div>

                {filters?.q && (
                    <div className="max-h-80 space-y-1 overflow-y-auto rounded-xl border border-blue-100 bg-blue-50/30 p-2 shadow-inner">
                        {searchResults.length > 0 ? (
                            // YA NO USAMOS flatMap, porque searchResults ya son variantes directas
                            searchResults.map((variant: any) => {
                                const isAlreadyIn = data.variant_ids.includes(
                                    variant.id,
                                );
                                return (
                                    <div
                                        key={variant.id}
                                        className="mb-1 flex items-center justify-between rounded-lg border border-blue-50 bg-white p-3 shadow-sm transition-all hover:border-blue-200"
                                    >
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-[10px] font-black tracking-wider text-blue-500 uppercase">
                                                {variant.product_name}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-slate-700">
                                                    {variant.name}
                                                </span>
                                                <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-500">
                                                    {variant.sku}
                                                </span>
                                            </div>
                                            <span className="text-xs font-semibold text-emerald-600">
                                                {formatPrice(variant.price)}
                                            </span>
                                        </div>
                                        <Button
                                            type="button"
                                            size="sm"
                                            disabled={isAlreadyIn}
                                            onClick={() => addVariant(variant)}
                                            className={`h-9 rounded-lg px-4 ${isAlreadyIn ? 'bg-slate-100 text-slate-400' : 'bg-blue-600 shadow-sm hover:bg-blue-700'}`}
                                        >
                                            {isAlreadyIn ? (
                                                <Check className="h-4 w-4" />
                                            ) : (
                                                <Plus className="mr-1 h-4 w-4" />
                                            )}
                                            {isAlreadyIn ? 'Añadido' : 'Añadir'}
                                        </Button>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="p-8 text-center text-sm text-slate-500 italic">
                                No se encontraron resultados para "{filters.q}"
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* TABLA DE SELECCIONADOS (Sin cambios importantes) */}
            <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-slate-400" />
                        <Label className="text-sm font-bold tracking-wider text-slate-700 uppercase">
                            Variantes seleccionadas ({assignedVariants.length})
                        </Label>
                    </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase">
                            <tr>
                                <th className="px-4 py-3">
                                    Producto / Variante
                                </th>
                                <th className="px-4 py-3">SKU</th>
                                <th className="px-4 py-3">Precio Base</th>
                                <th className="px-4 py-3 text-right">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {assignedVariants.length > 0 ? (
                                assignedVariants.map((variant: any) => (
                                    <tr
                                        key={variant.id}
                                        className="group transition-colors hover:bg-slate-50/50"
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase">
                                                    {variant.product_name ||
                                                        variant.product?.name}
                                                </span>
                                                <span className="leading-tight font-bold text-slate-900">
                                                    {variant.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 font-mono text-[11px] text-slate-400">
                                            {variant.sku}
                                        </td>
                                        <td className="px-4 py-3 font-semibold text-slate-700">
                                            {formatPrice(variant.price)}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    removeVariant(variant.id)
                                                }
                                                className="h-8 w-8 text-slate-400 hover:bg-red-50 hover:text-red-600"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="py-16 text-center"
                                    >
                                        <PackageSearch className="mx-auto mb-2 h-10 w-10 text-slate-200" />
                                        <p className="text-sm text-slate-400">
                                            Selecciona variantes por SKU arriba.
                                        </p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* BARRA DE ACCIÓN FIJA */}
            <div className="fixed right-0 bottom-0 left-0 z-30 border-t bg-white/95 p-4 shadow-lg backdrop-blur-md">
                <div className="mx-auto flex max-w-4xl items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col border-r pr-4">
                            <span className="text-2xl leading-none font-black text-blue-600">
                                {data.variant_ids.length}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">
                                Items
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => window.history.back()}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={
                                processing ||
                                data.variant_ids.length === 0 ||
                                !data.name
                            }
                            className="bg-blue-600 px-10 font-bold shadow-md transition-all hover:bg-blue-700 active:scale-95"
                        >
                            {processing
                                ? 'Guardando...'
                                : dynamicCategory
                                  ? 'Actualizar'
                                  : 'Crear Dinámica'}
                        </Button>
                    </div>
                </div>
            </div>
        </form>
    );
}
