'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    ContentSectionProps as Props,
    SocialItem,
    SocialsContent,
} from '@/types/content/content';
import { useForm } from '@inertiajs/react';
import { GripVertical, ImagePlus, Save, Share2, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

function SocialImageUpload({
    value,
    onChange,
}: {
    value: File | string | null;
    onChange: (file: File) => void;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const preview =
        value instanceof File ? URL.createObjectURL(value) : (value ?? null);

    return (
        <>
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onChange(file);
                }}
            />
            <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="group relative flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 transition-all hover:border-primary/60 hover:bg-primary/5"
            >
                {preview ? (
                    <>
                        <img
                            src={preview}
                            alt="social icon"
                            className="relative z-10 h-full w-full object-contain p-2 drop-shadow-sm"
                        />

                        {/* Overlay de hover */}
                        <div className="absolute inset-0 z-20 flex items-center justify-center rounded-xl bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                            <ImagePlus size={14} className="text-white" />
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center gap-0.5 text-slate-400 transition-colors group-hover:text-primary">
                        <ImagePlus size={14} />
                        <span className="text-[8px] font-semibold uppercase">
                            Logo
                        </span>
                    </div>
                )}
            </button>
        </>
    );
}

export default function SocialsEditor({ section }: Props) {
    const rawContent = section.content?.content as SocialsContent;

    const { data, setData, put, processing } = useForm<{
        content: SocialsContent;
    }>({
        content: {
            socials: rawContent?.socials ?? [],
        },
    });

    const dragIndex = useRef<number | null>(null);
    const [dragOver, setDragOver] = useState<number | null>(null);

    const addSocial = () => {
        const newItem: SocialItem = { id: Date.now(), image: null, url: '' };
        setData('content', { socials: [...data.content.socials, newItem] });
    };

    const removeSocial = (index: number) => {
        setData('content', {
            socials: data.content.socials.filter((_, i) => i !== index),
        });
    };

    const updateSocial = (index: number, patch: Partial<SocialItem>) => {
        const updated = [...data.content.socials];
        updated[index] = { ...updated[index], ...patch };
        setData('content', { socials: updated });
    };

    const handleDragStart = (index: number) => {
        dragIndex.current = index;
    };
    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        setDragOver(index);
    };
    const handleDragEnd = () => {
        dragIndex.current = null;
        setDragOver(null);
    };
    const handleDrop = (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();
        if (dragIndex.current === null || dragIndex.current === dropIndex) {
            setDragOver(null);
            return;
        }
        const updated = [...data.content.socials];
        const dragged = updated[dragIndex.current];
        updated.splice(dragIndex.current, 1);
        updated.splice(dropIndex, 0, dragged);
        setData('content', { socials: updated });
        dragIndex.current = null;
        setDragOver(null);
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
                    toast.error('Error al guardar');
                },
            },
        );
    };

    return (
        <form onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-6">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                {/* Header */}
                <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-5">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-primary/10 p-2 text-primary">
                            <Share2 size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">
                                Configuración de {section.name}
                            </h3>
                            <p className="text-sm text-slate-500">
                                Agrega, elimina y reordena las redes sociales
                                arrastrando. Cada una tiene su logo e URL.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Preview */}
                {data.content.socials.length > 0 && (
                    <div className="px-8 pt-6">
                        <p className="mb-3 text-xs font-semibold tracking-widest text-slate-400 uppercase">
                            Vista previa
                        </p>
                        <div className="flex flex-wrap gap-3 rounded-xl bg-slate-800 p-4">
                            {data.content.socials.map((social) => {
                                const preview =
                                    social.image instanceof File
                                        ? URL.createObjectURL(social.image)
                                        : (social.image ?? null);

                                return (
                                    <div
                                        key={social.id}
                                        className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg border border-white/10"
                                        style={{
                                            // Patrón de transparencia CSS
                                            backgroundColor: '#1e293b',
                                            backgroundImage: `linear-gradient(45deg, #334155 25%, transparent 25%), linear-gradient(-45deg, #334155 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #334155 75%), linear-gradient(-45deg, transparent 75%, #334155 75%)`,
                                            backgroundSize: '8px 8px',
                                            backgroundPosition:
                                                '0 0, 0 4px, 4px 4px, 4px 0',
                                        }}
                                    >
                                        {preview ? (
                                            <img
                                                src={preview}
                                                alt=""
                                                className="h-full w-full object-contain p-1.5"
                                            />
                                        ) : (
                                            <div className="h-4 w-4 rounded bg-white/20" />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Lista */}
                <div className="space-y-2 p-8">
                    <div className="mb-4 flex items-center justify-between">
                        <Label className="text-[9px] font-semibold tracking-widest text-slate-400 uppercase">
                            Redes ({data.content.socials.length})
                        </Label>
                        <p className="text-[10px] text-slate-400">
                            Arrastra para reordenar
                        </p>
                    </div>

                    {data.content.socials.length === 0 && (
                        <div className="rounded-xl border-2 border-dashed border-slate-200 py-10 text-center text-sm text-slate-400">
                            No hay redes sociales. Agrega una abajo.
                        </div>
                    )}

                    {data.content.socials.map((social, index) => (
                        <div
                            key={social.id}
                            draggable
                            onDragStart={() => handleDragStart(index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDrop={(e) => handleDrop(e, index)}
                            onDragEnd={handleDragEnd}
                            className={`flex cursor-grab items-center gap-3 rounded-xl border bg-white p-3 transition-all active:cursor-grabbing ${
                                dragOver === index
                                    ? 'scale-[1.01] border-primary/50 bg-primary/5 shadow-md'
                                    : 'border-slate-200 hover:border-primary/30 hover:shadow-sm'
                            }`}
                        >
                            {/* Drag handle */}
                            <div className="flex-shrink-0 text-slate-300 transition-colors hover:text-slate-500">
                                <GripVertical size={18} />
                            </div>

                            {/* Número */}
                            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500">
                                {index + 1}
                            </div>

                            {/* Logo upload */}
                            <SocialImageUpload
                                value={social.image}
                                onChange={(file) =>
                                    updateSocial(index, { image: file })
                                }
                            />

                            {/* URL */}
                            <div className="min-w-0 flex-1">
                                <Label className="mb-1 block text-[9px] font-semibold tracking-widest text-slate-400 uppercase">
                                    URL de la red social
                                </Label>
                                <Input
                                    value={social.url}
                                    onChange={(e) =>
                                        updateSocial(index, {
                                            url: e.target.value,
                                        })
                                    }
                                    placeholder="https://www.facebook.com/..."
                                    className="text-sm font-medium"
                                />
                            </div>

                            {/* Ver link */}
                            {social.url && (
                                <a
                                    href={social.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-shrink-0 text-[10px] text-slate-400 underline transition-colors hover:text-primary"
                                >
                                    Ver
                                </a>
                            )}

                            {/* Eliminar */}
                            <button
                                type="button"
                                onClick={() => removeSocial(index)}
                                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-400 transition-all hover:bg-red-500 hover:text-white"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}

                    {/* Agregar */}
                    <button
                        type="button"
                        onClick={addSocial}
                        className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 py-3 text-sm font-medium text-slate-400 transition-all hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
                    >
                        <Share2 size={16} />
                        Agregar red social
                    </button>
                </div>
            </div>

            {/* Guardar */}
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
