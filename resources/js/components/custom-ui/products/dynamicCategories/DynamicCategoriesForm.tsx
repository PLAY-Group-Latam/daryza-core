/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import debounce from 'lodash/debounce';
import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

// Shadcn UI Components
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import products from '@/routes/products';
import {
    DynamicCategory,
    SelectableVariant,
} from '@/types/products/dynamicCategories';
import { Check, Plus, Search } from 'lucide-react';
import { DatePicker } from '../../DatePicker';
import { SelectedVariantsTable } from '../../SelectVariantTable';
import { SlugInput } from '../../slug-text';

const formSchema = z.object({
    name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
    slug: z.string().min(3, 'El slug es obligatorio'),
    is_active: z.boolean(),
    starts_at: z.date({
        error: (issue) =>
            issue.input === undefined
                ? 'La fecha es obligatorio'
                : 'La Fecha es inválida',
    }),
    ends_at: z.date({
        error: (issue) =>
            issue.input === undefined
                ? 'La fecha es obligatorio'
                : 'La Fecha es inválida',
    }),
    variant_ids: z
        .array(z.union([z.string(), z.number()]))
        .min(1, 'Selecciona al menos un producto'),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
    dynamicCategory?: DynamicCategory;
    selectedVariants?: SelectableVariant[];
    searchResults: SelectableVariant[];
    filters?: { q?: string };
}

export default function DynamicCategoriesForm({
    dynamicCategory,
    selectedVariants = [],
    searchResults = [],
    filters,
}: Props) {
    const [assignedVariants, setAssignedVariants] =
        useState<SelectableVariant[]>(selectedVariants);
    console.log(' oaaaaaaaaaaaaaa', dynamicCategory);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: dynamicCategory?.name || '',
            slug: dynamicCategory?.slug || '',
            is_active: dynamicCategory?.is_active ?? true,
            starts_at: dynamicCategory?.starts_at
                ? new Date(dynamicCategory.starts_at)
                : undefined,
            ends_at: dynamicCategory?.ends_at
                ? new Date(dynamicCategory.ends_at)
                : undefined,
            variant_ids:
                dynamicCategory?.variants_ids ||
                selectedVariants.map((v) => v.id) ||
                [],
        },
    });

    // Extraemos el estado de carga directamente de RHF
    const { isSubmitting } = form.formState;

    const renderVariantName = (name: string) => {
        const isHex = /^#([A-Fa-f0-9]{3,6})$/.test(name);
        if (isHex) {
            return (
                <div
                    className="h-4 w-4 rounded-full border border-slate-200 shadow-sm"
                    style={{ backgroundColor: name }}
                />
            );
        }
        return <span>{name}</span>;
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

    const addVariant = (variant: SelectableVariant) => {
        const currentIds = form.getValues('variant_ids');
        if (currentIds.includes(variant.id)) return;

        form.setValue('variant_ids', [...currentIds, variant.id], {
            shouldValidate: true,
        });
        setAssignedVariants((prev) => [variant, ...prev]);
    };

    const removeVariant = (id: string | number) => {
        const currentIds = form.getValues('variant_ids');
        form.setValue(
            'variant_ids',
            currentIds.filter((vId) => vId !== id),
            { shouldValidate: true },
        );
        setAssignedVariants((prev) => prev.filter((v) => v.id !== id));
    };

    function onSubmit(values: FormValues) {
        const url = dynamicCategory
            ? products.dynamicCategories.update(dynamicCategory.id)
            : products.dynamicCategories.store.url();

        const method = dynamicCategory ? 'put' : 'post';

        router[method](url, values as any, {
            onBefore: () => {
                /* RHF ya maneja isSubmitting al ser async */
            },
        });
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="max-w-4xl space-y-8 pb-32"
            >
                {/* IDENTIDAD */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem className="flex flex-col justify-between">
                                <FormLabel>Nombre Público</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Ej. Ofertas de Verano"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="slug"
                        render={({ field }) => (
                            <FormItem>
                                <SlugInput
                                    label="Slug / URL"
                                    source={form.watch('name')}
                                    value={field.value}
                                    onChange={field.onChange}
                                />
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* FECHAS Y ESTADO */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                    <FormField
                        control={form.control}
                        name="starts_at"
                        render={({ field }) => (
                            <FormItem className="flex flex-col justify-between gap-2">
                                <FormLabel>Fecha de Inicio</FormLabel>
                                <FormControl>
                                    <DatePicker
                                        value={field.value}
                                        onChange={field.onChange}
                                        placeholder="Seleccionar fecha"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="ends_at"
                        render={({ field }) => (
                            <FormItem className="flex flex-col justify-between gap-2">
                                <FormLabel>Fecha de Fin</FormLabel>
                                <FormControl>
                                    <DatePicker
                                        value={field.value}
                                        onChange={field.onChange}
                                        placeholder="Seleccionar fecha"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="is_active"
                        render={({ field }) => (
                            <FormItem className="flex flex-col justify-between gap-2">
                                <Label className="text-sm font-medium">
                                    Estado
                                </Label>
                                <div className="flex h-9 items-center justify-between rounded-md border px-3">
                                    <span className="pointer-events-none text-xs text-slate-500">
                                        Activo
                                    </span>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </div>
                            </FormItem>
                        )}
                    />
                </div>

                {/* BUSCADOR */}
                <div>
                    <div className="flex flex-col gap-1.5">
                        <Label className="pb-2">
                            Añadir productos por SKU DARYZA
                        </Label>
                        <div className="relative">
                            <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <Input
                                placeholder="Ingrese el SKU daryza (mínimo 3 caracteres)..."
                                className="pl-11"
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    {filters?.q && (
                        <div className="mt-4 flex max-h-60 flex-col gap-2 overflow-y-auto">
                            {searchResults.length > 0 ? (
                                searchResults.map((variant) => {
                                    const isAlreadyIn = form
                                        .watch('variant_ids')
                                        .includes(variant.id);
                                    return (
                                        <div
                                            key={variant.id}
                                            className="flex items-center justify-between rounded-xl border bg-white p-4"
                                        >
                                            <div className="space-y-2">
                                                <p className="text-[10px] font-bold text-blue-600 uppercase">
                                                    {variant.product_name}
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    {renderVariantName(
                                                        variant.variant_name,
                                                    )}
                                                    <span className="font-mono text-xs text-slate-500">
                                                        {variant.sku}
                                                    </span>
                                                </div>
                                            </div>
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant={
                                                    isAlreadyIn
                                                        ? 'ghost'
                                                        : 'default'
                                                }
                                                onClick={() =>
                                                    addVariant(variant)
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
                                <p className="py-4 text-center text-xs text-slate-400">
                                    No hay resultados
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* TABLA DE PRODUCTOS */}
                {/* <div className="overflow-hidden rounded-xl border bg-white">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase">
                            <tr>
                                <th className="p-3 text-left">
                                    Producto / Variante
                                </th>
                                <th className="p-3 text-left">SKU DARYZA</th>
                                <th className="p-3 text-center">Promo</th>
                                <th className="p-3 text-right">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {assignedVariants.length > 0 ? (
                                assignedVariants.map((variant) => (
                                    <tr
                                        key={variant.id}
                                        className="hover:bg-slate-50/50"
                                    >
                                        <td className="p-3">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase">
                                                    {variant.product_name}
                                                </span>
                                                <div className="font-bold">
                                                    {renderVariantName(
                                                        variant.variant_name,
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-3 font-mono text-xs text-slate-500">
                                            {variant.sku}
                                        </td>
                                        <td className="p-3 text-center">
                                            {variant.is_on_promo ? (
                                                <div className="flex justify-center">
                                                    Si
                                                </div>
                                            ) : (
                                                <span>No</span>
                                            )}
                                        </td>
                                        <td className="p-3 text-right">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    removeVariant(variant.id)
                                                }
                                                className="hover:text-red-600"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr className="w-full">
                                    <td
                                        colSpan={4}
                                        className="w-full p-8 text-center text-slate-400"
                                    >
                                        <PackageSearch className="mx-auto mb-2 h-8 w-8 opacity-20" />
                                        Selecciona al menos un producto
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div> */}
                <SelectedVariantsTable
                    variants={assignedVariants}
                    onRemove={removeVariant}
                    pageSize={5}
                />

                {/* BARRA DE ACCIÓN FIJA */}
                <div className="py-4">
                    <div className="mx-auto flex max-w-4xl items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-black text-blue-600">
                                {form.watch('variant_ids').length}
                            </span>
                            <span className="text-[10px] leading-none font-bold text-slate-400 uppercase">
                                Items
                                <br />
                                Seleccionados
                            </span>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => window.history.back()}
                                disabled={isSubmitting}
                            >
                                Volver
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-blue-600 px-10 hover:bg-blue-700"
                            >
                                {isSubmitting
                                    ? 'Guardando...'
                                    : dynamicCategory
                                      ? 'Actualizar'
                                      : 'Crear'}
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </Form>
    );
}
