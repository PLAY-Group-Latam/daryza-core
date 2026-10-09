'use client';

import ResponsiveBannerEditor from '@/components/custom-ui/content/ResponsiveBannerEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ContentSectionProps as Props } from '@/types/content/content';
import { PromotionalItem, SocialItem } from '@/types/content/content-types';
import { useForm } from '@inertiajs/react';
import {
    GripVertical,
    ImagePlus,
    Plus,
    Save,
    Share2,
    Trash2,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

const DEFAULT_IMAGE = 'https://placehold.co/600x600/f1f5f9/94a3b8?text=Imagen';

interface CombinedContent {
    promotions: PromotionalItem[];
    socials: SocialItem[];
}

// ─── Social Logo Upload ──────────────────
function SocialImageUpload({
    value,
    onChange,
}: {
    value: File | string | null;
    onChange: (file: File) => void;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const preview =
        value instanceof File
            ? URL.createObjectURL(value)
            : value || DEFAULT_IMAGE;
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
                className="group relative flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50 transition-all hover:border-primary/60 hover:bg-primary/5"
            >
                <img
                    src={preview}
                    alt="social icon"
                    className="h-full w-full object-contain p-2"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = DEFAULT_IMAGE;
                    }}
                />
                <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                    <ImagePlus size={14} className="text-white" />
                </div>
            </button>
        </>
    );
}

