'use client';

import { RichTextEditor } from '@/components/custom-ui/rich-text-tiptap/RichTextEditor';
import { Button } from '@/components/ui/button';
import { ContentSectionProps as Props } from '@/types/content/content';
import { PrivacyContent } from '@/types/content/content-types';
import { useForm } from '@inertiajs/react';
import { FileText, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function PrivacyPoliticEditor({ section }: Props) {
    const rawContent = section.content?.content as PrivacyContent;

    const { data, setData, put, processing } = useForm<{
        content: PrivacyContent;
    }>({
        content: { body: rawContent?.body ?? '' },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(
            `/content/update/${section.page.slug}/${section.type}/${section.id}`,
            {
                preserveScroll: true,
                onError: (errors) => {
                    console.error('Errores:', errors);
                    toast.error('Error al guardar');
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
                            <FileText size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">
                                Configuración de {section.name}
                            </h3>
                            <p className="text-sm text-slate-500">
                                Edita el contenido usando la barra de
                                herramientas para dar formato.
                            </p>
                        </div>
                    </div>
                </div>
                <div className="p-6">
                    <RichTextEditor
                        value={data.content.body}
                        onChange={(val) => setData('content', { body: val })}
                    />
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
