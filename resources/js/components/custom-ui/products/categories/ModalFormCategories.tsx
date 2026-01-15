'use client';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { UploadImageForm } from '@/components/uploadImageForm';
import categories from '@/routes/products/categories';
import { Category, CategorySelect } from '@/types/products';
import { router } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { SlugInput } from '../../slug-text';
import { CategoryTreeSelect } from './CategoryTreeSelect';

interface CategoryModalProps {
    category?: Category | null;
    parentCategories?: CategorySelect[];
    trigger: React.ReactNode;
}

interface FormValues {
    name: string;
    slug: string;
    parent_id: string;
    order: number;
    is_active: boolean;
    image: File | string | null;
}

export function ModalFormCategories({
    category,
    parentCategories,
    trigger,
}: CategoryModalProps) {
    const isEdit = Boolean(category);
    const [open, setOpen] = useState(false);

    const {
        register,
        control,
        handleSubmit,
        watch,
        reset,
        formState: { errors, isDirty, isSubmitting },
    } = useForm<FormValues>({
        defaultValues: {
            name: category?.name ?? '',
            slug: category?.slug ?? '',
            parent_id: category?.parent_id ? String(category.parent_id) : '',
            order: category?.order ?? 0,
            is_active: category?.is_active ?? true,
            image: category?.image ?? null,
        },
    });

    useEffect(() => {
        if (open) {
            reset({
                name: category?.name ?? '',
                slug: category?.slug ?? '',
                parent_id: category?.parent_id
                    ? String(category.parent_id)
                    : '',
                order: category?.order ?? 0,
                is_active: category?.is_active ?? true,
                image: category?.image ?? null,
            });
        }
    }, [category, open, reset]);

    const onSubmit = async (data: FormValues) => {
        console.log('data enviada', data);
        const routeOptions = isEdit
            ? categories.update(category!.id)
            : categories.store();

        await new Promise<void>((resolve) => {
            router.post(
                routeOptions.url,
                {
                    ...data,
                    _method: isEdit ? 'put' : 'post',
                },
                {
                    forceFormData: true,
                    onSuccess: () => {
                        setOpen(false);
                        reset();
                        resolve();
                    },
                    onError: () => resolve(),
                },
            );
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>

            <DialogContent className="overflow-hidden border-none p-0 sm:max-w-3xl">
                <DialogHeader className="gap-1.5 overflow-hidden border-b border-gray-300 px-6 py-4">
                    <DialogTitle>
                        {isEdit ? 'Editar Categoría' : 'Crear Categoría'}
                    </DialogTitle>
                </DialogHeader>

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="w-full px-6 pt-2 pb-6"
                >
                    <div className="grid grid-cols-[1fr_auto] gap-6 space-y-4">
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                {/* Nombre */}
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="name">Nombre</Label>
                                    <Input
                                        id="name"
                                        {...register('name', {
                                            required:
                                                'El nombre es obligatorio',
                                        })}
                                        autoFocus
                                        placeholder="Nombre de la categoría"
                                    />
                                    <InputError
                                        message={errors.name?.message}
                                    />
                                </div>

                                {/* Parent Category */}
                                <Controller
                                    name="parent_id"
                                    control={control}
                                    render={({ field }) => (
                                        <div className="flex flex-col gap-2">
                                            <Label>Categoría Padre</Label>

                                            <CategoryTreeSelect
                                                categories={
                                                    parentCategories || []
                                                }
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
                                        {...field} // value + onChange
                                        // eslint-disable-next-line react-hooks/incompatible-library
                                        source={watch('name')} // SlugInput maneja la sincronización
                                        error={errors.slug?.message}
                                    />
                                )}
                            />

                            {/* Switch Activo */}
                            <Controller
                                name="is_active"
                                control={control}
                                render={({ field: { value, onChange } }) => (
                                    <div className="flex flex-col items-start gap-2">
                                        <Label htmlFor="is_active">
                                            Activo
                                        </Label>
                                        <Switch
                                            id="is_active"
                                            checked={value}
                                            onCheckedChange={onChange}
                                        />
                                    </div>
                                )}
                            />
                        </div>

                        {/* Imagen */}
                        <div className="space-y-4">
                            <Controller
                                name="image"
                                control={control}
                                render={({ field: { value, onChange } }) => (
                                    <div className="flex flex-col items-start gap-2">
                                        <Label>Imagen</Label>
                                        <UploadImageForm
                                            value={value}
                                            onFileChange={onChange}
                                        />
                                    </div>
                                )}
                            />
                        </div>
                    </div>

                    <DialogFooter className="mt-6">
                        <Button
                            type="submit"
                            disabled={isSubmitting || !isDirty}
                            className="h-11 w-full"
                        >
                            {isSubmitting && (
                                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            {isEdit ? 'Guardar Cambios' : 'Crear Categoría'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
