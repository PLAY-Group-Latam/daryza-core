'use client';

import { useForm } from '@inertiajs/react';
import { Save, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ContentSectionProps as Props } from '@/types/content/content';
import { Upload } from '@/components/custom-ui/upload';
import { ContactWorkContent, BannerContent } from '@/types/content/content-types';
import ResponsiveBannerEditor from '@/components/custom-ui/content/ResponsiveBannerEditor';

// ─── Upload para la imagen lateral del formulario ─────────────────────────────

function UploadFormImage({
    value,
    onChange,
    className,
}: {
    value: File | string | null;
    onChange: (f: File | string | null) => void;
    className?: string;
}) {
    return (
        <div className={`rounded-xl border border-dashed border-slate-300 bg-slate-50 overflow-hidden ${className ?? ''}`}>
            <div className="w-full h-full [&>*]:!w-full [&>*]:!h-full [&_img]:!w-full [&_img]:!h-full [&_img]:!object-cover [&_img]:!rounded-none">
                <Upload
                    value={value}
                    onFileChange={onChange}
                    accept="image/*"
                    previewClassName="!w-full !h-full !object-cover !rounded-none !border-0 !bg-transparent"
                />
            </div>
        </div>
    );
}

// ─── Editor Principal ─────────────────────────────────────────────────────────

export default function ContactWorkEditor({ section }: Props) {
    const rawContent = section.content?.content as ContactWorkContent;
    const rawBanner = rawContent?.banner;

    const { data, setData, put, processing } = useForm<{ content: ContactWorkContent }>({
        content: {
            banner: {
                type: 'url',
                src_desktop: rawBanner?.src_desktop ?? null,
                src_mobile: rawBanner?.src_mobile ?? null,
                link_url: rawBanner?.link_url ?? '',
            },
            form_image: rawContent?.form_image ?? null,
        },
    });

    const handleBannerChange = (updates: Partial<BannerContent>) =>
        setData('content', {
            ...data.content,
            banner: { ...data.content.banner, ...updates },
        });

    const setFormImage = (file: File | string | null) =>
        setData('content', { ...data.content, form_image: file });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/content/update/${section.page.slug}/${section.type}/${section.id}`, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => toast.success('¡Sección "Trabaja con Nosotros" actualizada!'),
            onError: () => toast.error('Error al guardar los cambios'),
        });
    };

    return (
        <form onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-6">

            {/* Banner Principal Unificado */}
            <ResponsiveBannerEditor
                title='Banner "Trabaja con Nosotros"'
                description="Hero principal de Trabaja con Nosotros."
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

            {/* Imagen del Formulario (Reclutamiento) */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-5">
                    <div className="flex items-center gap-3">
                         <div className="rounded-lg bg-primary/10 p-2 text-primary">
                            <Image size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Imagen del Formulario</h3>
                            <p className="text-sm text-slate-500">Imagen lateral para el formulario de CVs.</p>
                        </div>
                    </div>
                </div>
                <div className="flex justify-center p-6">
                    <UploadFormImage
                        value={data.content.form_image}
                        onChange={setFormImage}
                        className="aspect-[3/4] w-[220px]"
                    />
                </div>
            </div>

            {/* Botón Guardar */}
            <div className="flex justify-end pt-4">
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