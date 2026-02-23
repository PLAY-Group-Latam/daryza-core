'use client';

import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { SlugInput } from '@/components/custom-ui/slug-text';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProductFormValues } from '../schema';

export function GeneralSection() {
    const {
        control,
        formState: { errors },
    } = useFormContext<ProductFormValues>();
    const name = useWatch({ control, name: 'name', defaultValue: '' });

    return (
        <section className="space-y-6">
            <p className="text-xs font-bold tracking-widest text-gray-700 uppercase">
                ● Información General
            </p>

            <Controller
                name="name"
                control={control}
                render={({ field }) => (
                    <div className="flex flex-col gap-2">
                        <Label>Nombre de Producto *</Label>
                        <Input
                            {...field}
                            placeholder="Ej: Silla Ergonómica Pro"
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
                        source={name}
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
                        <Label>Descripción corta</Label>
                        <Input
                            {...field}
                            placeholder="Resumen para el catálogo..."
                        />
                    </div>
                )}
            />

            <Controller
                name="description"
                control={control}
                render={({ field }) => (
                    <div className="flex flex-col gap-2">
                        <Label>Descripción completa</Label>
                        <textarea
                            {...field}
                            className="min-h-[180px] w-full rounded-xl border p-4 text-sm"
                            placeholder="Describe el producto en detalle..."
                        />
                    </div>
                )}
            />
        </section>
    );
}
