'use client';

import { RichTextEditor } from '@/components/custom-ui/rich-text-tiptap/RichTextEditor';
import { Button } from '@/components/ui/button';
import { ContentSectionProps as Props } from '@/types/content/content';
import { PrivacyContent } from '@/types/content/content-types';
import { useForm } from '@inertiajs/react';
import { ExternalLink, FileText, Lightbulb, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function CookiesEditor({ section }: Props) {
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
        <div className="mx-auto max-w-5xl space-y-6">
            {/* Banner de Referencia Técnica - Estilo Profesional */}
            <div className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex gap-3">
                    <div className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600">
                        <Lightbulb size={20} />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-slate-900">
                            Referencia de cumplimiento (Estructura Falabella)
                        </h4>
                        <p className="mt-1 text-xs text-slate-500">
                            Se recomienda incluir: Definiciones, Tipos de
                            cookies (Técnicas/Analíticas), Gestión de terceros y
                            derechos de control.
                        </p>
                    </div>
                </div>
                <a
                    href="https://www.falabella.com.pe/falabella-pe/page/politicas-de-cookies"
                    target="_blank"
                    className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold whitespace-nowrap text-primary transition-all hover:underline"
                >
                    Ver Referencia
                    <ExternalLink size={14} />
                </a>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    {/* Header idéntico al de Reclamaciones */}
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
                                    Edita el contenido legal y la tabla de
                                    rastreadores para los usuarios.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Editor */}
                    <div className="p-6">
                        <RichTextEditor
                            value={data.content.body}
                            onChange={(val) =>
                                setData('content', { body: val })
                            }
                        />
                    </div>
                </div>

                {/* Botón de acción */}
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
        </div>
    );
}
