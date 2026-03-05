'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import type { FieldErrors, Resolver } from 'react-hook-form';
import {
    Controller,
    FormProvider,
    useFieldArray,
    useForm,
} from 'react-hook-form';
import { z } from 'zod';

import { UploadMultiple } from '@/components/custom-ui/UploadMultiple';
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
import { ProductPack } from '@/types/products/packs';
import { VariantSearchResult } from '@/types/products/search';
import { Package, Trash2 } from 'lucide-react';
import { DatePicker } from '../../DatePicker';
import { SlugInput } from '../../slug-text';
import { VariantIdentity } from '../shared/VariantIdentity';
import { PackProductSearch } from './SearchProduct';
import { buildPackFormData } from './utils/buildPackFormData';

const packSchema = z
    .object({
        name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
        slug: z.string().min(3, 'El slug es obligatorio'),
        price: z.coerce.number().min(0.01, 'El precio debe ser mayor a 0'),
        promo_price: z.coerce.number().nullable().optional(),
        is_on_promotion: z.boolean().default(false),
        show_on_home: z.boolean().default(false),
        is_active: z.boolean().default(true),
        promo_start_at: z.any().optional(),
        promo_end_at: z.any().optional(),
        brief_description: z.string().nullable().optional(),
        stock: z.coerce.number().min(0, 'El stock no puede ser negativo'),
        description: z.string().nullable().optional(),
        media: z.array(z.any()).optional(),
        items: z
            .array(
                z.object({
                    variant_id: z.string(),
                    product_id: z.string(),
                    sku: z.string(),
                    product_name: z.string(),
                    variant_name: z.string(),
                    image: z.string().nullable().optional(),
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
    );

type PackFormValues = z.infer<typeof packSchema>;

interface Props {
    pack: ProductPack;
    searchResults: VariantSearchResult[];
    filters?: { q?: string };
}

export default function EditPackForm({ pack, searchResults = [] }: Props) {
    const methods = useForm<PackFormValues>({
        resolver: zodResolver(packSchema) as Resolver<PackFormValues>,
        defaultValues: {
            name: pack.name || '',
            slug: pack.slug || '',
            price: pack.price ? Number(pack.price) : 0,
            promo_price: pack.promo_price ? Number(pack.promo_price) : null,
            stock: pack.stock ? Number(pack.stock) : 0,
            is_on_promotion: pack.is_on_promotion || false,
            is_active: pack.is_active || false,
            show_on_home: pack.show_on_home || false,
            brief_description: pack.brief_description || '',
            description: pack.description || '',
            media: pack.media ?? [],
            promo_start_at: pack.promo_start_at
                ? new Date(pack.promo_start_at)
                : undefined,
            promo_end_at: pack.promo_end_at
                ? new Date(pack.promo_end_at)
                : undefined,
            items:
                pack.items?.map((item) => ({
                    variant_id: String(item.variant_id),
                    product_id: String(item.product_id),
                    sku: item.sku,
                    product_name: item.product_name,
                    variant_name: item.variant_name,
                    image: item.image ?? null,
                    quantity: item.quantity || 1,
                })) || [],
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

    const addProduct = (variant: VariantSearchResult) => {
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
            product_name: variant.product_name,
            quantity: 1,
            variant_name: variant.variant_name,
            image: variant.image ?? null,
        });
    };

    const onSubmit = (values: PackFormValues) => {
        const formData = buildPackFormData(values, true);
        router.post(products.packs.update.url(pack.id), formData, {
            preserveScroll: true,
            forceFormData: true,
        });
    };

    const onError = (errors: FieldErrors<PackFormValues>) => {
        void errors;
    };
    return (
        <FormProvider {...methods}>
            <form
                onSubmit={handleSubmit(onSubmit, onError)}
                className="space-y-8 pb-20"
            >
                <div className="flex flex-col gap-3">
                    <h1 className="flex items-center gap-3 text-2xl font-black text-slate-900">
                        <Package className="size-7" />
                        Editando: {pack.name}
                    </h1>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_350px]">
                    <div className="space-y-8">
                        {/* 1. IDENTIDAD Y DESCRIPCIONES */}
                        <div className="space-y-6">
                            <Controller
                                name="name"
                                control={control}
                                render={({ field }) => (
                                    <div className="flex flex-col justify-between gap-3">
                                        <Label>Nombre del Pack *</Label>
                                        <Input {...field} />
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

                            <Controller
                                name="brief_description"
                                control={control}
                                render={({ field }) => (
                                    <div className="flex flex-col gap-3">
                                        <Label>Descripción Breve</Label>
                                        <Textarea
                                            {...field}
                                            value={field.value ?? ''}
                                            className="h-20"
                                        />
                                    </div>
                                )}
                            />

                            <Controller
                                name="description"
                                control={control}
                                render={({ field }) => (
                                    <div className="flex flex-col gap-3">
                                        <Label>Descripción Detallada</Label>
                                        <Textarea
                                            {...field}
                                            value={field.value ?? ''}
                                            className="h-40"
                                        />
                                    </div>
                                )}
                            />
                        </div>

                        {/* 2. PRODUCTOS COMPONENTES */}
                        <div className="space-y-4">
                            <div className="flex flex-col gap-3">
                                <Label>Productos incluidos en el Pack</Label>
                                <PackProductSearch
                                    searchResults={searchResults}
                                    searchUrl={products.packs.edit.url(pack.id)} // URL de edición con el ID
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
                                            return (
                                                <TableRow
                                                    key={field.id}
                                                    className="bg-white"
                                                >
                                                    <TableCell>
                                                        <VariantIdentity
                                                            productName={
                                                                field.product_name
                                                            }
                                                            variantName={
                                                                field.variant_name
                                                            }
                                                            sku={field.sku}
                                                            image={field.image}
                                                            nameClassName="text-sm leading-none font-bold text-slate-900"
                                                        />
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
                            {/* PRECIOS */}
                            <div className="space-y-4">
                                <Controller
                                    name="media"
                                    control={control}
                                    render={({ field }) => (
                                        <div className="flex flex-col gap-2">
                                            <Label>Galería del Pack</Label>
                                            <UploadMultiple
                                                value={field.value ?? []}
                                                onFilesChange={field.onChange}
                                                accept="both"
                                            />
                                            <p className="text-xs text-slate-500">
                                                Puedes ordenar arrastrando los
                                                archivos.
                                            </p>
                                        </div>
                                    )}
                                />
                                <Controller
                                    name="stock"
                                    control={control}
                                    render={({ field }) => (
                                        <div className="flex flex-col gap-3">
                                            <Label>Stock Actual</Label>
                                            <Input type="number" {...field} />
                                        </div>
                                    )}
                                />
                                <Controller
                                    name="price"
                                    control={control}
                                    render={({ field }) => (
                                        <div className="flex flex-col gap-3">
                                            <Label>Precio del Pack</Label>
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
                                                    <div className="relative">
                                                        <span className="absolute top-1/2 left-4 -translate-y-1/2 text-sm">
                                                            S/
                                                        </span>
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            {...field}
                                                            className="pl-10"
                                                            placeholder="0"
                                                            value={
                                                                field.value ??
                                                                ''
                                                            }
                                                        />
                                                    </div>

                                                    {errors.promo_price && (
                                                        <p className="text-xs font-medium text-red-500">
                                                            {String(
                                                                errors
                                                                    .promo_price
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
                                                        onChange={
                                                            field.onChange
                                                        }
                                                    />
                                                    {errors.promo_start_at && (
                                                        <p className="text-xs font-medium text-red-500">
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
                                                        onChange={
                                                            field.onChange
                                                        }
                                                    />
                                                </div>
                                            )}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* DISPONIBILIDAD */}
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
                                className="mt-6 h-10 w-full font-bold shadow-lg shadow-blue-100"
                            >
                                {isSubmitting
                                    ? 'Guardando cambios...'
                                    : 'Guardar Pack'}
                            </Button>
                        </div>
                    </aside>
                </div>
            </form>
        </FormProvider>
    );
}
