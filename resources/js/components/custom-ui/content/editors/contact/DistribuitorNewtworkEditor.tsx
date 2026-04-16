'use client';

import { useForm } from '@inertiajs/react';
import { Save, Image, LayoutGrid, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { ContentSectionProps as Props } from '@/types/content/content';
import { Upload } from '@/components/custom-ui/upload';
import { BannerContent, DistributorCard, DistributorNetworkContent } from '@/types/content/content';
import ResponsiveBannerEditor from '@/components/custom-ui/content/ResponsiveBannerEditor';

const DEFAULT_CARD: DistributorCard = { imagen: null, titulo: '', texto: '' };
const CARD_LABELS = ['Tarjeta 1', 'Tarjeta 2', 'Tarjeta 3', 'Tarjeta 4'];

const checkerboardStyle = {
    backgroundColor: '#f8fafc',
    backgroundImage: `linear-gradient(45deg, #e2e8f0 25%, transparent 25%), 
                    linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), 
                    linear-gradient(45deg, transparent 75%, #e2e8f0 75%), 
                    linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)`,
    backgroundSize: '10px 10px',
    backgroundPosition: '0 0, 0 5px, 5px 5px, 5px 0'
};

// ─── Upload para elementos secundarios (Cards y Form) ─────────────────────────

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

// ─── Editor de una card ──────────────────────────────────────────────────────

function CardEditor({
    card,
    label,
    onUpdate,
}: {
    card: DistributorCard;
    label: string;
    onUpdate: (patch: Partial<DistributorCard>) => void;
}) {
    return (
        <div className="group rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
            <div className="px-5 py-2.5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{label}</p>
                {card.imagen && (
                    <button
                        type="button"
                        onClick={() => onUpdate({ imagen: null })}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                    >
                        <Trash2 size={14} />
                    </button>
                )}
            </div>

            <div className="p-5">
                <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex flex-col items-center gap-2">
                        <Label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest text-center w-full">Imagen</Label>
                        <div
                            className="relative w-24 h-24 rounded-xl border border-slate-200 overflow-hidden flex items-center justify-center group/img"
                            style={checkerboardStyle}
                        >
                            <UploadFixed
                                value={card.imagen}
                                onChange={(file) => onUpdate({ imagen: file })}
                                className="w-full h-full border-0 bg-transparent"
                            />
                        </div>
                    </div>

                    <div className="flex-1 min-w-0 space-y-4">
                        <div className="space-y-1.5">
                            <Label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Título</Label>
                            <Input
                                value={card.titulo}
                                onChange={(e) => onUpdate({ titulo: e.target.value })}
                                placeholder="Ej: Marca Peruana"
                                className="text-sm font-medium"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Descripción</Label>
                            <textarea
                                value={card.texto}
                                onChange={(e) => onUpdate({ texto: e.target.value })}
                                placeholder="Escribe el contenido..."
                                className="w-full text-sm rounded-lg border border-slate-200 bg-white px-3 py-2 focus:ring-1 focus:ring-primary/30 min-h-[80px] resize-none"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Editor principal ─────────────────────────────────────────────────────────

export default function DistributorNetworkEditor({ section }: Props) {
    const rawContent = section.content?.content as DistributorNetworkContent;
    const rawBanner = rawContent?.banner;

    const { data, setData, put, processing } = useForm<{ content: DistributorNetworkContent }>({
        content: {
            banner: {
                type: 'url',
                src_desktop: rawBanner?.src_desktop ?? null,
                src_mobile: rawBanner?.src_mobile ?? null,
                link_url: rawBanner?.link_url ?? '',
            },
            form_image: rawContent?.form_image ?? null,
            cards: [
                rawContent?.cards?.[0] ?? DEFAULT_CARD,
                rawContent?.cards?.[1] ?? DEFAULT_CARD,
                rawContent?.cards?.[2] ?? DEFAULT_CARD,
                rawContent?.cards?.[3] ?? DEFAULT_CARD,
            ],
        },
    });

    const handleBannerChange = (updates: Partial<BannerContent>) =>
        setData('content', { ...data.content, banner: { ...data.content.banner, ...updates } });

    const setFormImage = (file: File | string | null) =>
        setData('content', { ...data.content, form_image: file });

    const updateCard = (index: number, patch: Partial<DistributorCard>) => {
        const updated = [...data.content.cards] as DistributorNetworkContent['cards'];
        updated[index] = { ...updated[index], ...patch };
        setData('content', { ...data.content, cards: updated });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/content/update/${section.page.slug}/${section.type}/${section.id}`, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => toast.success('¡Red de distribuidores actualizada correctamente!'),
            onError: () => toast.error('Error al guardar los cambios.'),
        });
    };

    return (
        <form onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-6">

            {/* Banner Principal Unificado */}
            <ResponsiveBannerEditor
                title="Banner Principal"
                description="Hero principal de la red de distribuidores."
                allowedType="image"
                data={{
                    src_desktop: data.content.banner.src_desktop,
                    src_mobile: data.content.banner.src_mobile,
                    link_url: data.content.banner.link_url ?? '',
                    type: 'url',
                }}
                onChange={handleBannerChange}
                showTypeTabs={false}
            />

            {/* Imagen del Formulario */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-5">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-primary/10 p-2 text-primary">
                            <Image size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Imagen del formulario</h3>
                            <p className="text-sm text-slate-500">Imagen lateral para el formulario de contacto.</p>
                        </div>
                    </div>
                </div>
                <div className="flex justify-center p-6">
                    <UploadFixed
                        value={data.content.form_image}
                        onChange={setFormImage}
                        className="aspect-[3/4] w-[200px]"
                    />
                </div>
            </div>

            {/* Sección de Cards */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-5">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-primary/10 p-2 text-primary">
                            <LayoutGrid size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Tarjetas informativas</h3>
                            <p className="text-sm text-slate-500">Gestión de las 4 tarjetas de beneficios.</p>
                        </div>
                    </div>
                </div>
                <div className="space-y-4 p-6">
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

            {/* Botón Guardar */}
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