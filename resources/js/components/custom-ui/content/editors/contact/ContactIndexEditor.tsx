'use client';

import { useForm } from '@inertiajs/react';
import { Save, ImagePlus, Phone, Monitor, Smartphone, Image, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ContentSectionProps as Props } from '@/types/content/content';
import { Upload } from '@/components/custom-ui/upload';

// ─── Tipos ───────────────────────────────────────────────────────────────────

type BannerType = 'image' | 'url';

interface BannerContent {
    type: BannerType;
    src_desktop: File | string | null;
    src_mobile: File | string | null;
    link_url: string;
}

interface ConsultaItem {
    texto: string;
}

interface ConsultaCard {
    titulo_normal: string;
    titulo_bold: string;
    imagen: File | string | null;
    items: ConsultaItem[];
}

interface ContactContent {
    banner: BannerContent;
    cards: [ConsultaCard, ConsultaCard, ConsultaCard, ConsultaCard];
}

const DEFAULT_CARD: ConsultaCard = {
    titulo_normal: '',
    titulo_bold: '',
    imagen: null,
    items: [{ texto: '' }, { texto: '' }, { texto: '' }],
};

const CARD_LABELS = [
    'Tarjeta 1 — Superior izquierda',
    'Tarjeta 2 — Superior derecha',
    'Tarjeta 3 — Inferior izquierda',
    'Tarjeta 4 — Inferior derecha',
];

const TYPE_TABS: { key: BannerType; label: string; Icon: React.ElementType }[] = [
    { key: 'image', label: 'Imagen', Icon: Image },
    { key: 'url', label: 'Imagen con URL', Icon: Link2 },
];

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

// ─── Editor de una card ───────────────────────────────────────────────────────

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

    return (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/60">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</p>
            </div>

            <div className="p-5 flex gap-6">
                {/* Imagen al costado */}
                <div className="flex-shrink-0 w-40 space-y-2">
                    <Label className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">Imagen</Label>
                    <UploadFixed
                        value={card.imagen}
                        onChange={(file) => onUpdate({ imagen: file })}
                        className="w-full aspect-square"
                    />
                </div>

                {/* Título + ítems */}
                <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">Título</Label>
                            <Input
                                value={card.titulo_normal}
                                onChange={(e) => onUpdate({ titulo_normal: e.target.value })}
                                placeholder="Centro de"
                                className="text-sm"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">Título resaltado</Label>
                            <Input
                                value={card.titulo_bold}
                                onChange={(e) => onUpdate({ titulo_bold: e.target.value })}
                                placeholder="ayuda"
                                className="text-sm font-bold text-primary"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">Ítems</Label>
                        <div className="space-y-1.5">
                            {card.items.map((item, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <span className="text-slate-300 text-sm">•</span>
                                    <Input
                                        value={item.texto}
                                        onChange={(e) => updateItem(i, e.target.value)}
                                        placeholder={`Ítem ${i + 1}`}
                                        className="text-sm"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Editor principal ─────────────────────────────────────────────────────────

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
            cards: [
                rawContent?.cards?.[0] ?? DEFAULT_CARD,
                rawContent?.cards?.[1] ?? DEFAULT_CARD,
                rawContent?.cards?.[2] ?? DEFAULT_CARD,
                rawContent?.cards?.[3] ?? DEFAULT_CARD,
            ],
        },
    });

    const setBanner = (patch: Partial<BannerContent>) =>
        setData('content', { ...data.content, banner: { ...data.content.banner, ...patch } });

    const updateCard = (index: number, patch: Partial<ConsultaCard>) => {
        const updated = [...data.content.cards] as ContactContent['cards'];
        updated[index] = { ...updated[index], ...patch };
        setData('content', { ...data.content, cards: updated });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Submitting content:', data.content);
        put(`/content/update/${section.page.slug}/${section.type}/${section.id}`, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => toast.success('¡Página de contacto actualizada!'),
            onError: () => toast.error('Error al guardar'),
        });
    };

    const banner = data.content.banner;

    return (
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">

            {/* ── Banner principal ── */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <ImagePlus size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Banner principal</h3>
                            <p className="text-sm text-slate-500">Imagen de fondo del hero superior, una para cada dispositivo.</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-5">

                    {/* Tabs tipo */}
                    <div className="flex rounded-xl border border-slate-200 overflow-hidden">
                        {TYPE_TABS.map(({ key, label, Icon }) => (
                            <button
                                key={key}
                                type="button"
                                onClick={() => setBanner({ type: key })}
                                className={`flex flex-1 items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors
                  ${banner.type === key
                                        ? 'bg-slate-900 text-white'
                                        : 'bg-white text-slate-500 hover:bg-slate-50'}`}
                            >
                                <Icon size={14} />{label}
                            </button>
                        ))}
                    </div>

                    {/* Imágenes desktop + mobile */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
                        <div className="space-y-2">
                            <Label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                                <Monitor size={12} /> Imagen Desktop
                            </Label>
                            <UploadFixed
                                value={banner.src_desktop}
                                onChange={(file) => {
                                    console.log('src_desktop changed:', file); // 👈 agrega esto
                                    setBanner({ src_desktop: file });
                                }}
                                className="w-full aspect-[3/1]"
                            />
                        </div>

                        <div className="space-y-2 flex flex-col items-center">
                            <Label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-slate-400 self-start">
                                <Smartphone size={12} /> Imagen Móvil
                            </Label>
                            <UploadFixed
                                value={banner.src_mobile}
                                onChange={(file) => setBanner({ src_mobile: file })}
                                className="w-[120px] aspect-[9/16]"
                            />
                        </div>
                    </div>

                    {/* URL — solo en tab "url" */}
                    {banner.type === 'url' && (
                        <div className="space-y-1.5">
                            <Label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                                <Link2 size={12} /> Enlace de redirección al hacer clic
                            </Label>
                            <Input
                                value={banner.link_url}
                                onChange={(e) => setBanner({ link_url: e.target.value })}
                                placeholder="https://ejemplo.com/promo"
                                className="text-sm"
                            />
                        </div>
                    )}

                </div>
            </div>

            {/* ── 4 tarjetas fijas ── */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <Phone size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Tarjetas de consulta</h3>
                            <p className="text-sm text-slate-500">Imagen al costado, título y lista de ítems de cada tarjeta.</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-4">
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

            {/* ── Guardar ── */}
            <div className="flex justify-end">
                <Button
                    type="submit"
                    disabled={processing}
                    className="px-10 py-6 rounded-xl shadow-md gap-2 text-base font-bold"
                >
                    <Save size={20} />
                    {processing ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
            </div>
        </form>
    );
}