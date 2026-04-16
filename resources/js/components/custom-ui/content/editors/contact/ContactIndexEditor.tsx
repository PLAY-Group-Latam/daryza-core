'use client';

import { useForm } from '@inertiajs/react';
import { Save, Phone, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ContentSectionProps as Props } from '@/types/content/content';
import { Upload } from '@/components/custom-ui/upload';
import { ContactContent, ConsultaCard, BannerContent } from '@/types/content/content-types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import ResponsiveBannerEditor from '@/components/custom-ui/content/ResponsiveBannerEditor';

// ─── Tipos y Constantes ───────────────────────────────────────────────────────

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
        <div className={`rounded-xl border border-dashed border-slate-300 bg-slate-50 overflow-hidden ${className ?? ''}`}>
            <div className="w-full h-full [&>*]:!w-full [&>*]:!h-full [&_img]:!w-full [&_img]:!h-full [&_img]:!object-cover [&_img]:!rounded-none">
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
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/60">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</p>
            </div>

            {/* Layout Responsivo: Columna en móvil, Fila en escritorio */}
            <div className="p-5 flex flex-col sm:flex-row gap-6">
                
                {/* Contenedor de Imagen ajustable */}
                <div className="flex-shrink-0 w-full sm:w-40 space-y-2">
                    <Label className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">Imagen</Label>
                    <UploadFixed
                        value={card.imagen}
                        onChange={(file) => onUpdate({ imagen: file })}
                        className="w-full aspect-square max-w-[160px] mx-auto sm:mx-0"
                    />
                </div>

                {/* Títulos e Ítems */}
                <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">Título</Label>
                            <Input
                                value={card.titulo_normal}
                                onChange={(e) => onUpdate({ titulo_normal: e.target.value })}
                                placeholder="Centro de"
                                className="text-sm w-full"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">Título resaltado</Label>
                            <Input
                                value={card.titulo_bold}
                                onChange={(e) => onUpdate({ titulo_bold: e.target.value })}
                                placeholder="ayuda"
                                className="text-sm font-bold text-primary w-full"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">Ítems</Label>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button
                                            type="button"
                                            onClick={addItem}
                                            disabled={card.items.length >= 4}
                                            className="flex items-center gap-1 text-[10px] font-semibold text-primary hover:text-primary/70 disabled:text-slate-300 transition-colors"
                                        >
                                            <Plus size={12} /> Agregar ítem
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="text-xs">
                                        {card.items.length >= 4 ? 'Máximo 4' : `Agregar (${card.items.length}/4)`}
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>

                        <div className="space-y-2">
                            {card.items.map((item, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <span className="text-slate-300 text-sm flex-shrink-0">•</span>
                                    <Input
                                        value={item.texto}
                                        onChange={(e) => updateItem(i, e.target.value)}
                                        placeholder={`Ítem ${i + 1}`}
                                        className="text-sm flex-1"
                                    />
                                    {card.items.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeItem(i)}
                                            className="text-slate-300 hover:text-red-400 transition-colors flex-shrink-0 p-1"
                                        >
                                            <Trash2 size={16} />
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
                // Aseguramos que los campos coincidan con lo que espera el componente
                type: rawBanner?.type ?? 'image',
                src_desktop: rawBanner?.src_desktop ?? null,
                src_mobile: rawBanner?.src_mobile ?? null,
                link_url: rawBanner?.link_url ?? '',
            },
            cards: [
                rawContent?.cards?.[0] ?? DEFAULT_CARD,
                rawContent?.cards?.[1] ?? DEFAULT_CARD,
                rawContent?.cards?.[2] ?? DEFAULT_CARD,
                rawContent?.cards?.[3] ?? DEFAULT_CARD,
            ],
        },
    });

    // ── Lógica de actualización igual a Imagen Promocional ──
    const handleBannerChange = (updates: Partial<BannerContent>) => {
        const translatedUpdates: Partial<BannerContent> = {};
        
        if ('src_desktop' in updates) translatedUpdates.src_desktop = updates.src_desktop;
        if ('src_mobile' in updates) translatedUpdates.src_mobile = updates.src_mobile;
        if ('link_url' in updates) translatedUpdates.link_url = updates.link_url;
        if ('type' in updates) translatedUpdates.type = updates.type;

        setData('content', {
            ...data.content,
            banner: { ...data.content.banner, ...translatedUpdates }
        });
    };

    const updateCard = (index: number, patch: Partial<ConsultaCard>) => {
        const updated = [...data.content.cards] as ContactContent['cards'];
        updated[index] = { ...updated[index], ...patch };
        setData('content', { ...data.content, cards: updated });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/content/update/${section.page.slug}/${section.type}/${section.id}`, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => toast.success('¡Página de contacto actualizada!'),
            onError: () => toast.error('Error al guardar'),
        });
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6 pb-20">
            {/* Ahora es idéntico al comportamiento de Imagen Promocional */}
            <ResponsiveBannerEditor
                title="Banner Principal"
                description="Hero principal de la Página de Contacto."
                allowedType="image"
                data={{
                    src_desktop: data.content.banner.src_desktop,
                    src_mobile: data.content.banner.src_mobile,
                    link_url: data.content.banner.link_url ?? '',
                    type: data.content.banner.type,
                }}
                onChange={handleBannerChange}
                showTypeTabs={false} 
            />

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                            <Phone size={22} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Tarjetas de consulta</h3>
                            <p className="text-sm text-slate-500 leading-relaxed">Configura las 4 tarjetas de la sección.</p>
                        </div>
                    </div>
                </div>

                <div className="p-4 sm:p-6 space-y-6">
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
                <Button
                    type="submit"
                    disabled={processing}
                    className="w-full sm:w-auto px-10 py-6 rounded-xl shadow-lg gap-2 text-base font-bold"
                >
                    <Save size={20} />
                    {processing ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
            </div>
        </form>
    );
}