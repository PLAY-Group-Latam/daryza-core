'use client';

import { Upload } from '@/components/custom-ui/upload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ContentSectionProps as Props } from '@/types/content/content';
import {
    SustainabilityCard,
    SustainabilityContent,
} from '@/types/content/content-types';
import { useForm } from '@inertiajs/react';
import { FileText, Leaf, Plus, Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const DEFAULT_CARD = (): SustainabilityCard => ({ imagen: null, nombre: '' });

// ─── Upload con aspect ratio fijo ─────────────────────────────────────────────

function UploadFixed({
    value,
    onChange,
    className,
    uploadKey,
}: {
    value: File | string | null;
    onChange: (f: File | string | null) => void;
    className?: string;
    uploadKey?: string | number;
}) {
    return (
        <div
            className={`overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-50 ${className ?? ''}`}
        >
            <div className="h-full w-full [&_img]:!h-full [&_img]:!w-full [&_img]:!rounded-none [&_img]:!object-cover [&>*]:!h-full [&>*]:!w-full">
                <Upload
                    key={uploadKey}
                    value={value}
                    onFileChange={onChange}
                    accept="image/*"
                    previewClassName="!w-full !h-full !object-cover !rounded-none !border-0 !bg-transparent"
                />
            </div>
        </div>
    );
}

// ─── Editor de una card ───────────────────────────────────────────────────────

function CardEditor({
    card,
    index,
    onUpdate,
    onRemove,
    canRemove,
}: {
    card: SustainabilityCard;
    index: number;
    onUpdate: (patch: Partial<SustainabilityCard>) => void;
    onRemove: () => void;
    canRemove: boolean;
}) {
    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 px-5 py-3.5">
                <p className="text-xs font-bold tracking-widest text-slate-500 uppercase">
                    Ítem {index + 1}
                </p>
                <button
                    type="button"
                    onClick={onRemove}
                    disabled={!canRemove}
                    className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-30"
                >
                    <Trash2 size={16} />
                </button>
            </div>

            <div className="grid grid-cols-1 items-start gap-5 p-5 sm:grid-cols-[160px_1fr]">
                {/* Imagen circular */}
                <div className="space-y-2">
                    <Label className="text-[9px] font-semibold tracking-widest text-slate-400 uppercase">
                        Imagen
                    </Label>
                    <UploadFixed
                        value={card.imagen}
                        onChange={(file) => onUpdate({ imagen: file })}
                        className="aspect-square w-full rounded-full"
                        uploadKey={index}
                    />
                </div>

                {/* Nombre */}
                <div className="space-y-1.5">
                    <Label className="text-[9px] font-semibold tracking-widest text-slate-400 uppercase">
                        Nombre
                    </Label>
                    <Input
                        value={card.nombre}
                        onChange={(e) => onUpdate({ nombre: e.target.value })}
                        placeholder="Pasión"
                        className="text-sm font-bold text-primary"
                    />
                </div>
            </div>
        </div>
    );
}

// ─── Editor principal ─────────────────────────────────────────────────────────

export default function SustainabilityEditor({ section }: Props) {
    const rawContent = section.content?.content as SustainabilityContent;

    const { data, setData, put, processing } = useForm<{
        content: SustainabilityContent;
    }>({
        content: {
            titulo: rawContent?.titulo ?? '',
            descripcion: rawContent?.descripcion ?? '',
            cards: rawContent?.cards?.length
                ? rawContent.cards
                : Array.from({ length: 5 }, DEFAULT_CARD),
        },
    });

    const set = <K extends keyof SustainabilityContent>(
        key: K,
        val: SustainabilityContent[K],
    ) => setData('content', { ...data.content, [key]: val });

    const updateCard = (index: number, patch: Partial<SustainabilityCard>) => {
        const updated = [...data.content.cards];
        updated[index] = { ...updated[index], ...patch };
        set('cards', updated);
    };

    const addCard = () => set('cards', [...data.content.cards, DEFAULT_CARD()]);

    const removeCard = (index: number) => {
        if (data.content.cards.length <= 1) return;
        set(
            'cards',
            data.content.cards.filter((_, i) => i !== index),
        );
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
                                Título y descripción de la sección.
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
                            placeholder="Sostenibilidad - Productos BIO"
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
                                } as React.CSSProperties
                            }
                        />
                    </div>
                </div>
            </div>

            {/* ── Ítems ── */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-primary/10 p-2 text-primary">
                                <Leaf size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">
                                    Ítems de sostenibilidad
                                </h3>
                                <p className="text-sm text-slate-500">
                                    Imagen circular y nombre de cada ítem.
                                </p>
                            </div>
                        </div>
                        <Button
                            type="button"
                            onClick={addCard}
                            variant="outline"
                            size="sm"
                            className="gap-1.5 text-sm"
                        >
                            <Plus size={14} /> Agregar
                        </Button>
                    </div>
                </div>

                <div className="space-y-4 p-6">
                    {data.content.cards.map((card, index) => (
                        <CardEditor
                            key={index}
                            card={card}
                            index={index}
                            onUpdate={(patch) => updateCard(index, patch)}
                            onRemove={() => removeCard(index)}
                            canRemove={data.content.cards.length > 1}
                        />
                    ))}
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
