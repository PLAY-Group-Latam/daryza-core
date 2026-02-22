'use client';

import { useForm, router } from '@inertiajs/react';
import { Save, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Upload } from '@/components/custom-ui/upload';
import { ContentSectionProps as Props } from '@/types/content/content';
import { FormDataConvertible } from '@inertiajs/core';

interface ImagenPromocionalContent {
    image_desktop: File | string | null;
    image_mobile: File | string | null;
    link_url: string;
}

export default function ImagenPromocionalEditor({ section }: Props) {

    const isImagenContent = (content: any): content is ImagenPromocionalContent => {
        return content && (
            'image_desktop' in content ||
            'image_mobile' in content ||
            'link_url' in content
        );
    };

    const rawContent = section.content?.content;

    const initialContent: ImagenPromocionalContent = isImagenContent(rawContent)
        ? {
            image_desktop: rawContent.image_desktop ?? null,
            image_mobile: rawContent.image_mobile ?? null,
            link_url: rawContent.link_url ?? '',
        }
        : {
            image_desktop: null,
            image_mobile: null,
            link_url: '',
        };

    const { data, setData, processing } = useForm<{
        content: ImagenPromocionalContent;
    }>({
        content: initialContent,
    });

    const updateImage = (
        field: 'image_desktop' | 'image_mobile',
        value: File | string | null
    ) => {
        setData('content', {
            ...data.content,
            [field]: value,
        });
    };

    const updateLink = (value: string) => {
        setData('content', {
            ...data.content,
            link_url: value,
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Enviando datos:', data.content);

        router.post(
            `/content/update/${section.page.slug}/${section.type}/${section.id}`,
            {
                _method: 'PUT',
                content: data.content as unknown as FormDataConvertible,
            },
            {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('¡Imagen promocional actualizada correctamente!');
                },
                onError: (errors) => {
                    console.error('❌ Errores:', errors);
                    toast.error('Error al guardar la imagen.');
                },
            }
        );
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <ImageIcon size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">
                                Configuración de {section.name}
                            </h3>
                            <p className="text-sm text-slate-500">
                                Administra las imágenes promocionales.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-8 space-y-8">

                    {/* Imágenes */}
                    <div className="space-y-6">

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                            {/* Imagen Desktop */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                                        Imagen Desktop
                                    </label>
                                    <span className="text-xs text-slate-400">
                                        1200x500px
                                    </span>
                                </div>

                                <Upload
                                    value={data.content.image_desktop}
                                    onFileChange={(file) =>
                                        updateImage('image_desktop', file)
                                    }
                                    accept="image/*"
                                    previewClassName="w-full aspect-[3/1] rounded-xl object-cover border border-dashed border-slate-200"
                                />
                            </div>

                            {/* Imagen Mobile */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                                        Imagen Mobile
                                    </label>
                                    <span className="text-xs text-slate-400">
                                        750x900px aprox
                                    </span>
                                </div>

                                <Upload
                                    value={data.content.image_mobile}
                                    onFileChange={(file) =>
                                        updateImage('image_mobile', file)
                                    }
                                    accept="image/*"
                                    previewClassName="w-full aspect-[3/1] rounded-xl object-cover border border-dashed border-slate-200"
                                />
                            </div>

                        </div>

                        {/* URL */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                                Enlace de redirección
                            </label>
                            <input
                                type="text"
                                value={data.content.link_url}
                                onChange={(e) => updateLink(e.target.value)}
                                placeholder="https://ejemplo.com/promocion"
                                className="w-full text-sm border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>

                    </div>
                </div>
            </div>

            {/* Botón Guardar */}
            <div className="flex justify-end">
                <Button
                    type="submit"
                    disabled={processing}
                    className="px-10 py-6 rounded-xl shadow-md gap-2 text-base font-bold"
                >
                    <Save size={20} />
                    {processing ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
            </div>
        </form>
    );
}