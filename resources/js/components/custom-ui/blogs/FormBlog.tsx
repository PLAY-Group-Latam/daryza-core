/* eslint-disable react-hooks/incompatible-library */
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import blogs from '@/routes/blogs';
import { Blog, BlogCategory } from '@/types/blogs';
import { router } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import { DatePicker } from '../DatePicker';
import { MultiSelect } from '../MultiSelect';
import { RichTextEditor } from '../rich-text-tiptap/RichTextEditor';
import { SlugInput } from '../slug-text';
import { Upload } from '../upload';

export const BlogSchema = z.object({
    title: z.string().min(1, 'El título es obligatorio'),
    slug: z.string().min(1, 'El slug es obligatorio'),
    description: z.string().min(1, 'La descripción es obligatoria'),
    content: z.string().min(1, 'El contenido es obligatorio'),
    author: z.string().min(1, 'El autor es obligatorio'),
    publication_date: z.date({
        error: (issue) =>
            issue.input === undefined
                ? 'La fecha es obligatorio'
                : 'La Fecha es inválida',
    }),

    categories: z.array(z.string()).min(1, 'Selecciona al menos una categoría'),

    visibility: z.boolean(),

    image: z.union([z.instanceof(File), z.string()]).optional(),
    miniature: z.union([z.instanceof(File), z.string()]).optional(),

    metadata: z.object({
        meta_title: z.string().optional(),
        meta_description: z.string().optional(),
        canonical_url: z.string().optional(),
        og_title: z.string().optional(),
        og_description: z.string().optional(),
        noindex: z.boolean(),
        nofollow: z.boolean(),
    }),
});

export type BlogFormValues = z.infer<typeof BlogSchema>;

interface BlogFormProps {
    categories: BlogCategory[];
    blog?: Blog; // optional, para cuando es creación
}

