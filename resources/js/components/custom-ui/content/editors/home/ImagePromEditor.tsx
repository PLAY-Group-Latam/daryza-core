'use client';

import { Button } from '@/components/ui/button';
import {
    ImagenPromocionalContent,
    ContentSectionProps as Props,
} from '@/types/content/content';
import { FormDataConvertible } from '@inertiajs/core'; 
import { router, useForm } from '@inertiajs/react';
import { Save } from 'lucide-react';
import { toast } from 'sonner';
import ResponsiveBannerEditor from '@/components/custom-ui/content/ResponsiveBannerEditor';

export default function ImagenPromocionalEditor({ section }: Props) {
    const isImagenContent = (
        content: any,
    ): content is ImagenPromocionalContent => {
        return (
            content &&
            ('image_desktop' in content ||
                'image_mobile' in content ||
                'link_url' in content)
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

    // Función unificada para que el ResponsiveBannerEditor actualice el estado de Inertia
    const handleEditorChange = (updates: Partial<ImagenPromocionalContent>) => {
        setData('content', {
            ...data.content,
            ...updates,
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

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
                    toast.success(
                        '¡Imagen promocional actualizada correctamente!',
                    );
                },
                onError: (errors) => {
                    console.error('❌ Errores:', errors);
                    toast.error('Error al guardar la imagen.');
                },
            },
        );
    };

    return (
        <form onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-6">
          
            <ResponsiveBannerEditor
                title={`Configuración de ${section.name}`}
                description="Imagen promocional en la vista de inicio."
                allowedType="image"
                data={{
                    src_desktop: data.content.image_desktop,
                    src_mobile: data.content.image_mobile,
                    link_url: data.content.link_url ?? '',
                    type: 'url',
                }}
                onChange={(updates) => {
                    const translatedUpdates: Partial<ImagenPromocionalContent> =
                        {};
                    if ('src_desktop' in updates)
                        translatedUpdates.image_desktop =
                            updates.src_desktop as any;
                    if ('src_mobile' in updates)
                        translatedUpdates.image_mobile =
                            updates.src_mobile as any;
                    if ('link_url' in updates)
                        translatedUpdates.link_url = updates.link_url;

                    handleEditorChange(translatedUpdates);
                }}
                showTypeTabs={false}
            />

            {/* Botón Guardar */}
            <div className="flex justify-end">
                <Button
                    type="submit"
                    disabled={processing}
                    className="gap-2 rounded-xl px-10 py-6 text-base font-bold shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                    <Save size={20} />
                    {processing ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
            </div>
        </form>
    );
}
