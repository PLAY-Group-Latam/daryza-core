'use client';

import { Button } from '@/components/ui/button';
import { ContentSectionProps as Props } from '@/types/content/content';
import { BannerContentAll } from '@/types/content/content-types';
import { useForm } from '@inertiajs/react';
import { Save } from 'lucide-react';
import { toast } from 'sonner';
// Importamos el componente reutilizable
import ResponsiveBannerEditor from '@/components/custom-ui/content/ResponsiveBannerEditor';

export default function CartEditor({ section }: Props) {
    const rawContent = section.content?.content as BannerContentAll;

    const { data, setData, put, processing } = useForm<{
        content: BannerContentAll;
    }>({
        content: {
            src_desktop: rawContent?.src_desktop ?? null,
            src_mobile: rawContent?.src_mobile ?? null,
            link_url: rawContent?.link_url ?? '',
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        put(
            `/content/update/${section.page.slug}/${section.type}/${section.id}`,
            {
                forceFormData: true,
                preserveScroll: true,
                onError: (errors) => {
                    console.error('Errores:', errors);
                    toast.error('Error al guardar');
                },
            },
        );
    };
    return (
        <form onSubmit={handleSubmit} className="mx-auto max-w-6xl space-y-6">
            {/* Usamos el ResponsiveBannerEditor que ya maneja internamente:
          - Títulos y descripciones
          - Uploads para Desktop y Móvil
          - Input para la URL
      */}
            <ResponsiveBannerEditor
                title="Banner Principal"
                description="Este banner aparecerá en la página del carrito."
                data={{
                    src_desktop: data.content.src_desktop,
                    src_mobile: data.content.src_mobile,
                    link_url: data.content.link_url ?? '',
                    type: 'url',
                }}
                // Actualizamos el objeto content completo manteniendo la inmutabilidad
                onChange={(updates) =>
                    setData('content', {
                        ...data.content,
                        ...updates,
                    })
                }
                showTypeTabs={false}
            />

            <div className="flex justify-end pt-2">
                <Button
                    type="submit"
                    disabled={processing}
                    className="gap-2 rounded-xl px-12 py-6 text-base font-black tracking-tight uppercase shadow-lg"
                >
                    <Save size={20} />
                    {processing ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
                </Button>
            </div>
        </form>
    );
}
