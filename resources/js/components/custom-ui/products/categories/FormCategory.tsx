/* eslint-disable react-hooks/incompatible-library */
'use client';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { UploadImageForm } from '@/components/uploadImageForm';
import categories from '@/routes/products/categories';
import { Category, CategorySelect } from '@/types/products/categories';
import { router } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { SlugInput } from '../../slug-text';
import { CategoryTreeSelect } from './CategoryTreeSelect';

interface FormCategoryProps {
    category?: Category | null;
    parentCategories?: CategorySelect[];
}

interface FormValues {
    name: string;
    slug: string;
    parent_id: string;
    order: number;
    is_active: boolean;
    image: File | string | null;
}

export default function FormCategory({
    category,
    parentCategories,
}: FormCategoryProps) {
    const isEdit = Boolean(category);

    const {
        register,
        control,
        handleSubmit,
        watch,
        formState: { errors, isDirty, isSubmitting },
    } = useForm<FormValues>({
        defaultValues: {
            name: category?.name ?? '',
            slug: category?.slug ?? '',
            parent_id: category?.parent_id ? String(category.parent_id) : '',
            order: category?.order ?? undefined,
            is_active: category?.is_active ?? true,
            image: category?.image ?? null,
        },
    });

    const onSubmit = async (data: FormValues) => {
        const routeOptions = isEdit
            ? categories.update(category!.id)
            : categories.store();

        router.post(
            routeOptions.url,
            {
                ...data,
                _method: isEdit ? 'put' : 'post',
            },
            {
                forceFormData: true,
            },
        );
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="w-full">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-[1fr_auto]">
                <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {/* Nombre */}
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="name">Nombre de la categoría</Label>
                            <Input
                                id="name"
                                {...register('name', {
                                    required: 'El nombre es obligatorio',
                                })}
                                autoFocus
                                placeholder="Ej. Accesorios de Limpieza"
                            />
                            <InputError message={errors.name?.message} />
                        </div>

                        {/* Parent Category */}
                        <Controller
                            name="parent_id"
                            control={control}
                            render={({ field }) => (
                                <div className="flex flex-col gap-2">
                                    <Label>Categoría</Label>
                                    <CategoryTreeSelect
                                        categories={parentCategories || []}
                                        value={field.value}
                                        onChange={field.onChange}
                                    />
                                </div>
                            )}
                        />
                    </div>

                    {/* Slug */}
                    <Controller
                        name="slug"
                        control={control}
                        render={({ field }) => (
                            <SlugInput
                                {...field}
                                source={watch('name')}
                                error={errors.slug?.message}
                            />
                        )}
                    />

                    <div className="flex items-center gap-8">
                        {/* Switch Activo */}
                        <Controller
                            name="is_active"
                            control={control}
                            render={({ field: { value, onChange } }) => (
                                <div className="flex items-center gap-3">
                                    <Switch
                                        id="is_active"
                                        checked={value}
                                        onCheckedChange={onChange}
                                    />
                                    <Label
                                        htmlFor="is_active"
                                        className="cursor-pointer"
                                    >
                                        Categoría Activa
                                    </Label>
                                </div>
                            )}
                        />

                        {/* Order - Solo visible al editar o si quieres permitirlo siempre */}
                        {isEdit && (
                            <div className="flex items-center gap-3">
                                <Label htmlFor="order">Posición:</Label>
                                <Input
                                    id="order"
                                    type="number"
                                    className="w-20"
                                    {...register('order')}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Imagen */}
                <div className="flex min-w-[200px] flex-col items-center gap-2">
                    <Label className="w-full text-left">
                        Imagen de portada
                    </Label>
                    <Controller
                        name="image"
                        control={control}
                        render={({ field: { value, onChange } }) => (
                            <UploadImageForm
                                value={value}
                                onFileChange={onChange}
                            />
                        )}
                    />
                </div>
            </div>

            <div className="mt-8 flex justify-start">
                <Button
                    type="submit"
                    disabled={isSubmitting || !isDirty}
                    className="h-11 px-8"
                >
                    {isSubmitting && (
                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {isEdit ? 'Actualizar Categoría' : 'Guardar Categoría'}
                </Button>
            </div>
        </form>
    );
}
