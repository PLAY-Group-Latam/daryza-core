'use client';

import { Upload } from '@/components/custom-ui/upload';
import { Button } from '@/components/ui/button';
import { ContentSectionProps as Props } from '@/types/content/content';
import { ImageFormContent } from '@/types/content/content-types';
import { useForm } from '@inertiajs/react';
import { Image, Save } from 'lucide-react';
import { toast } from 'sonner';

// ─── Editor principal ─────────────────────────────────────────────────────────

export default function ImageFormEditor({ section }: Props) {
    const rawContent = section.content?.content as ImageFormContent;

    const { data, setData, put, processing } = useForm<{
        content: ImageFormContent;
    }>({
        content: {
            imagen: rawContent?.imagen ?? null,
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
                    toast.error('Error al guardar los cambios');
                },
            },
        );
    };

    return (
        <form onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-6">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-5">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-primary/10 p-2 text-primary">
                            <Image size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">
                                Imagen del formulario
                            </h3>
                            <p className="text-sm text-slate-500">
                                Imagen al costado izquierdo del formulario.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-center p-6">
                    <div className="aspect-[3/4] w-full max-w-sm overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-50">
                        <div className="h-full w-full [&_img]:!h-full [&_img]:!w-full [&_img]:!rounded-none [&_img]:!object-cover [&>*]:!h-full [&>*]:!w-full">
                            <Upload
                                value={data.content.imagen}
                                onFileChange={(file) =>
                                    setData('content', { imagen: file })
                                }
                                accept="image/*"
                                previewClassName="!w-full !h-full !object-cover !rounded-none !border-0 !bg-transparent"
                            />
                        </div>
                    </div>
                </div>
            </div>

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
