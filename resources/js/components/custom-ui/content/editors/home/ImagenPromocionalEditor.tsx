'use client';

import { useForm, router } from '@inertiajs/react';
import { Save, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Upload } from '@/components/custom-ui/upload';
import { ContentSectionProps as Props } from '../../../../../types/content/content';

interface ImagenPromocionalContent {
    image: File | string | null;
}

export default function ImagenPromocionalEditor({ section }: Props) {

    const isImagenContent = (content: any): content is ImagenPromocionalContent => {
        return content && 'image' in content;
    };

    const rawContent = section.content?.content;

    const initialContent: ImagenPromocionalContent = isImagenContent(rawContent)
        ? rawContent
        : {
            image: null,
        };

    const { data, setData, processing } = useForm<{
        content: ImagenPromocionalContent;
    }>({
        content: {
            image: initialContent.image ?? null,
        },
    });

    const updateField = (value: File | string | null) => {
        setData('content', {
            ...data.content,
            image: value,
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        router.post(
            `/content/update/${section.page.slug}/${section.type}/${section.id}`,
            {
                _method: 'PUT',
                content: {
                    image: data.content.image,
                },
            },
            {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('¡Imagen actualizada correctamente!');
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
                                Administra la imagen promocional.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-8 space-y-8">

                    {/* Imagen */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className="text-sm font-semibold text-slate-800">
                                Imagen Promocional
                            </label>
                            <span className="text-xs text-slate-400 font-medium">
                                Sugerido: 1200x500px
                            </span>
                        </div>

                        <Upload
                            value={data.content.image}
                            onFileChange={(file) => {
                                console.log('🖼️ Imagen seleccionada:', file);
                                updateField(file);
                            }}
                            previewClassName="!w-full !aspect-[3/1] !rounded-xl !object-cover !border-0 !bg-transparent"
                        />
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
