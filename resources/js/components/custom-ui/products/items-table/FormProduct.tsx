/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';

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

    variants: z.array(z.any()),
    media: z.array(z.any()),
    specifications: z.array(z.any()),
});

type ProductFormValues = z.infer<typeof ProductSchema>;

export default function FormProduct({ categories }: { categories: any[] }) {
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = methods;

    const onSubmit = (data: ProductFormValues) => {
        setIsSubmitting(true);
        console.log(data);
        setTimeout(() => setIsSubmitting(false), 1000);
    };

    const handleAutoSlug = () => {
        const name = watch('name');
        if (name) {
            setValue(
                'slug',
                name
                    .toLowerCase()
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/(^-|-$)+/g, ''),
            );
        }
    };

    return (
        <FormProvider {...methods}>
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-10 pb-10"
            >
                {/* HEADER */}
                {/* <div className="flex justify-end">
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex h-11 gap-2 rounded-xl bg-indigo-600 px-6 text-white hover:bg-indigo-700"
                    >
                        <Save size={18} />
                        Guardar producto
                    </Button>
                </div> */}

                {/* GRID PRINCIPAL */}
                <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
                    {/* ================= LEFT ================= */}
                    <div className="space-y-10 lg:col-span-8">
                        {/* GENERAL INFORMATION */}
                        <div className="space-y-3">
                            <p className="text-xs font-bold tracking-widest text-indigo-500 uppercase">
                                ● General Information
                            </p>
                            <Card className="space-y-6 rounded-3xl p-8">
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div>
                                        <Label>Internal Code</Label>
                                        <Input
                                            {...register('code')}
                                            placeholder="PROD-001"
                                        />
                                    </div>

                                    <div>
                                        <Label>Product Name *</Label>
                                        <Input
                                            {...register('name')}
                                            onBlur={handleAutoSlug}
                                            placeholder="Premium Wireless Headphones"
                                        />
                                        {errors.name && (
                                            <p className="text-xs text-red-500">
                                                {errors.name.message}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <Label>URL Slug *</Label>
                                    <div className="flex">
                                        <span className="flex items-center rounded-l-xl bg-slate-100 px-4 text-sm text-slate-500">
                                            /catalog/
                                        </span>
                                        <Input
                                            {...register('slug')}
                                            className="rounded-l-none"
                                            placeholder="mi-producto"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label>Brief Summary</Label>
                                    <Input
                                        {...register('brief_description')}
                                        placeholder="Short catchphrase for the catalog list..."
                                    />
                                </div>

                                <div>
                                    <Label>Full Description</Label>
                                    <textarea
                                        {...register('description')}
                                        className="min-h-[180px] w-full rounded-xl border p-4"
                                        placeholder="Describe the product experience in detail..."
                                    />
                                </div>
                            </Card>
                        </div>

                        {/* PLACEHOLDERS PARA MEDIA / VARIANTS / SPECS */}
                        <div className="space-y-3">
                            <p className="text-xs font-bold tracking-widest text-indigo-500 uppercase">
                                ● Media & Gallery
                            </p>
                            <Card className="rounded-3xl border-2 border-dashed p-16 text-center text-slate-400">
                                ADD ASSETS
                            </Card>
                        </div>

                        <div className="space-y-3">
                            <p className="text-xs font-bold tracking-widest text-indigo-500 uppercase">
                                ● Variant Matrix
                            </p>
                            <Card className="rounded-3xl border-2 border-dashed p-16 text-center text-slate-400">
                                Configure multiple options like size, color, or
                                aroma.
                            </Card>
                        </div>

                        <div className="space-y-3">
                            <p className="text-xs font-bold tracking-widest text-indigo-500 uppercase">
                                ● Specifications
                            </p>
                            <Card className="rounded-3xl p-16 text-center text-slate-300 italic">
                                Add technical details like materials or
                                dimensions.
                            </Card>
                        </div>
                    </div>

                    {/* ================= RIGHT ================= */}

                    <aside className="sticky top-24 space-y-8 lg:col-span-4">
                        {/* VISIBILITY STATUS */}
                        <div className="flex items-center justify-between rounded-2xl border bg-background p-4">
                            <div className="space-y-0.5">
                                <h3 className="text-sm font-medium">
                                    Visibilidad
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    Producto visible para los clientes
                                </p>
                            </div>

                            <Switch
                                checked={watch('is_active')}
                                onCheckedChange={(value) =>
                                    setValue('is_active', value)
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <p className="text-xs font-bold tracking-widest text-indigo-500 uppercase">
                                ● Category
                            </p>
                            <select
                                {...register('category_id')}
                                className="h-11 w-full rounded-xl border px-4"
                            >
                                <option value="">Select category</option>
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

                        {/* SEO ENGINE */}
                        <div className="space-y-2">
                            <p className="text-xs font-bold tracking-widest text-indigo-500 uppercase">
                                ● SEO Engine
                            </p>

                            <Card className="space-y-4 rounded-3xl p-6">
                                <div>
                                    <Label>Search Title</Label>
                                    <Input
                                        {...register('metadata.meta_title')}
                                    />
                                </div>

                                <div>
                                    <Label>Search Description</Label>
                                    <textarea
                                        {...register(
                                            'metadata.meta_description',
                                        )}
                                        className="h-24 w-full rounded-xl border p-3"
                                    />
                                </div>

                                <div>
                                    <Label>Canonical URL</Label>
                                    <Input
                                        {...register('metadata.canonical_url')}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4 border-t pt-4">
                                    <label className="flex items-center gap-2 text-sm">
                                        <input
                                            type="checkbox"
                                            {...register('metadata.noindex')}
                                        />
                                        No-Index
                                    </label>
                                    <label className="flex items-center gap-2 text-sm">
                                        <input
                                            type="checkbox"
                                            {...register('metadata.nofollow')}
                                        />
                                        No-Follow
                                    </label>
                                </div>
                            </Card>
                        </div>
                    </aside>
                </div>
            </form>
        </FormProvider>
    );
}
