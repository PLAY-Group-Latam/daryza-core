'use client';

import { useForm } from '@inertiajs/react';
import { Save, Phone, Plus, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ContentSectionProps as Props } from '@/types/content/content';
import { Upload } from '@/components/custom-ui/upload';
import { ContactContent, ConsultaCard, BannerContent } from '@/types/content/content-types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import ResponsiveBannerEditor from '@/components/custom-ui/content/ResponsiveBannerEditor';

// ─── Constantes ──────────────────────────────────────────────────────────────

const DEFAULT_CARD: ConsultaCard = {
    titulo_normal: '',
    titulo_bold: '',
    imagen: null,
    items: [{ texto: '' }],
};

const CARD_LABELS = [
    'Tarjeta 1 — Superior izquierda',
    'Tarjeta 2 — Superior derecha',
    'Tarjeta 3 — Inferior izquierda',
    'Tarjeta 4 — Inferior derecha',
];

// ─── Componentes Internos ─────────────────────────────────────────────────────

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
        <div className={`relative rounded-xl border border-dashed border-slate-300 bg-slate-50 overflow-hidden group ${className ?? ''}`}>
           
            
            {/* Contenedor del Upload */}
            <div className="w-full h-full [&>*]:!w-full [&>*]:!h-full [&_img]:!w-full [&_img]:!h-full [&_img]:!object-cover [&_img]:!rounded-none">
                <Upload
                    value={value}
                    onFileChange={onChange}
                    accept="image/*"
                    // Asegúrate de que el componente Upload no tenga un botón de borrar interno que choque
                    previewClassName="!w-full !h-full !object-cover !rounded-none !border-0 !bg-transparent"
                />
            </div>
        </div>
    );
}

function CardEditor({
    card,
    label,
    onUpdate,
}: {
    card: ConsultaCard;
    label: string;
    onUpdate: (patch: Partial<ConsultaCard>) => void;
}) {
    const updateItem = (i: number, texto: string) => {
        const items = [...card.items];
        items[i] = { texto };
        onUpdate({ items });
    };

    const addItem = () => {
        if (card.items.length >= 4) return;
        onUpdate({ items: [...card.items, { texto: '' }] });
    };

    const removeItem = (i: number) => {
        if (card.items.length <= 1) return;
        const items = card.items.filter((_, idx) => idx !== i);
        onUpdate({ items });
    };

    return (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden transition-all hover:border-slate-300">
            <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/60">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
            </div>

            <div className="p-5 flex flex-col sm:flex-row gap-6">
                {/* Imagen opcional con botón de reset */}
                <div className="flex-shrink-0 w-full sm:w-40 space-y-2">
                    <Label className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">Imagen (Opcional)</Label>
                    <UploadFixed
                        value={card.imagen}
                        onChange={(file) => onUpdate({ imagen: file })}
                        className="w-full aspect-square max-w-[140px] mx-auto sm:mx-0"
                    />
                </div>

                <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">Título</Label>
                            <Input
                                value={card.titulo_normal || ''}
                                onChange={(e) => onUpdate({ titulo_normal: e.target.value })}
                                placeholder="Ej: Centro de"
                                className="text-sm"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">Resaltado</Label>
                            <Input
                                value={card.titulo_bold || ''}
                                onChange={(e) => onUpdate({ titulo_bold: e.target.value })}
                                placeholder="Ej: Ayuda"
                                className="text-sm font-bold text-primary"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">Ítems</Label>
                            <button
                                type="button"
                                onClick={addItem}
                                disabled={card.items.length >= 4}
                                className="text-[10px] font-bold text-primary hover:opacity-70 disabled:text-slate-300"
                            >
                                + Agregar
                            </button>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                            {card.items.map((item, i) => (
                                <div key={i} className="flex gap-2">
                                    <Input
                                        value={item.texto || ''}
                                        onChange={(e) => updateItem(i, e.target.value)}
                                        placeholder="Texto del ítem"
                                        className="text-xs h-8"
                                    />
                                    {card.items.length > 1 && (
                                        <button type="button" onClick={() => removeItem(i)} className="text-slate-300 hover:text-red-400">
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ContactIndexEditor({ section }: Props) {
    const rawContent = section.content?.content as ContactContent;
    const rawBanner = rawContent?.banner;

    const { data, setData, put, processing } = useForm<{ content: ContactContent }>({
        content: {
            banner: {
                type: rawBanner?.type ?? 'image',
                src_desktop: rawBanner?.src_desktop ?? null,
                src_mobile: rawBanner?.src_mobile ?? null,
                link_url: rawBanner?.link_url ?? '',
            },
            // Inicializamos siempre con 4 slots para evitar errores de mapeo
            cards: [
                rawContent?.cards?.[0] || { ...DEFAULT_CARD },
                rawContent?.cards?.[1] || { ...DEFAULT_CARD },
                rawContent?.cards?.[2] || { ...DEFAULT_CARD },
                rawContent?.cards?.[3] || { ...DEFAULT_CARD },
            ],
        },
    });

    const handleBannerChange = (updates: Partial<BannerContent>) => {
        setData('content', {
            ...data.content,
            banner: { ...data.content.banner, ...updates }
        });
    };

    const updateCard = (index: number, patch: Partial<ConsultaCard>) => {
        const newCards = [...data.content.cards] as ContactContent['cards'];
        newCards[index] = { ...newCards[index], ...patch };
        setData('content', { ...data.content, cards: newCards });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/content/update/${section.page.slug}/${section.type}/${section.id}`, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => toast.success('¡Cambios guardados!'),
            onError: () => toast.error('Error al guardar'),
        });
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6 pb-20">
            <ResponsiveBannerEditor
                title="Banner de Contacto"
                description="Imagen principal de la cabecera."
                allowedType="image"
                data={data.content.banner}
                onChange={handleBannerChange}
                showTypeTabs={false} 
            />

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                    <div className="p-2.5 bg-primary/10 rounded-xl text-primary"><Phone size={22} /></div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">Tarjetas de consulta</h3>
                        <p className="text-xs text-slate-500 font-medium">Puedes dejar campos vacíos o eliminar imágenes si no son necesarias.</p>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {data.content.cards.map((card, index) => (
                        <CardEditor
                            key={index}
                            card={card}
                            label={CARD_LABELS[index]}
                            onUpdate={(patch) => updateCard(index, patch)}
                        />
                    ))}
                </div>
            </div>

            <div className="fixed bottom-6 right-6 sm:static flex justify-end">
                <Button type="submit" disabled={processing} className="w-full sm:w-auto px-10 py-6 rounded-xl shadow-xl gap-2 text-base font-bold transition-transform active:scale-95">
                    <Save size={20} />
                    {processing ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
            </div>
        </form>
    );
}