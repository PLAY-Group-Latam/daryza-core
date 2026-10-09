'use client';

import { Upload } from '@/components/custom-ui/upload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ContentSectionProps as Props } from '@/types/content/content';
import { HistoryYear, OurHistoryContent } from '@/types/content/content-types';
import { useForm } from '@inertiajs/react';
import { BookOpen, FileText, Plus, Save, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const DEFAULT_YEAR = (): HistoryYear => ({
    anio: String(new Date().getFullYear()),
    imagen: null,
    texto: '',
});

// ─── Upload con aspect ratio fijo ─────────────────────────────────────────────

function UploadFixed({
    value,
    onChange,
    className,
}: {
    value: File | string | null;
    onChange: (f: File | string | null) => void;
    className?: string;
}) {
    return (
        <div
            className={`overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-50 ${className ?? ''}`}
        >
            <div className="h-full w-full [&_img]:!h-full [&_img]:!w-full [&_img]:!rounded-none [&_img]:!object-cover [&>*]:!h-full [&>*]:!w-full">
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

// ─── Editor principal ─────────────────────────────────────────────────────────

export default function OurHistoryEditor({ section }: Props) {
    const rawContent = section.content?.content as OurHistoryContent;

    const { data, setData, put, processing } = useForm<{
        content: OurHistoryContent;
    }>({
        content: {
            titulo: rawContent?.titulo ?? '',
            descripcion: rawContent?.descripcion ?? '',
            years: rawContent?.years?.length
                ? rawContent.years
                : [DEFAULT_YEAR()],
        },
    });

    const [activeTab, setActiveTab] = useState(0);

    const set = <K extends keyof OurHistoryContent>(
        key: K,
        val: OurHistoryContent[K],
    ) => setData('content', { ...data.content, [key]: val });

    const updateYear = (index: number, patch: Partial<HistoryYear>) => {
        const updated = [...data.content.years];
        updated[index] = { ...updated[index], ...patch };
        set('years', updated);
    };

    const addYear = () => {
        const updated = [...data.content.years, DEFAULT_YEAR()];
        set('years', updated);
        setActiveTab(updated.length - 1);
    };

    const removeYear = (index: number) => {
        if (data.content.years.length === 1) return;
        const updated = data.content.years.filter((_, i) => i !== index);
        set('years', updated);
        setActiveTab(Math.min(activeTab, updated.length - 1));
    };

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

    const activeYear = data.content.years[activeTab];

    return (
        <form onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-6">
            {/* ── Encabezado ── */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-5">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-primary/10 p-2 text-primary">
                            <FileText size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">
                                Encabezado
                            </h3>
                            <p className="text-sm text-slate-500">
                                Título y texto introductorio de la sección.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 p-6">
                    <div className="space-y-1.5">
                        <Label className="text-[11px] font-semibold tracking-widest text-slate-400 uppercase">
                            Título
                        </Label>
                        <Input
                            value={data.content.titulo}
                            onChange={(e) => set('titulo', e.target.value)}
                            placeholder="Nuestra Historia"
                            className="text-sm font-bold text-primary"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-[11px] font-semibold tracking-widest text-slate-400 uppercase">
                            Descripción
                        </Label>
                        <textarea
                            value={data.content.descripcion}
                            onChange={(e) => set('descripcion', e.target.value)}
                            placeholder="Lorem ipsum dolor sit amet..."
                            rows={3}
                            className="min-h-[80px] w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
                            style={
                                {
                                    fieldSizing: 'content',
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word',
                                } as React.CSSProperties
                            }
                        />
                    </div>
                </div>
            </div>

            {/* ── Años ── */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-primary/10 p-2 text-primary">
                                <BookOpen size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">
                                    Línea de tiempo
                                </h3>
                                <p className="text-sm text-slate-500">
                                    Agrega y edita cada año de la historia.
                                </p>
                            </div>
                        </div>
                        <Button
                            type="button"
                            onClick={addYear}
                            variant="outline"
                            size="sm"
                            className="gap-1.5 text-sm"
                        >
                            <Plus size={14} /> Agregar año
                        </Button>
                    </div>
                </div>

                <div className="space-y-5 p-6">
                    {/* Tabs de años */}
                    <div className="flex flex-wrap gap-2">
                        {data.content.years.map((year, index) => (
                            <button
                                key={index}
                                type="button"
                                onClick={() => setActiveTab(index)}
                                className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition-colors ${
                                    activeTab === index
                                        ? 'bg-primary text-white'
                                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                }`}
                            >
                                {year.anio || `Año ${index + 1}`}
                            </button>
                        ))}
                    </div>

                    {/* Editor del año activo */}
                    {activeYear && (
                        <div
                            key={activeTab}
                            className="overflow-hidden rounded-2xl border border-slate-200"
                        >
                            {/* Header del año */}
                            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 px-5 py-3.5">
                                <div className="flex items-center gap-3">
                                    <Label className="text-[9px] font-semibold tracking-widest text-slate-400 uppercase">
                                        Año
                                    </Label>
                                    <Input
                                        value={activeYear.anio}
                                        onChange={(e) =>
                                            updateYear(activeTab, {
                                                anio: e.target.value,
                                            })
                                        }
                                        placeholder="2024"
                                        className="h-8 w-28 text-sm font-bold"
                                        maxLength={4}
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeYear(activeTab)}
                                    disabled={data.content.years.length === 1}
                                    className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-30"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            {/* Imagen + texto — responsive */}
                            <div className="grid grid-cols-1 items-start gap-5 p-5 sm:grid-cols-[160px_1fr]">
                                {/* Imagen cuadrada */}
                                <div className="space-y-2">
                                    <Label className="text-[9px] font-semibold tracking-widest text-slate-400 uppercase">
                                        Imagen
                                    </Label>
                                    <UploadFixed
                                        key={activeTab}
                                        value={activeYear.imagen}
                                        onChange={(file) =>
                                            updateYear(activeTab, {
                                                imagen: file,
                                            })
                                        }
                                        className="aspect-square w-full"
                                    />
                                </div>

                                {/* Texto — ocupa todo el ancho restante */}
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-semibold tracking-widest text-slate-400 uppercase">
                                        Texto
                                    </Label>
                                    <textarea
                                        value={activeYear.texto}
                                        onChange={(e) =>
                                            updateYear(activeTab, {
                                                texto: e.target.value,
                                            })
                                        }
                                        placeholder="Descripción de lo que ocurrió en este año..."
                                        rows={6}
                                        className="min-h-[160px] w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
                                        style={
                                            {
                                                fieldSizing: 'content',
                                                whiteSpace: 'pre-wrap',
                                                wordBreak: 'break-word',
                                            } as React.CSSProperties
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Guardar ── */}
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
