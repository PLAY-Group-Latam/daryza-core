'use client';

import { useForm } from '@inertiajs/react';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ContentSectionProps as Props } from '@/types/content/content';
import { BannerIndexContent, BannerContent } from '@/types/content/content-types';
import ResponsiveBannerEditor from '@/components/custom-ui/content/ResponsiveBannerEditor';

export default function BannerIndexEditor({ section }: Props) {
    const rawContent = section.content?.content as BannerIndexContent;
    const rawBanner = rawContent?.banner;

    const { data, setData, put, processing } = useForm<{ content: BannerIndexContent }>({
        content: {
            banner: {
                type: 'url',
                src_desktop: rawBanner?.src_desktop ?? null,
                src_mobile: rawBanner?.src_mobile ?? null,
                link_url: rawBanner?.link_url ?? '',
            },
        },
    });

    const handleBannerChange = (updates: Partial<BannerContent>) =>
        setData('content', {
            ...data.content,
            banner: { ...data.content.banner, ...updates },
        });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/content/update/${section.page.slug}/${section.type}/${section.id}`, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => toast.success('¡Banner del index actualizado!'),
            onError: () => toast.error('Error al guardar los cambios'),
        });
    };

    return (
        <form onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-6">

            {/* Banner Principal Unificado */}
            <ResponsiveBannerEditor
                title="Banner principal"
                description="Hero principal de la vista."
                allowedType="image"
                data={{
                    src_desktop: data.content.banner.src_desktop,
                    src_mobile: data.content.banner.src_mobile,
                    link_url: data.content.banner.link_url ?? '',
                    type: 'url',
                }}
                onChange={handleBannerChange}
                showTypeTabs={false}
            />

            {/* Botón de Guardado */}
            <div className="flex justify-end">
                <Button
                    type="submit"
                    disabled={processing}
                    className="gap-2 rounded-xl px-10 py-6 text-base font-bold shadow-md"
                >
                    <Save size={20} />
                    {processing ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
            </div>
        </form>
    );
}