export default function BlogForm({ categories, blog }: BlogFormProps) {
    const methods = useForm<BlogFormValues>({
        resolver: zodResolver(BlogSchema),
        defaultValues: {
            title: blog?.title || '',
            slug: blog?.slug || '',
            description: blog?.description || '',
            content: blog?.content || '',
            image: blog?.image || '', // <- ¿tu blog?.image tiene el valor correcto?
            miniature: blog?.miniature || '',
            author: blog?.author || '',
            publication_date: blog?.publication_date
                ? new Date(blog.publication_date)
                : undefined,
            categories: blog?.categories.map((c) => c.id) || [],
            visibility: blog?.visibility ?? true,
            metadata: {
                meta_title: blog?.metadata?.meta_title || '',
                meta_description: blog?.metadata?.meta_description || '',
                canonical_url: blog?.metadata?.canonical_url || '',
                og_title: blog?.metadata?.og_title || '',
                og_description: blog?.metadata?.og_description || '',
                noindex: blog?.metadata?.noindex ?? false,
                nofollow: blog?.metadata?.nofollow ?? false,
            },
        },
    });

    const {
        control,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting, isDirty },
    } = methods;

    const titleValue = watch('title');

    const onSubmit = async (data: BlogFormValues) => {
        const isEdit = !!blog;
        const action = isEdit
            ? blogs.items.update(blog.id).url
            : blogs.items.store().url;

        await new Promise<void>((resolve) => {
            if (isEdit) {
                router.put(action, data, {
                    preserveScroll: true,
                    forceFormData: true,
                    onFinish: () => resolve(),
                });
            } else {
                router.post(action, data, {
                    preserveScroll: true,
                    forceFormData: true,
                    onFinish: () => resolve(),
                });
            }
        });
    };

    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="pb-10">
                <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_0.5fr]">
                    {/* ================= LEFT ================= */}
                    <div className="space-y-10">
                        {/* INFO GENERAL */}
                        <section>
                            <p className="mb-4 text-xs font-bold tracking-widest uppercase">
                                ● Información General
                            </p>

                            <div className="space-y-6">
                                <Controller
                                    name="title"
                                    control={control}
                                    render={({ field }) => (
                                        <div className="flex flex-col gap-2">
                                            <Label>Título *</Label>
                                            <Input
                                                {...field}
                                                placeholder="Ingresa el título del blog"
                                            />
                                            {errors.title && (
                                                <p className="text-sm text-red-500">
                                                    {errors.title.message}
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
                                            label="Slug *"
                                            source={titleValue}
                                            value={field.value}
                                            placeholder="slug-del-blog" // <-- placeholder agregado
                                            onChange={field.onChange}
                                            error={errors.slug?.message}
                                        />
                                    )}
                                />

                                <Controller
                                    name="description"
                                    control={control}
                                    render={({ field }) => (
                                        <div className="flex flex-col gap-2">
                                            <Label>Descripción *</Label>
                                            <Textarea
                                                {...field}
                                                placeholder="Escribe una breve descripción del blog"
                                                className="min-h-[100px] rounded-xl border p-4 text-sm"
                                            />
                                        </div>
                                    )}
                                />

                                <div className="flex items-center gap-4">
                                    <Controller
                                        name="author"
                                        control={control}
                                        render={({ field }) => (
                                            <div className="flex w-full flex-col gap-2">
                                                <Label>Autor *</Label>
                                                <Input
                                                    {...field}
                                                    placeholder="Nombre del autor"
                                                />
                                            </div>
                                        )}
                                    />

                                    <Controller
                                        name="publication_date"
                                        control={control}
                                        render={({ field }) => (
                                            <div className="flex w-full flex-col gap-2">
                                                <Label>
                                                    Fecha de publicación *
                                                </Label>

                                                <DatePicker
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    placeholder="Seleccionar fecha"
                                                />

                                                {errors.publication_date && (
                                                    <p className="text-sm text-red-500">
                                                        {
                                                            errors
                                                                .publication_date
                                                                .message
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    />
                                </div>
                            </div>
                        </section>

                        {/* CONTENT */}
                        <section>
                            <p className="mb-4 text-xs font-bold tracking-widest uppercase">
                                ● Contenido
                            </p>

                            <Controller
                                name="content"
                                control={control}
                                render={({ field }) => (
                                    <div>
                                        <RichTextEditor
                                            value={field.value}
                                            onChange={field.onChange}
                                        />

                                        {errors.content && (
                                            <p className="text-sm text-red-500">
                                                {errors.content.message}
                                            </p>
                                        )}
                                    </div>
                                )}
                            />
                        </section>
                    </div>

                    {/* ================= RIGHT ================= */}
                    <aside className="sticky top-24 space-y-8">
                        {/* VISIBILITY */}
                        <Controller
                            name="visibility"
                            control={control}
                            render={({ field }) => (
                                <div className="flex items-center justify-between rounded-2xl border p-4">
                                    <div>
                                        <p className="text-sm font-medium">
                                            Visibilidad
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Blog visible al público
                                        </p>
                                    </div>
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </div>
                            )}
                        />
                        {/* CATEGORIES */}
                        <div className="space-y-2">
                            <p className="text-xs font-bold tracking-widest uppercase">
                                ● Categorías
                            </p>

                            <Controller
                                name="categories"
                                control={control}
                                render={({ field }) => (
                                    <MultiSelect
                                        options={categories.map((c) => ({
                                            label: c.name,
                                            value: c.id,
                                        }))}
                                        value={field.value}
                                        onChange={field.onChange}
                                        placeholder="Seleccionar categorías"
                                        searchPlaceholder="Buscar categoría..."
                                    />
                                )}
                            />
                        </div>{' '}
                        {/* IMAGES */}
                        <div className="space-y-4">
                            <p className="text-xs font-bold tracking-widest uppercase">
                                ● Imágenes
                            </p>

                            <Controller
                                name="image"
                                control={control}
                                render={({ field }) => (
                                    <div className="flex flex-col gap-2">
                                        <Label>Imagen principal</Label>
                                        <Upload
                                            value={field.value}
                                            onFileChange={field.onChange}
                                            previewClassName="w-full h-36"
                                        />
                                        {errors.image && (
                                            <p className="text-sm text-red-500">
                                                Imagen inválida
                                            </p>
                                        )}
                                    </div>
                                )}
                            />

                            <Controller
                                name="miniature"
                                control={control}
                                render={({ field }) => (
                                    <div className="flex flex-col gap-2">
                                        <Label>Miniatura</Label>
                                        <Upload
                                            value={field.value}
                                            onFileChange={field.onChange}
                                            previewClassName="w-full h-36"
                                        />
                                        {errors.miniature && (
                                            <p className="text-sm text-red-500">
                                                Miniatura inválida
                                            </p>
                                        )}
                                    </div>
                                )}
                            />
                        </div>
                        {/* SEO */}
                        <div className="space-y-4">
                            <p className="text-xs font-bold tracking-widest uppercase">
                                ● SEO & Metadatos
                            </p>

                            <Controller
                                name="metadata.meta_title"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        placeholder="Meta title"
                                    />
                                )}
                            />

                            <Controller
                                name="metadata.meta_description"
                                control={control}
                                render={({ field }) => (
                                    <Textarea
                                        {...field}
                                        className="h-24 w-full rounded-xl border p-3 text-sm"
                                        placeholder="Meta description"
                                    />
                                )}
                            />

                            <Controller
                                name="metadata.canonical_url"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        placeholder="Canonical URL"
                                    />
                                )}
                            />

                            <div className="flex gap-4">
                                <Controller
                                    name="metadata.noindex"
                                    control={control}
                                    render={({ field }) => (
                                        <label className="flex items-center gap-2 text-sm">
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                            No index
                                        </label>
                                    )}
                                />

                                <Controller
                                    name="metadata.nofollow"
                                    control={control}
                                    render={({ field }) => (
                                        <label className="flex items-center gap-2 text-sm">
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                            No follow
                                        </label>
                                    )}
                                />
                            </div>
                        </div>
                        <Button
                            type="submit"
                            disabled={!isDirty || isSubmitting} // deshabilitado si no hay cambios o se está enviando
                            className="flex w-full items-center justify-center gap-2"
                        >
                            {isSubmitting && (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            )}
                            {isSubmitting ? 'Guardando...' : 'Guardar Blog'}
                        </Button>
                    </aside>
                </div>
            </form>
        </FormProvider>
    );
}
