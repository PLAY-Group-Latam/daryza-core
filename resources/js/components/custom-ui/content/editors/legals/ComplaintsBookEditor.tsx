'use client';

import { RichTextEditor } from '@/components/custom-ui/rich-text-tiptap/RichTextEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ContentSectionProps as Props } from '@/types/content/content';
import { ComplaintsContent } from '@/types/content/content-types';
import { useForm } from '@inertiajs/react';
import { FileText, Save, Type } from 'lucide-react';
import { toast } from 'sonner';

// Ítems fijos: solo Queja y Reclamo, no editables en cantidad
const FIXED_ITEMS: Array<{ key: 'queja' | 'reclamo'; label: string; placeholder: string }> = [
    {
        key: 'reclamo',
        label: 'Reclamo',
        placeholder: 'Ej: Disconformidad relacionada al producto o servicio adquirido...',
    },
    {
        key: 'queja',
        label: 'Queja',
        placeholder: 'Ej: Disconformidad relacionada con la atención al cliente...',
    },
];

export default function ComplaintsBookEditor({ section }: Props) {
    const rawContent = section.content?.content as ComplaintsContent;

    // Reconstruimos info_items a partir de los fijos si vienen del backend,
    // o inicializamos con vacíos para que el admin los llene.
    const initialItems = FIXED_ITEMS.map(({ key }) => {
        const existing = rawContent?.info_items?.find(
            (i) => i.label.toLowerCase() === key,
        );
        return {
            label: key.charAt(0).toUpperCase() + key.slice(1), // "Queja" / "Reclamo"
            value: existing?.value ?? '',
        };
    });

    const { data, setData, put, processing } = useForm<{
        content: ComplaintsContent;
    }>({
        content: {
            title: rawContent?.title ?? 'Libro de Reclamaciones',
            subtitle: rawContent?.subtitle ?? '',
            body: rawContent?.body ?? '',
            info_items: initialItems,
        },
    });

    // Actualiza solo el value de un ítem fijo (el label no cambia)
    const updateItemValue = (index: number, val: string) => {
        const newItems = [...data.content.info_items];
        newItems[index] = { ...newItems[index], value: val };
        setData('content', { ...data.content, info_items: newItems });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(
            `/content/update/${section.page.slug}/${section.type}/${section.id}`,
            {
                preserveScroll: true,
                onSuccess: () => toast.success('¡Contenido actualizado!'),
            },
        );
    };

    return (
        <form onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-6">

            {/* CUADRO 1: TÍTULO Y SUBTÍTULO */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="mb-4 flex items-center gap-2 font-bold text-slate-900">
                    <Type size={18} className="text-primary" />
                    Encabezado del Libro
                </h3>
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700">
                            Título principal
                        </label>
                        <Input
                            placeholder="Ej: Libro de Reclamaciones"
                            value={data.content.title}
                            onChange={(e) =>
                                setData('content', {
                                    ...data.content,
                                    title: e.target.value,
                                })
                            }
                            className="text-base font-bold"
                        />
                        <p className="text-xs text-slate-400">
                            Aparece como el H1 de la página.
                        </p>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700">
                            Subtítulo
                        </label>
                        <Input
                            placeholder="Ej: Conoce tus derechos como consumidor"
                            value={data.content.subtitle}
                            onChange={(e) =>
                                setData('content', {
                                    ...data.content,
                                    subtitle: e.target.value,
                                })
                            }
                        />
                        <p className="text-xs text-slate-400">
                            Aparece debajo del título principal.
                        </p>
                    </div>
                </div>
            </div>

            {/* CUADRO 2: INSTRUCCIONES / CUERPO RICH TEXT */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="mb-4 flex items-center gap-2 font-bold text-slate-900">
                    <FileText size={18} className="text-primary" />
                    Instrucciones Superiores
                </h3>
                <RichTextEditor
                    value={data.content.body}
                    onChange={(val) =>
                        setData('content', { ...data.content, body: val })
                    }
                />
            </div>

            {/* CUADRO 3: DEFINICIONES FIJAS (solo Reclamo y Queja) */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
                    <h3 className="font-bold text-slate-900">
                        Definiciones
                    </h3>
                    <p className="mt-0.5 text-xs text-slate-400">
                        Edita la descripción de cada tipo. El orden y los nombres no cambian.
                    </p>
                </div>

                <div className="space-y-4 p-6">
                    {FIXED_ITEMS.map(({ label, placeholder }, index) => (
                        <div
                            key={label}
                            className="rounded-xl border border-slate-100 bg-slate-50/50 p-4"
                        >
                            <p className="mb-2 text-sm font-bold text-slate-700">
                                {label}
                            </p>
                            <Textarea
                                placeholder={placeholder}
                                value={data.content.info_items[index]?.value ?? ''}
                                onChange={(e) => updateItemValue(index, e.target.value)}
                                className="min-h-[80px] resize-none"
                            />
                        </div>
                    ))}
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