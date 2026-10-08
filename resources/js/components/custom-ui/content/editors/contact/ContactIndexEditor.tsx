'use client';

import ResponsiveBannerEditor from '@/components/custom-ui/content/ResponsiveBannerEditor';
import { Upload } from '@/components/custom-ui/upload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ContentSectionProps as Props } from '@/types/content/content';
import {
    BannerContent,
    ConsultaCard,
    ContactContent,
} from '@/types/content/content-types';
import { useForm } from '@inertiajs/react';
import { Phone, Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

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
        <div
            className={`group relative overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-50 ${className ?? ''}`}
        >
            {/* Contenedor del Upload */}
            <div className="h-full w-full [&_img]:!h-full [&_img]:!w-full [&_img]:!rounded-none [&_img]:!object-cover [&>*]:!h-full [&>*]:!w-full">
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
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:border-slate-300">
            <div className="border-b border-slate-100 bg-slate-50/60 px-5 py-3">
                <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                    {label}
                </p>
            </div>

            <div className="flex flex-col gap-6 p-5 sm:flex-row">
                {/* Imagen opcional con botón de reset */}
                <div className="w-full flex-shrink-0 space-y-2 sm:w-40">
                    <Label className="text-[9px] font-semibold tracking-widest text-slate-400 uppercase">
                        Imagen (Opcional)
                    </Label>
                    <UploadFixed
                        value={card.imagen}
                        onChange={(file) => onUpdate({ imagen: file })}
                        className="mx-auto aspect-square w-full max-w-[140px] sm:mx-0"
                    />
                </div>

                <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label className="text-[9px] font-semibold tracking-widest text-slate-400 uppercase">
                                Título
                            </Label>
                            <Input
                                value={card.titulo_normal || ''}
                                onChange={(e) =>
                                    onUpdate({ titulo_normal: e.target.value })
                                }
                                placeholder="Ej: Centro de"
                                className="text-sm"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[9px] font-semibold tracking-widest text-slate-400 uppercase">
                                Resaltado
                            </Label>
                            <Input
                                value={card.titulo_bold || ''}
                                onChange={(e) =>
                                    onUpdate({ titulo_bold: e.target.value })
                                }
                                placeholder="Ej: Ayuda"
                                className="text-sm font-bold text-primary"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label className="text-[9px] font-semibold tracking-widest text-slate-400 uppercase">
                                Ítems
                            </Label>
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
                                        onChange={(e) =>
                                            updateItem(i, e.target.value)
                                        }
                                        placeholder="Texto del ítem"
                                        className="h-8 text-xs"
                                    />
                                    {card.items.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeItem(i)}
                                            className="text-slate-300 hover:text-red-400"
                                        >
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

    const { data, setData, put, processing } = useForm<{
        content: ContactContent;
    }>({
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
            banner: { ...data.content.banner, ...updates },
        });
    };

    const updateCard = (index: number, patch: Partial<ConsultaCard>) => {
        const newCards = [...data.content.cards] as ContactContent['cards'];
        newCards[index] = { ...newCards[index], ...patch };
        setData('content', { ...data.content, cards: newCards });
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
        <form
            onSubmit={handleSubmit}
            className="mx-auto max-w-4xl space-y-6 pb-20"
        >
            <ResponsiveBannerEditor
                title="Banner de Contacto"
                description="Imagen principal de la cabecera."
                allowedType="image"
                data={data.content.banner}
                onChange={handleBannerChange}
                showTypeTabs={false}
            />

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/50 px-6 py-5">
                    <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
                        <Phone size={22} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">
                            Tarjetas de consulta
                        </h3>
                        <p className="text-xs font-medium text-slate-500">
                            Puedes dejar campos vacíos o eliminar imágenes si no
                            son necesarias.
                        </p>
                    </div>
                </div>

                <div className="space-y-6 p-6">
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

            <div className="fixed right-6 bottom-6 flex justify-end sm:static">
                <Button
                    type="submit"
                    disabled={processing}
                    className="w-full gap-2 rounded-xl px-10 py-6 text-base font-bold shadow-xl transition-transform active:scale-95 sm:w-auto"
                >
                    <Save size={20} />
                    {processing ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
            </div>
        </form>
    );
}