export default function CombinedFooterEditor({ section }: Props) {
    const rawContent = section.content?.content as {
        items?: PromotionalItem[];
        socials?: SocialItem[];
    };

    const { data, setData, put, processing, transform } = useForm<{
        content: CombinedContent;
    }>({
        content: {
            promotions:
                rawContent?.items
                    ?.map((item) => ({
                        ...item,
                        id: item.id || crypto.randomUUID(),
                    }))
                    .slice(0, 2) ?? [],
            socials: rawContent?.socials ?? [],
        },
    });

    transform((values) => ({
        content: {
            items: values.content.promotions,
            socials: values.content.socials,
        },
    }));

    const dragIndex = useRef<number | null>(null);
    const [dragOver, setDragOver] = useState<number | null>(null);

    // ✅ FIXED: Ahora los cambios se fusionan correctamente con el objeto existente
    const updatePromo = (index: number, updates: Partial<PromotionalItem>) => {
        const newPromotions = [...data.content.promotions];

        // Hacemos spread del item anterior y encima los updates
        // Esto evita que si updates solo trae 'src_desktop', se borre 'src_mobile'
        newPromotions[index] = {
            ...newPromotions[index],
            ...updates,
        };

        setData('content', {
            ...data.content,
            promotions: newPromotions,
        });
    };

    const addPromo = () => {
        if (data.content.promotions.length >= 2) return;
        setData('content', {
            ...data.content,
            promotions: [
                ...data.content.promotions,
                {
                    id: crypto.randomUUID(),
                    src_desktop: null,
                    src_mobile: null,
                    link_url: '',
                },
            ],
        });
    };

    const updateSocial = (index: number, patch: Partial<SocialItem>) => {
        const updated = [...data.content.socials];
        updated[index] = { ...updated[index], ...patch };
        setData('content', { ...data.content, socials: updated });
    };

    const addSocial = () => {
        setData('content', {
            ...data.content,
            socials: [
                ...data.content.socials,
                { id: Number(Date.now()), image: null, url: '' },
            ],
        });
    };

    const handleDragStart = (index: number) => {
        dragIndex.current = index;
    };
    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        setDragOver(index);
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
        setData('content', { ...data.content, socials: updated });
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
                    toast.error('Error al guardar los cambios');
                },
            },
        );
    };
    return (
        <form
            onSubmit={handleSubmit}
            className="mx-auto max-w-5xl space-y-12 px-4 pb-24"
        >
            {/* ── SECCIÓN IMÁGENES PROMOCIONALES ── */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-slate-900 p-2 text-white shadow-lg shadow-slate-200">
                            <ImagePlus size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 uppercase italic">
                                Banner Promocional Blog
                            </h2>
                            <p className="text-sm font-medium text-slate-500 italic">
                                Máximo 2 banners configurables.
                            </p>
                        </div>
                    </div>
                    {data.content.promotions.length < 2 && (
                        <Button
                            type="button"
                            onClick={addPromo}
                            variant="outline"
                            className="gap-2 rounded-xl border-slate-200 font-bold shadow-sm transition-all hover:bg-slate-50"
                        >
                            <Plus size={18} /> AGREGAR BANNER
                        </Button>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-10">
                    {data.content.promotions.map((item, index) => (
                        <div key={item.id} className="group relative">
                            <button
                                type="button"
                                onClick={() => {
                                    const filtered =
                                        data.content.promotions.filter(
                                            (_, i) => i !== index,
                                        );
                                    setData('content', {
                                        ...data.content,
                                        promotions: filtered,
                                    });
                                }}
                                className="absolute -top-3 -right-3 z-20 rounded-full border border-slate-100 bg-white p-2.5 text-slate-400 shadow-xl transition-all hover:text-red-500"
                            >
                                <Trash2 size={16} />
                            </button>

                            <ResponsiveBannerEditor
                                title={`Banner #0${index + 1}`}
                                description="Sube las versiones para escritorio y móvil."
                                data={{
                                    src_desktop: item.src_desktop,
                                    src_mobile: item.src_mobile,
                                    link_url: item.link_url ?? '',
                                    type: 'url',
                                }}
                                onChange={(updates) =>
                                    updatePromo(index, updates)
                                }
                                showTypeTabs={false}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* ── SECCIÓN REDES SOCIALES ── */}
            <div className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm">
                <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-slate-100 p-2 text-slate-600">
                            <Share2 size={24} />
                        </div>
                        <div>
                            <h3 className="text-l font-black tracking-tight text-slate-900 uppercase">
                                Redes Sociales
                            </h3>
                            <p className="text-xs font-bold tracking-widest text-slate-400 uppercase">
                                Iconos y enlaces
                            </p>
                        </div>
                    </div>
                    <Button
                        type="button"
                        onClick={addSocial}
                        variant="outline"
                        size="sm"
                        className="rounded-xl border-none bg-slate-900 px-4 font-bold text-white hover:bg-black"
                    >
                        + AGREGAR RED
                    </Button>
                </div>

                <div className="space-y-3">
                    {data.content.socials.map((social, index) => (
                        <div
                            key={social.id}
                            draggable
                            onDragStart={() => handleDragStart(index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDrop={(e) => handleDrop(e, index)}
                            className={`group flex items-center gap-4 rounded-2xl border bg-white p-3 transition-all ${dragOver === index ? 'border-primary bg-slate-50 ring-4 ring-primary/5' : 'border-slate-100 shadow-sm hover:border-slate-300'}`}
                        >
                            <GripVertical
                                size={20}
                                className="flex-shrink-0 cursor-grab text-slate-300 active:cursor-grabbing"
                            />
                            <SocialImageUpload
                                value={social.image}
                                onChange={(file) =>
                                    updateSocial(index, { image: file })
                                }
                            />
                            <Input
                                value={social.url}
                                onChange={(e) =>
                                    updateSocial(index, { url: e.target.value })
                                }
                                placeholder="https://..."
                                className="h-11 border-none bg-slate-50 text-slate-900 transition-all focus:bg-white focus:ring-1 focus:ring-slate-200"
                            />
                            <button
                                type="button"
                                onClick={() =>
                                    setData('content', {
                                        ...data.content,
                                        socials: data.content.socials.filter(
                                            (_, i) => i !== index,
                                        ),
                                    })
                                }
                                className="rounded-xl p-2.5 text-slate-300 transition-all hover:bg-red-50 hover:text-red-500"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* BOTÓN FLOTANTE GUARDAR */}
            <div className="sticky bottom-6 z-50 flex justify-center">
                <Button
                    type="submit"
                    disabled={processing}
                    className="h-16 gap-3 rounded-full bg-slate-900 px-20 text-lg font-black text-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] transition-all hover:bg-black active:scale-95"
                >
                    <Save size={24} />
                    {processing ? 'GUARDANDO...' : 'GUARDAR CONFIGURACIÓN'}
                </Button>
            </div>
        </form>
    );
}
