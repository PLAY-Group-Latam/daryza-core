'use client';

import { Upload } from '@/components/custom-ui/upload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useForm } from '@inertiajs/react';
import {
    Eye, EyeOff, GripVertical, ImageIcon, Layout,
    Link2, Monitor, Plus, Save, Smartphone, Trash2, Video,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { ContentSectionProps } from '@/types/content/content';

// ── Tipos ────────────────────────────────────────────────────────────────────
type SlideType = 'image' | 'video' | 'url';

interface Slide {
    id:          number;
    type:        SlideType;
    is_active:   boolean;
    src_desktop: File | string | null;  // upload real
    src_mobile:  File | string | null;  // upload real
    src_video:   File | string | null;  // upload real
    link_url:    string;                // solo en tab "url"
}

interface BannerContent { slides: Slide[] }

function newSlide(): Slide {
    return {
        id: Date.now(), type: 'image', is_active: true,
        src_desktop: null, src_mobile: null, src_video: null, link_url: '',
    };
}

function normalize(raw: any): BannerContent {
    if (raw?.slides && Array.isArray(raw.slides)) return raw as BannerContent;
    return { slides: [newSlide()] };
}

const TYPE_TABS: { key: SlideType; label: string; Icon: React.ElementType }[] = [
    { key: 'image', label: 'Imagen',     Icon: ImageIcon },
    { key: 'video', label: 'Video',      Icon: Video     },
    { key: 'url',   label: 'Imagen URL', Icon: Link2     },
];

// ── SlideCard ─────────────────────────────────────────────────────────────────
function SlideCard({
    slide, index, isDragOver,
    onDragStart, onDragOver, onDrop, onDragEnd,
    onChange, onRemove, canRemove,
}: {
    slide: Slide; index: number; isDragOver: boolean;
    onDragStart: () => void;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
    onDragEnd: () => void;
    onChange: (s: Slide) => void;
    onRemove: () => void;
    canRemove: boolean;
}) {
    const set = (patch: Partial<Slide>) => onChange({ ...slide, ...patch });

    return (
        <div
            draggable
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onDragEnd={onDragEnd}
            className={`rounded-2xl border bg-white shadow-sm transition-all select-none
                ${isDragOver
                    ? 'border-primary/50 bg-primary/5 shadow-lg scale-[1.01]'
                    : 'border-slate-200 hover:border-slate-300'}
                ${!slide.is_active ? 'opacity-50' : ''}`}
        >
            {/* ── Cabecera ── */}
            <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/60 px-5 py-3 rounded-t-2xl">
                <div className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 transition-colors">
                    <GripVertical size={18} />
                </div>
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-[11px] font-bold text-slate-600 flex-shrink-0">
                    {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800">Slide #{index + 1}</p>
                    <p className="text-[10px] text-slate-400">
                        {slide.type === 'image' ? 'Imagen' : slide.type === 'video' ? 'Video' : 'Imagen URL'}
                        {' · '}{slide.is_active ? 'Activo' : 'Inactivo'}
                    </p>
                </div>

                {/* Toggle activo/inactivo */}
                <div className="flex items-center gap-2 flex-shrink-0">
                    {slide.is_active
                        ? <Eye size={14} className="text-green-500" />
                        : <EyeOff size={14} className="text-slate-400" />}
                    <Switch
                        checked={slide.is_active}
                        onCheckedChange={(v) => set({ is_active: v })}
                    />
                </div>

                {canRemove && (
                    <button type="button" onClick={onRemove}
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all flex-shrink-0">
                        <Trash2 size={13} />
                    </button>
                )}
            </div>

            {/* ── Cuerpo ── */}
            <div className="p-5 space-y-5">

                {/* Tabs tipo */}
                <div className="flex rounded-xl border border-slate-200 overflow-hidden">
                    {TYPE_TABS.map(({ key, label, Icon }) => (
                        <button key={key} type="button" onClick={() => set({ type: key })}
                            className={`flex flex-1 items-center justify-center gap-2 py-2 text-sm font-medium transition-colors
                                ${slide.type === key
                                    ? 'bg-slate-900 text-white'
                                    : 'bg-white text-slate-500 hover:bg-slate-50'}`}>
                            <Icon size={14} />{label}
                        </button>
                    ))}
                </div>

                {/* ── IMAGEN: 2 uploads reales, sin link ── */}
                {slide.type === 'image' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                                <Monitor size={12} /> Imagen Desktop
                            </Label>
                            <Upload
                                value={slide.src_desktop}
                                onFileChange={(file) => set({ src_desktop: file })}
                                accept="image/*" placeholder="Subir imagen" type="image"
                                previewClassName="w-full aspect-video rounded-xl object-cover border border-dashed border-slate-200"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                                <Smartphone size={12} /> Imagen Mobile
                            </Label>
                            <Upload
                                value={slide.src_mobile}
                                onFileChange={(file) => set({ src_mobile: file })}
                                accept="image/*" placeholder="Subir imagen" type="image"
                                previewClassName="w-full aspect-video rounded-xl object-cover border border-dashed border-slate-200"
                            />
                        </div>
                    </div>
                )}

                {/* ── VIDEO: 1 upload real, sin link ── */}
                {slide.type === 'video' && (
                    <div className="space-y-1.5">
                        <Label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                            <Video size={12} /> Video Promocional
                        </Label>
                        <Upload
                            value={slide.src_video}
                            onFileChange={(file) => set({ src_video: file })}
                            accept="video/*" placeholder="Subir video" type="video"
                            previewClassName="w-full aspect-video rounded-xl object-cover border border-dashed border-slate-200"
                        />
                        <p className="text-[10px] text-slate-400">El video se mostrará en desktop y mobile</p>
                    </div>
                )}

                {/* ── IMAGEN URL: 2 uploads reales + 1 input de link de redirección ── */}
                {slide.type === 'url' && (
                    <div className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                                    <Monitor size={12} /> Imagen Desktop
                                </Label>
                                <Upload
                                    value={slide.src_desktop}
                                    onFileChange={(file) => set({ src_desktop: file })}
                                    accept="image/*" placeholder="Subir imagen" type="image"
                                    previewClassName="w-full aspect-video rounded-xl object-cover border border-dashed border-slate-200"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                                    <Smartphone size={12} /> Imagen Mobile
                                </Label>
                                <Upload
                                    value={slide.src_mobile}
                                    onFileChange={(file) => set({ src_mobile: file })}
                                    accept="image/*" placeholder="Subir imagen" type="image"
                                    previewClassName="w-full aspect-video rounded-xl object-cover border border-dashed border-slate-200"
                                />
                            </div>
                        </div>

                        {/* Input de URL de redirección */}
                        <div className="space-y-1.5">
                            <Label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                                <Link2 size={12} /> Enlace de redirección al hacer clic
                            </Label>
                            <Input
                                value={slide.link_url}
                                onChange={(e) => set({ link_url: e.target.value })}
                                placeholder="https://ejemplo.com/promo"
                                className="text-sm"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Editor principal ──────────────────────────────────────────────────────────
export default function BannerDinamicoEditor({ section }: ContentSectionProps) {
    const raw = section.content?.content;
    const { data, setData, put, processing } = useForm<{ content: BannerContent }>({
        content: normalize(raw),
    });

    const dragIndex = useRef<number | null>(null);
    const [dragOver, setDragOver] = useState<number | null>(null);

    const setSlides = (slides: Slide[]) => setData('content', { slides });
    const addSlide  = () => setSlides([...data.content.slides, newSlide()]);
    const removeSlide = (i: number) => {
        if (data.content.slides.length === 1) { toast.error('Debe haber al menos un slide'); return; }
        setSlides(data.content.slides.filter((_, idx) => idx !== i));
    };
    const updateSlide = (i: number, s: Slide) => {
        const slides = [...data.content.slides];
        slides[i] = s;
        setSlides(slides);
    };

    const handleDragStart = (i: number) => { dragIndex.current = i; };
    const handleDragOver  = (e: React.DragEvent, i: number) => { e.preventDefault(); setDragOver(i); };
    const handleDragEnd   = () => { dragIndex.current = null; setDragOver(null); };
    const handleDrop      = (e: React.DragEvent, dropIdx: number) => {
        e.preventDefault();
        if (dragIndex.current === null || dragIndex.current === dropIdx) { setDragOver(null); return; }
        const slides = [...data.content.slides];
        const [dragged] = slides.splice(dragIndex.current, 1);
        slides.splice(dropIdx, 0, dragged);
        setSlides(slides);
        dragIndex.current = null;
        setDragOver(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Submitting banner with content:', data.content);
        put(`/content/update/${section.page.slug}/${section.type}/${section.id}`, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => toast.success('¡Banner actualizado!'),
            onError:   () => toast.error('Error al guardar'),
        });
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary"><Layout size={20} /></div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Banner Dinámico</h3>
                            <p className="text-sm text-slate-500">Gestiona las imágenes y videos del carrusel principal.</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                            Slides ({data.content.slides.length})
                        </p>
                        <p className="text-[10px] text-slate-400">Arrastra para reordenar</p>
                    </div>

                    {data.content.slides.map((slide, index) => (
                        <SlideCard
                            key={slide.id}
                            slide={slide}
                            index={index}
                            isDragOver={dragOver === index}
                            onDragStart={() => handleDragStart(index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDrop={(e) => handleDrop(e, index)}
                            onDragEnd={handleDragEnd}
                            onChange={(s) => updateSlide(index, s)}
                            onRemove={() => removeSlide(index)}
                            canRemove={data.content.slides.length > 1}
                        />
                    ))}

                    <button type="button" onClick={addSlide}
                        className="w-full py-3 rounded-xl border-2 border-dashed border-slate-200 text-slate-400
                                   hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-all
                                   flex items-center justify-center gap-2 text-sm font-medium">
                        <Plus size={16} /> Agregar Slide
                    </button>
                </div>
            </div>

            <div className="flex justify-end">
                <Button type="submit" disabled={processing} className="px-10 py-6 rounded-xl shadow-md gap-2 text-base font-bold">
                    <Save size={20} />
                    {processing ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
            </div>
        </form>
    );
}